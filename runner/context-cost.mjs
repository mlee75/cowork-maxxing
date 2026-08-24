#!/usr/bin/env node
// Measures each config's REAL always-on context cost by running a trivial prompt
// under it and reading actual token usage, rather than estimating from file size.
// The delta against `baseline` is what that config costs before doing any work.
// Usage: node runner/context-cost.mjs [--model sonnet] [--repeats 2]

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const flag = (n, d = null) => (argv.indexOf(`--${n}`) === -1 ? d : argv[argv.indexOf(`--${n}`) + 1])
const MODEL = flag('model', 'sonnet')
const REPEATS = Number(flag('repeats', 2))

// Deliberately trivial: we want the floor, not a task. Anything that makes the
// model think or read files contaminates the measurement with work.
const PROBE = 'Reply with exactly the word: ok'

const configs = readdirSync(join(ROOT, 'configs'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(ROOT, 'configs', d.name, 'config.json')))
  .map((d) => JSON.parse(readFileSync(join(ROOT, 'configs', d.name, 'config.json'), 'utf8')))
  .sort((a, b) => a.name.localeCompare(b.name))

const run = (config) =>
  new Promise((res) => {
    const args = ['-p', PROBE, '--output-format', 'json', '--model', MODEL, ...(config.args ?? [])]
    if (config.append_system_prompt_file) args.push('--append-system-prompt', readFileSync(join(ROOT, config.append_system_prompt_file), 'utf8'))
    if (config.plugin_dir) args.push('--plugin-dir', join(ROOT, config.plugin_dir))
    args.push('--disallowed-tools', 'Write,Edit,Bash,Read,Glob,Grep')
    execFile('claude', args, { cwd: ROOT, maxBuffer: 16 * 1024 * 1024 }, (err, stdout) => {
      try {
        const r = JSON.parse(stdout)
        if (r.is_error) return res({ ok: false, error: r.result })
        const u = r.usage ?? {}
        // Cache reads and cache creation are both context the model was given.
        res({ ok: true, tokens: (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) })
      } catch (e) {
        res({ ok: false, error: String(err ?? e).slice(0, 200) })
      }
    })
  })

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
const out = []
for (const c of configs) {
  const runs = []
  for (let i = 0; i < REPEATS; i++) {
    const r = await run(c)
    if (r.ok) runs.push(r.tokens)
    else console.error(`  ${c.name}: ${r.error}`)
  }
  if (!runs.length) {
    console.error(`  ${c.name}: all probes failed, skipping`)
    continue
  }
  // Spread across identical probes is measurement noise; report it so a reader
  // can see whether a small delta is real.
  out.push({ config: c.name, tokens: median(runs), spread: Math.max(...runs) - Math.min(...runs), n: runs.length })
  console.log(`  ${c.name.padEnd(24)} ${median(runs).toLocaleString().padStart(8)} tok  (spread ${Math.max(...runs) - Math.min(...runs)})`)
}

const base = out.find((o) => o.config === 'baseline')
const lines = [
  '# Measured always-on context cost',
  '',
  `Real token counts from the API, not estimated from file size. Probe: \`${PROBE}\`.`,
  `Model \`${MODEL}\`, median of ${REPEATS} runs per config.`,
  '',
  '| Config | Total context | Cost of the config itself | Probe spread |',
  '|---|---|---|---|'
]
for (const o of out) {
  const overhead = base ? o.tokens - base.tokens : null
  lines.push(`| \`${o.config}\` | ${o.tokens.toLocaleString()} | ${overhead === null ? '—' : (overhead === 0 ? '0' : `${overhead > 0 ? '+' : ''}${overhead.toLocaleString()}`)} | ${o.spread} |`)
}
lines.push(
  '',
  '"Cost of the config itself" is the delta against `baseline` — what this',
  'configuration adds to every single turn before any work happens. It is a',
  'measurement, not the chars/4 estimate in `CONTEXT-COST.md`; where the two',
  'disagree, this file is right.',
  '',
  'A spread larger than the delta between two configs means those two configs',
  'are not distinguishable by this probe. Do not report such a difference.',
  ''
)
writeFileSync(join(ROOT, 'configs', 'CONTEXT-COST-MEASURED.md'), lines.join('\n'))
console.log(`\nwrote configs/CONTEXT-COST-MEASURED.md`)
