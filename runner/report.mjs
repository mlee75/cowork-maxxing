#!/usr/bin/env node
// Aggregates a scored run: quality vs token cost, with paired confidence
// intervals, skill-firing telemetry, and an explicit refusal to call a
// difference real when the data cannot support it.
// Usage: node runner/report.mjs --run-id <id> [--baseline baseline] [--boot 10000]

import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const flag = (n, d = null) => (argv.indexOf(`--${n}`) === -1 ? d : argv[argv.indexOf(`--${n}`) + 1])
const RUN_ID = flag('run-id')
const BASE = flag('baseline', 'baseline')
const BOOT = Number(flag('boot', 10000))
if (!RUN_ID) { console.error('--run-id required'); process.exit(1) }

const scores = JSON.parse(readFileSync(join(ROOT, 'results', RUN_ID, '_scores.json'), 'utf8'))
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const uniq = (xs) => [...new Set(xs)].sort()

// Seeded PRNG: the same scores must always produce the same interval, or the
// report is not reproducible and neither is anything built on it.
const rng = (seed) => () => ((seed = (seed + 0x6d2b79f5) | 0), (((Math.imul(seed ^ (seed >>> 15), 1 | seed) ^ (seed + Math.imul(seed ^ (seed >>> 7), 61 | seed))) >>> 0) / 4294967296))

const configs = uniq(scores.map((s) => s.config))
const tasks = uniq(scores.map((s) => s.task_id))
const cell = (cfg, task, f = (r) => r.pct) => {
  const rows = scores.filter((s) => s.config === cfg && s.task_id === task)
  return rows.length ? mean(rows.map(f)) : null
}

// Paired bootstrap over TASKS. Tasks differ enormously in difficulty, so an
// unpaired comparison is dominated by which tasks a config happened to run.
function pairedDelta(cfg, base) {
  const pairs = tasks.map((t) => [cell(cfg, t), cell(base, t)]).filter(([a, b]) => a !== null && b !== null).map(([a, b]) => a - b)
  if (pairs.length < 2) return { n: pairs.length, point: pairs.length ? pairs[0] : null, lo: null, hi: null }
  const r = rng(0x5eed)
  const means = []
  for (let i = 0; i < BOOT; i++) {
    let s = 0
    for (let j = 0; j < pairs.length; j++) s += pairs[(r() * pairs.length) | 0]
    means.push(s / pairs.length)
  }
  means.sort((a, b) => a - b)
  return { n: pairs.length, point: mean(pairs), lo: means[Math.floor(BOOT * 0.025)], hi: means[Math.floor(BOOT * 0.975)] }
}

const inTok = (cfg) => mean(scores.filter((s) => s.config === cfg).map((r) => r.usage.input + r.usage.cache_read))
const L = []
L.push(`# Run \`${RUN_ID}\``, '', `${scores.length} scored outputs · ${tasks.length} tasks · ${configs.length} configs · baseline \`${BASE}\` · ${BOOT.toLocaleString()} bootstrap resamples`, '')

// --- headline ---------------------------------------------------------------
L.push('## Quality vs cost', '', '| Config | n | Quality | Δ vs base (95% CI) | Verdict | Input tok | Output tok | $/task |', '|---|---|---|---|---|---|---|---|')
for (const c of configs) {
  const rows = scores.filter((s) => s.config === c)
  const d = c === BASE ? null : pairedDelta(c, BASE)
  let dTxt = '—', verdict = '—'
  if (d && d.lo !== null) {
    dTxt = `${d.point >= 0 ? '+' : ''}${d.point.toFixed(1)} (${d.lo.toFixed(1)}, ${d.hi.toFixed(1)})`
    verdict = d.lo > 0 ? '**better**' : d.hi < 0 ? '**worse**' : 'not distinguishable'
  } else if (d) dTxt = `n=${d.n}, too few paired tasks`
  L.push(`| \`${c}\` | ${rows.length} | ${mean(rows.map((r) => r.pct)).toFixed(1)}% | ${dTxt} | ${verdict} | ${Math.round(inTok(c)).toLocaleString()} | ${Math.round(mean(rows.map((r) => r.usage.output))).toLocaleString()} | $${mean(rows.map((r) => r.cost_usd ?? 0)).toFixed(4)} |`)
}
L.push('', '"Not distinguishable" means the interval crosses zero. It is not a small', 'effect — it is no measured effect, and must not be reported as one.', '')

