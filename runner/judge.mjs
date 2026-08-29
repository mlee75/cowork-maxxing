#!/usr/bin/env node
// Blind-scores every result in a run against its task rubric.
// The judge never sees which config produced an output.
// Usage: node runner/judge.mjs --run-id <id> [--model opus] [--judges 3]

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { existsSync } from 'node:fs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const flag = (n, d = null) => {
  const i = argv.indexOf(`--${n}`)
  return i === -1 ? d : argv[i + 1]
}

const RUN_ID = flag('run-id')
const JUDGE_MODEL = flag('model', 'opus')
const JUDGES = Number(flag('judges', 1))
if (!RUN_ID) {
  console.error('--run-id required')
  process.exit(1)
}

const loadJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const runDir = join(ROOT, 'results', RUN_ID)
const files = readdirSync(runDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
const tasks = Object.fromEntries(
  readdirSync(join(ROOT, 'tasks')).filter((f) => f.endsWith('.json')).map((f) => {
    const t = loadJson(join(ROOT, 'tasks', f))
    return [t.id, t]
  })
)

function judgePrompt(task, rubric, output, diff) {
  return [
    'You are scoring one output against a rubric. You are not improving it and not commenting on it.',
    '',
    'You do not know which system configuration produced this output. Do not speculate about it.',
    'Score only what the text in fact says. Do not credit intent, and do not penalise for anything the rubric does not name.',
    '',
    `## The task that was given\n\n${task.prompt}`,
    '',
    `## Scoring scale\n\n${rubric.scale}`,
    '',
    `## Criteria\n\n${rubric.criteria.map((c) => `- **${c.id}** (weight ${c.weight}): ${c.text}`).join('\n')}`,
    '',
    // For a code task the artifact is the diff. Judging the chat text instead
    // rewards a good explanation of a bad change.
    diff
      ? `## The change that was made\n\n<diff>\n${diff}\n</diff>\n\n## What the agent said about it\n\n<output>\n${output}\n</output>`
      : `## The output being scored\n\n<output>\n${output}\n</output>`,
    '',
    'Return ONLY a JSON object, no prose and no code fence, of the form:',
    '{"scores":[{"id":"<criterion id>","score":0|1|2,"evidence":"<= 25 words quoting or pointing at what decided it"}]}'
  ].join('\n')
}

const ask = (prompt) =>
  new Promise((res) => {
    execFile(
      'claude',
      ['-p', prompt, '--output-format', 'json', '--model', JUDGE_MODEL, '--setting-sources', '', '--strict-mcp-config', '--disallowed-tools', 'Write,Edit,Bash'],
      { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 },
      (err, stdout) => {
        try {
          const raw = JSON.parse(stdout)
          const text = (raw.result ?? '').replace(/^```(?:json)?|```$/gm, '').trim()
          res({ ok: true, parsed: JSON.parse(text), cost: raw.total_cost_usd ?? 0 })
        } catch (e) {
          res({ ok: false, error: String(err ?? e).slice(0, 300) })
        }
      }
    )
  })

const weighted = (rubric, scores) => {
  const byId = Object.fromEntries(scores.map((s) => [s.id, s.score]))
  let got = 0, max = 0
  for (const c of rubric.criteria) {
    max += c.weight * 2
    got += c.weight * (byId[c.id] ?? 0)
  }
  return { points: got, max, pct: max ? +((got / max) * 100).toFixed(1) : 0 }
}

const out = []
for (const f of files) {
  const rec = loadJson(join(runDir, f))
  if (!rec.ok || (!rec.output && !rec.diff?.diff)) {
    console.log(`  skip ${f} (run failed)`)
    continue
  }
  const task = tasks[rec.task_id]
  const rubric = loadJson(join(ROOT, task.rubric))
  process.stdout.write(`  judging ${rec.config}/${rec.task_id}/r${rec.repeat} … `)

  // Criteria with ground truth are decided by comparison, never by a judge.
  let det = null
  const checkPath = join(ROOT, 'runner', 'checks', `${rec.task_id}.mjs`)
  if (existsSync(checkPath) && task.fixtures?.length) {
    try {
      const mod = await import(pathToFileURL(checkPath).href)
      det = mod.default(rec.output, join(ROOT, task.fixtures[0]))
    } catch (e) {
      console.log(`(deterministic check failed: ${String(e).slice(0, 60)}) `)
    }
  }

  const panel = []
  for (let j = 0; j < JUDGES; j++) {
    const r = await ask(judgePrompt(task, rubric, rec.output, rec.diff?.diff || null))
    if (r.ok) panel.push(r.parsed.scores)
  }
  if (!panel.length && !det) {
    console.log('JUDGE FAILED')
    continue
  }

  // Median across the panel per criterion, so one erratic judge cannot move a
  // score. Disagreement is recorded rather than smoothed away: a criterion the
  // panel cannot agree on is a criterion whose score should not be trusted.
  let disagreements = 0, judged = 0
  const merged = rubric.criteria.map((c) => {
    const fixed = det?.scores.find((s) => s.id === c.id)
    if (fixed) return { ...fixed, source: 'deterministic' }
    const vals = panel.map((p) => p.find((s) => s.id === c.id)?.score ?? 0).sort((a, b) => a - b)
    if (vals.length > 1) {
      judged++
      if (vals[0] !== vals[vals.length - 1]) disagreements++
    }
    return { id: c.id, score: vals[Math.floor(vals.length / 2)], spread: vals.length > 1 ? vals[vals.length - 1] - vals[0] : 0, source: 'judge' }
  })
  const score = weighted(rubric, merged)
  out.push({
    ...score,
    task_id: rec.task_id,
    category: rec.category,
    config: rec.config,
    repeat: rec.repeat,
    criteria: merged,
    judge_panel: panel.length,
    judge_disagreement: judged ? +(disagreements / judged).toFixed(2) : null,
    deterministic_criteria: det?.deterministic ?? [],
    telemetry: rec.telemetry ?? null,
    verify: rec.verify ?? null,
    diff_size: rec.diff ? { added: rec.diff.added, removed: rec.diff.removed, files: rec.diff.files } : null,
    usage: rec.usage,
    cost_usd: rec.cost_usd,
    wall_ms: rec.wall_ms
  })
  console.log(`${score.pct}%${rec.verify ? ` · verify ${rec.verify.passed}/${rec.verify.total}${rec.verify.ok ? ' PASS' : ' FAIL'}` : ''}${det ? ` (${det.deterministic.length} criteria measured, not judged)` : ''}${judged && disagreements ? ` [panel split on ${disagreements}/${judged}]` : ''}`)
}

writeFileSync(join(runDir, '_scores.json'), JSON.stringify(out, null, 2))
console.log(`\nwrote ${join(runDir, '_scores.json')}\nnext: node runner/report.mjs --run-id ${RUN_ID}`)
