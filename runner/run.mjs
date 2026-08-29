#!/usr/bin/env node
// Executes every (task x config) pair headlessly and records output + token usage.
// Usage: node runner/run.mjs [--dry-run] [--model sonnet] [--tasks a,b] [--configs a,b] [--repeats 3]

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, mkdtempSync, rmSync, cpSync, copyFileSync } from 'node:fs'
import { execFile, execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const flag = (n, d = null) => {
  const i = argv.indexOf(`--${n}`)
  return i === -1 ? d : argv[i + 1]
}
const has = (n) => argv.includes(`--${n}`)

const DRY = has('dry-run')
const MODEL = flag('model', 'sonnet')
const REPEATS = Number(flag('repeats', 1))
const RUN_ID = flag('run-id', new Date().toISOString().replace(/[:.]/g, '-'))
// Skill telemetry needs the streaming format. --no-stream falls back to the
// verified single-object output and records telemetry as null.
const STREAM = !has('no-stream')

const loadJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const pick = (list, csv) => (csv ? list.filter((x) => csv.split(',').includes(x.name ?? x.id)) : list)

const tasks = pick(
  readdirSync(join(ROOT, 'tasks')).filter((f) => f.endsWith('.json')).map((f) => loadJson(join(ROOT, 'tasks', f))),
  flag('tasks')
)
const configs = pick(
  readdirSync(join(ROOT, 'configs'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(ROOT, 'configs', d.name, 'config.json')))
    .map((d) => loadJson(join(ROOT, 'configs', d.name, 'config.json'))),
  flag('configs')
)

if (!tasks.length || !configs.length) {
  console.error('No tasks or no configs matched. Check --tasks / --configs.')
  process.exit(1)
}

// Build the argv for one (task, config) pair.
function buildArgs(task, config) {
  const args = ['-p', task.prompt, '--output-format', 'json', '--model', MODEL]
  args.push(...(config.args ?? []))
  // Fixtures are read-only inputs; grant directory access rather than inlining them,
  // so context cost reflects what the agent actually chose to read.
  for (const f of task.fixtures ?? []) args.push('--add-dir', join(ROOT, f))
  if (config.append_system_prompt_file) {
    args.push('--append-system-prompt', readFileSync(join(ROOT, config.append_system_prompt_file), 'utf8'))
  }
  if (config.plugin_dir) args.push('--plugin-dir', join(ROOT, config.plugin_dir))
  // Code tasks must be able to edit their own workspace copy. Everything else
  // is a read-only sweep and is held to that.
  if (!task.allow_writes) args.push('--disallowed-tools', 'Write,Edit,NotebookEdit')
  args.push('--permission-mode', 'acceptEdits')
  return args
}

// Each code run gets a pristine copy of the workspace, so runs cannot see or
// inherit each other's edits. A config carrying a project memory file has it
// placed in the copy's root, where the CLI discovers it exactly as it would in
// a real repository — which is a different mechanism from injecting the same
// text into the system prompt, and the difference is worth measuring.
function prepareWorkspace(task, config) {
  const src = join(ROOT, task.workspace)
  const dir = mkdtempSync(join(tmpdir(), `cwm-${task.id}-`))
  cpSync(src, dir, { recursive: true })
  if (config.workspace_memory_file) copyFileSync(join(ROOT, config.workspace_memory_file), join(dir, 'CLAUDE.md'))
  return { dir, src }
}

// Ground truth decided by running code, not by a model. The verifier lives in
// verifiers/ and is never copied into the workspace — an agent that can read
// the checks can satisfy them without doing the work.
function verifyWorkspace(dir, verifier) {
  try {
    const out = execFileSync('node', [verifier], { cwd: dir, stdio: 'pipe', timeout: 120000 }).toString()
    const parsed = JSON.parse(out.trim().split('\n').at(-1))
    const checks = parsed.checks ?? []
    return { checks, passed: checks.filter((c) => c.ok).length, total: checks.length, ok: checks.length > 0 && checks.every((c) => c.ok) }
  } catch (e) {
    return { checks: [], passed: 0, total: 0, ok: false, error: String(e.stderr ?? e).slice(0, 300) }
  }
}

// The artifact of a code task is the diff, not the chat text. Capture it for
// the judge, and measure its size — an enormous diff that passes is still a
// review cost, and nothing else in the harness would see that.
function captureDiff(src, dir) {
  try {
    execFileSync('diff', ['-ru', '--exclude=CLAUDE.md', '--exclude=node_modules', src, dir], { stdio: 'pipe' })
    return { diff: '', added: 0, removed: 0, files: 0 }
  } catch (e) {
    const d = (e.stdout?.toString() ?? '')
    const added = (d.match(/^\+(?!\+\+)/gm) ?? []).length
    const removed = (d.match(/^-(?!--)/gm) ?? []).length
    const files = new Set((d.match(/^diff -ru .*/gm) ?? [])).size
    return { diff: d.length > 20000 ? d.slice(0, 20000) + '\n[diff truncated]' : d, added, removed, files }
  }
}

// Two output modes. `json` returns one object whose shape is verified against
// CLI 2.1.221. `stream-json` additionally exposes each tool call, which is the
// only way to see WHICH skills a run actually loaded — the causal question the
// whole benchmark turns on. The stream event shape is NOT verified against live
// output; if it changes, telemetry degrades to null rather than failing the run.
const applyStream = (args, stream) =>
  stream ? [...args.slice(0, args.indexOf('json')), 'stream-json', '--verbose', ...args.slice(args.indexOf('json') + 1)] : args

const runOne = (args, stream, cwd) =>
  new Promise((res) => {
    const started = Date.now()
    const full = applyStream(args, stream)
    execFile('claude', full, { cwd: cwd ?? ROOT, maxBuffer: 128 * 1024 * 1024 }, (err, stdout, stderr) => {
      const wall_ms = Date.now() - started
      if (!stdout) return res({ ok: false, error: String(stderr || err).slice(0, 500), wall_ms })
      if (!stream) {
        try {
          return res({ ok: true, wall_ms, raw: JSON.parse(stdout) })
        } catch {
          return res({ ok: false, error: `unparseable stdout: ${stdout.slice(0, 300)}`, wall_ms })
        }
      }
      const events = []
      for (const line of stdout.split('\n')) {
        const s = line.trim()
        if (!s.startsWith('{')) continue
        try { events.push(JSON.parse(s)) } catch { /* partial line, ignore */ }
      }
      const raw = events.findLast?.((e) => e?.type === 'result') ?? [...events].reverse().find((e) => e?.type === 'result')
      if (!raw) return res({ ok: false, error: `no result event in ${events.length} stream events`, wall_ms })
      res({ ok: true, wall_ms, raw, telemetry: toolTelemetry(events) })
    })
  })

// Walks assistant messages for tool_use blocks. Skill invocations are what we
// care about; other tools are counted because a config that reads more files to
// compensate for a thin rule is a real and otherwise invisible cost.
function toolTelemetry(events) {
  const skills = []
  const tools = {}
  for (const e of events) {
    const content = e?.message?.content
    if (!Array.isArray(content)) continue
    for (const b of content) {
      if (b?.type !== 'tool_use') continue
      tools[b.name] = (tools[b.name] ?? 0) + 1
      if (b.name === 'Skill') {
        const id = b.input?.skill ?? b.input?.name ?? b.input?.command ?? null
        if (id) skills.push(String(id).replace(/^\//, ''))
      }
    }
  }
  return { skills_fired: [...new Set(skills)], skill_invocations: skills.length, tool_calls: tools }
}

const outDir = join(ROOT, 'results', RUN_ID)
if (!DRY) mkdirSync(outDir, { recursive: true })

console.log(`run ${RUN_ID} — ${tasks.length} tasks x ${configs.length} configs x ${REPEATS} repeats = ${tasks.length * configs.length * REPEATS} calls`)

for (const config of configs) {
  for (const task of tasks) {
    for (let rep = 1; rep <= REPEATS; rep++) {
      const args = buildArgs(task, config)
      const label = `${config.name} / ${task.id} / rep${rep}`
      if (DRY) {
        console.log(`\n# ${label}\nclaude ${applyStream(args, STREAM).map((a) => (a.includes(' ') ? JSON.stringify(a.slice(0, 60) + (a.length > 60 ? '…' : '')) : a)).join(' ')}`)
        continue
      }
      process.stdout.write(`  ${label} … `)
      const ws = task.workspace ? prepareWorkspace(task, config) : null
      const r = await runOne(args, STREAM, ws?.dir)
      const verify = ws ? verifyWorkspace(ws.dir, join(ROOT, 'verifiers', `${task.id}.mjs`)) : null
      const diff = ws ? captureDiff(ws.src, ws.dir) : null
      if (ws) rmSync(ws.dir, { recursive: true, force: true })
      const u = r.raw?.usage ?? {}
      const record = {
        run_id: RUN_ID,
        task_id: task.id,
        category: task.category,
        config: config.name,
        repeat: rep,
        model: MODEL,
        ok: r.ok && !r.raw?.is_error,
        error: r.ok ? (r.raw?.is_error ? r.raw?.result : null) : r.error,
        output: r.raw?.result ?? null,
        wall_ms: r.wall_ms,
        num_turns: r.raw?.num_turns ?? null,
        telemetry: r.telemetry ?? null,
        verify,
        diff,
        cost_usd: r.raw?.total_cost_usd ?? null,
        usage: {
          input: u.input_tokens ?? 0,
          output: u.output_tokens ?? 0,
          cache_creation: u.cache_creation_input_tokens ?? 0,
          cache_read: u.cache_read_input_tokens ?? 0
        }
      }
      writeFileSync(join(outDir, `${config.name}__${task.id}__r${rep}.json`), JSON.stringify(record, null, 2))
      const fired = record.telemetry?.skills_fired ?? null
      const v = verify ? `  verify ${verify.passed}/${verify.total}${verify.ok ? ' PASS' : ' FAIL'}` : ''
      const dstat = diff ? `  diff +${diff.added}/-${diff.removed}` : ''
      console.log(
        record.ok
          ? `ok  ${record.usage.input + record.usage.cache_read} in / ${record.usage.output} out  $${(record.cost_usd ?? 0).toFixed(4)}` +
              (fired ? `  skills: ${fired.length ? fired.join(',') : 'none'}` : '') + v + dstat
          : `FAIL ${record.error?.slice(0, 80)}`
      )
    }
  }
}

if (!DRY) console.log(`\nwrote ${outDir}\nnext: node runner/judge.mjs --run-id ${RUN_ID}`)