// --- skill firing: the causal question --------------------------------------
const withTel = scores.filter((s) => s.telemetry)
if (withTel.length) {
  L.push('## Which skills actually fired', '', '| Config | Runs w/ telemetry | Mean skills fired | Runs firing none | Most fired |', '|---|---|---|---|---|')
  for (const c of configs) {
    const rows = withTel.filter((s) => s.config === c)
    if (!rows.length) continue
    const counts = {}
    for (const r of rows) for (const s of r.telemetry.skills_fired) counts[s] = (counts[s] ?? 0) + 1
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} (${v})`).join(', ') || '—'
    L.push(`| \`${c}\` | ${rows.length} | ${mean(rows.map((r) => r.telemetry.skills_fired.length)).toFixed(2)} | ${rows.filter((r) => !r.telemetry.skills_fired.length).length} | ${top} |`)
  }
  L.push('', 'A progressive config that scores badly while firing no skills failed at', 'retrieval. One that scores badly while firing the right skill failed at the', 'rule body. These are different defects and the fix for one does not fix the', 'other — which is why this table exists.', '')
}

// --- judge trust ------------------------------------------------------------
const dis = scores.filter((s) => s.judge_disagreement !== null && s.judge_disagreement !== undefined)
if (dis.length) {
  const rate = mean(dis.map((s) => s.judge_disagreement))
  L.push('## Judge reliability', '', `Panel size ${scores[0]?.judge_panel ?? '?'}. Judges disagreed on **${(rate * 100).toFixed(0)}%** of judged criteria.`, '')
  if (rate > 0.3) L.push(`> Disagreement above 30% means the rubric is underspecified, not that the`, `> outputs are ambiguous. Tighten the criteria before trusting these scores.`, '')
  const detCount = scores.filter((s) => s.deterministic_criteria?.length).length
  if (detCount) L.push(`${detCount} outputs had criteria scored by comparison against ground truth rather than by a judge.`, '')
}

// --- breakdowns -------------------------------------------------------------
L.push('## Per task', '', `| Task | ${configs.map((c) => `\`${c}\``).join(' | ')} |`, `|---|${configs.map(() => '---').join('|')}|`)
for (const t of tasks) L.push(`| ${t} | ${configs.map((c) => { const v = cell(c, t); return v === null ? '—' : `${v.toFixed(0)}%` }).join(' | ')} |`)

// --- suite health -----------------------------------------------------------
L.push('', '## Suite health', '')
let flagged = 0
for (const t of tasks) {
  const per = configs.map((c) => cell(c, t)).filter((v) => v !== null)
  if (per.length < 2) continue
  const spread = Math.max(...per) - Math.min(...per)
  if (spread < 5) { L.push(`- \`${t}\` — spread ${spread.toFixed(1)}pt across configs. Discriminates nothing; cut it.`); flagged++ }
  else if (Math.min(...per) > 95) { L.push(`- \`${t}\` — every config near ceiling. Too easy.`); flagged++ }
}
const reps = uniq(scores.map((s) => s.repeat)).length
if (reps < 2) { L.push(`- Only ${reps} repeat per pair. Within-config variance is unmeasured, so the intervals above understate true uncertainty.`); flagged++ }
if (tasks.length < 5) { L.push(`- Only ${tasks.length} tasks paired. Bootstrap intervals on fewer than ~5 tasks are wide and unstable.`); flagged++ }
if (!flagged) L.push('No issues flagged.')

const md = L.join('\n') + '\n'
writeFileSync(join(ROOT, 'results', RUN_ID, 'REPORT.md'), md)
console.log(md)
