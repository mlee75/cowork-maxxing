#!/usr/bin/env node
// Generates every rule-carrying config from corpus/ so that monolith-N and
// progressive-N are guaranteed to contain identical rule content.
// Hand-editing configs/monolith-*/ or configs/progressive-*/ will be overwritten.
// Usage: node runner/build-configs.mjs

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SIZES = [8, 25, 60]

const rules = readdirSync(join(ROOT, 'corpus'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = readFileSync(join(ROOT, 'corpus', f), 'utf8')
    const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw)
    if (!m) throw new Error(`corpus/${f}: missing frontmatter`)
    const fm = Object.fromEntries(
      m[1].split('\n').map((l) => {
        const i = l.indexOf(':')
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
      })
    )
    if (!fm.id || !fm.tier || !fm.description) throw new Error(`corpus/${f}: needs id, tier, description`)
    return { id: fm.id, tier: Number(fm.tier), description: fm.description, body: m[2].trim() }
  })
  // Deterministic order: tier, then id. Rule order must not vary between runs.
  .sort((a, b) => a.tier - b.tier || a.id.localeCompare(b.id))

const byTier = (n) => {
  const sel = rules.filter((r) => (n === 8 ? r.tier === 1 : n === 25 ? r.tier <= 2 : true))
  if (sel.length !== n) throw new Error(`size ${n}: corpus holds ${sel.length} rules at that tier, expected ${n}`)
  return sel
}

const title = (id) => id.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())
const fresh = (p) => {
  if (existsSync(p)) rmSync(p, { recursive: true })
  mkdirSync(p, { recursive: true })
  return p
}

// Body-length variants at fixed rule count, for the ratio experiment.
// Descriptions are held byte-identical; only bodies change.
const VARIANTS = [
  { suffix: '-terse', dir: 'corpus/variants/terse' },
  { suffix: '-long', dir: 'corpus/variants/long' }
]
const RATIO_SIZE = 25

const withBodies = (sel, dir) =>
  sel.map((r) => {
    const f = join(ROOT, dir, `${r.id}.md`)
    if (!existsSync(f)) throw new Error(`${dir}/${r.id}.md missing — every rule needs every variant or the sweep compares different corpora`)
    return { ...r, body: readFileSync(f, 'utf8').trim() }
  })

const jobs = SIZES.map((n) => ({ label: String(n), sel: byTier(n) }))
for (const v of VARIANTS) jobs.push({ label: `${RATIO_SIZE}${v.suffix}`, sel: withBodies(byTier(RATIO_SIZE), v.dir) })

const rows = []
for (const { label, sel } of jobs) {
  const n = sel.length

  // --- monolith-N : every body concatenated into one always-on file -------
  const mDir = fresh(join(ROOT, 'configs', `monolith-${label}`))
  const md = [`# House standards`, '', `Apply these to all work.`, '', ...sel.flatMap((r) => [`## ${title(r.id)}`, '', r.body, ''])].join('\n')
  writeFileSync(join(mDir, 'CLAUDE.md'), md)
  writeFileSync(
    join(mDir, 'config.json'),
    JSON.stringify(
      {
        name: `monolith-${label}`,
        description: `${n} rules in one always-on memory file. Generated from corpus/ — do not hand-edit.`,
        args: ['--setting-sources', '', '--strict-mcp-config'],
        append_system_prompt_file: `configs/monolith-${label}/CLAUDE.md`,
        carries_rules: true,
        rule_count: n,
        generated: true
      },
      null,
      2
    )
  )

  // --- progressive-N : the same bodies, loaded on demand -------------------
  const pDir = fresh(join(ROOT, 'configs', `progressive-${label}`))
  mkdirSync(join(pDir, '.claude-plugin'), { recursive: true })
  writeFileSync(
    join(pDir, '.claude-plugin', 'plugin.json'),
    JSON.stringify({ name: `house-standards-${label}`, version: '0.1.0', description: `The ${label} corpus as on-demand skills.` }, null, 2)
  )
  for (const r of sel) {
    const sDir = join(pDir, 'skills', r.id)
    mkdirSync(sDir, { recursive: true })
    writeFileSync(join(sDir, 'SKILL.md'), `---\nname: ${r.id}\ndescription: ${r.description}\n---\n\n${r.body}\n`)
  }
  writeFileSync(
    join(pDir, 'config.json'),
    JSON.stringify(
      {
        name: `progressive-${label}`,
        description: `The same ${n} rules as on-demand skills. Generated from corpus/ — do not hand-edit.`,
        args: ['--setting-sources', '', '--strict-mcp-config'],
        plugin_dir: `configs/progressive-${label}`,
        carries_rules: true,
        rule_count: n,
        generated: true
      },
      null,
      2
    )
  )

  // --- the crossover measurement ------------------------------------------
  // Always-on cost is what sits in context before the agent does anything:
  // the whole file for monolith, name + description only for progressive.
  const monoOn = md.length
  const progOn = sel.reduce((a, r) => a + `name: ${r.id}\ndescription: ${r.description}\n`.length, 0)
  const progDemand = sel.reduce((a, r) => a + r.body.length, 0)
  rows.push({ n: label, monoOn, progOn, progDemand, meanBody: Math.round(progDemand / n), meanDesc: Math.round(sel.reduce((a, r) => a + r.description.length, 0) / n), saving: +(((monoOn - progOn) / monoOn) * 100).toFixed(1) })
}

// chars/4 is a rough English proxy, stated as an approximation rather than a measurement.
const tok = (c) => Math.round(c / 4)
const lines = [
  '# Always-on context cost by corpus size',
  '',
  'Generated by `runner/build-configs.mjs`. Character counts are exact;',
  'token figures are chars/4, a rough English proxy, not a tokenizer result.',
  '',
  '| Config | Mean body | Mean desc | Body:desc | `monolith` always-on | `progressive` always-on | Saving | On demand |',
  '|---|---|---|---|---|---|---|---|'
]
for (const r of rows) {
  lines.push(
    `| \`-${r.n}\` | ${r.meanBody.toLocaleString()} ch | ${r.meanDesc.toLocaleString()} ch | ${(r.meanBody / r.meanDesc).toFixed(2)} | ${r.monoOn.toLocaleString()} ch (~${tok(r.monoOn).toLocaleString()} tok) | ${r.progOn.toLocaleString()} ch (~${tok(r.progOn).toLocaleString()} tok) | **${r.saving}%** | ${r.progDemand.toLocaleString()} ch |`
  )
}
lines.push(
  '',
  'Saving is the reduction in what sits in context on every turn before any',
  'skill fires. It is not a claim about total tokens spent on a task — a task',
  'that triggers four skills pays for four bodies, and `run.mjs` measures that.',
  ''
)
writeFileSync(join(ROOT, 'configs', 'CONTEXT-COST.md'), lines.join('\n'))
console.log(lines.join('\n'))

// ---------------------------------------------------------------------------
// Claude Code side: the same rule corpus delivered three ways, one of which is
// the mechanism Claude Code users actually have — a CLAUDE.md in the project
// root that is auto-loaded. That is not the same as injecting the text into
// the system prompt, and whether it behaves the same is an open question this
// benchmark can now answer.
// ---------------------------------------------------------------------------
const codeRules = readdirSync(join(ROOT, 'corpus-code'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = readFileSync(join(ROOT, 'corpus-code', f), 'utf8')
    const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw)
    if (!m) throw new Error(`corpus-code/${f}: missing frontmatter`)
    const fm = Object.fromEntries(m[1].split('\n').map((l) => { const i = l.indexOf(':'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }))
    return { id: fm.id, description: fm.description, body: m[2].trim() }
  })
  .sort((a, b) => a.id.localeCompare(b.id))

const codeMd = ['# Project conventions', '', 'These apply to all code in this repository.', '', ...codeRules.flatMap((r) => [`## ${title(r.id)}`, '', r.body, ''])].join('\n')
const baseArgs = ['--setting-sources', '', '--strict-mcp-config']

const codeBaseline = fresh(join(ROOT, 'configs', 'code-baseline'))
writeFileSync(join(codeBaseline, 'config.json'), JSON.stringify({ name: 'code-baseline', description: 'No conventions supplied. The floor for code tasks.', args: baseArgs, carries_rules: false, domain: 'code', generated: true }, null, 2))

// Delivery 1: a real CLAUDE.md dropped into the project root of each run's
// workspace copy. run.mjs places it; the CLI discovers it the way it would in
// any real repository.
const codeMdDir = fresh(join(ROOT, 'configs', 'code-claude-md'))
writeFileSync(join(codeMdDir, 'CLAUDE.md'), codeMd)
writeFileSync(join(codeMdDir, 'config.json'), JSON.stringify({ name: 'code-claude-md', description: 'Conventions as a CLAUDE.md in the project root, discovered the way Claude Code discovers one in a real repo.', args: ['--strict-mcp-config'], workspace_memory_file: 'configs/code-claude-md/CLAUDE.md', carries_rules: true, domain: 'code', generated: true }, null, 2))

// Delivery 2: the identical text injected into the system prompt.
const codeMono = fresh(join(ROOT, 'configs', 'code-monolith'))
writeFileSync(join(codeMono, 'CLAUDE.md'), codeMd)
writeFileSync(join(codeMono, 'config.json'), JSON.stringify({ name: 'code-monolith', description: 'The same conventions injected into the system prompt rather than discovered as a project file.', args: baseArgs, append_system_prompt_file: 'configs/code-monolith/CLAUDE.md', carries_rules: true, domain: 'code', generated: true }, null, 2))

// Delivery 3: the identical bodies as on-demand skills.
const codeProg = fresh(join(ROOT, 'configs', 'code-progressive'))
mkdirSync(join(codeProg, '.claude-plugin'), { recursive: true })
writeFileSync(join(codeProg, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: 'project-conventions', version: '0.1.0', description: 'Project coding conventions as on-demand skills.' }, null, 2))
for (const r of codeRules) {
  mkdirSync(join(codeProg, 'skills', r.id), { recursive: true })
  writeFileSync(join(codeProg, 'skills', r.id, 'SKILL.md'), `---\nname: ${r.id}\ndescription: ${r.description}\n---\n\n${r.body}\n`)
}
writeFileSync(join(codeProg, 'config.json'), JSON.stringify({ name: 'code-progressive', description: 'The same conventions as on-demand skills.', args: baseArgs, plugin_dir: 'configs/code-progressive', carries_rules: true, domain: 'code', generated: true }, null, 2))

const codeOn = codeRules.reduce((a, r) => a + `name: ${r.id}\ndescription: ${r.description}\n`.length, 0)
console.log(`\ncode configs: ${codeRules.length} rules · claude-md/monolith always-on ${codeMd.length} ch · progressive always-on ${codeOn} ch (${(((codeMd.length - codeOn) / codeMd.length) * 100).toFixed(1)}% lighter)`)
