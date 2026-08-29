#!/usr/bin/env node
// Proves the ground-truth machinery works, without calling a model:
// every verifier must FAIL on the untouched workspace and PASS on the
// reference solution. A verifier that cannot do both is measuring nothing.
// Usage: node runner/selftest.mjs

import { mkdtempSync, cpSync, rmSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tasks = readdirSync(join(ROOT, 'tasks'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(execFileSync('cat', [join(ROOT, 'tasks', f)]).toString()))
  .filter((t) => t.workspace && t.verify)
  .sort((a, b) => a.id.localeCompare(b.id))

const verify = (dir, id) => {
  try {
    const out = execFileSync('node', [join(ROOT, 'verifiers', `${id}.mjs`)], { cwd: dir, stdio: 'pipe', timeout: 120000 }).toString()
    const { checks } = JSON.parse(out.trim().split('\n').at(-1))
    return { passed: checks.filter((c) => c.ok).length, total: checks.length, ok: checks.every((c) => c.ok), checks }
  } catch (e) {
    return { passed: 0, total: 0, ok: false, error: String(e.stderr ?? e).slice(0, 200) }
  }
}

const stage = (task, withSolution) => {
  const dir = mkdtempSync(join(tmpdir(), `cwm-selftest-${task.id}-`))
  cpSync(join(ROOT, task.workspace), dir, { recursive: true })
  if (withSolution) {
    const sol = join(ROOT, 'verifiers', 'solutions', task.id)
    if (!existsSync(sol)) throw new Error(`no reference solution for ${task.id}`)
    cpSync(sol, dir, { recursive: true })
  }
  return dir
}

let failures = 0
for (const task of tasks) {
  // code-03 starts green by design — its failure mode is regression, not
  // non-completion — so "before" is only required to be incomplete, not failing.
  const startsGreen = task.category === 'code-refactor'
  const before = stage(task, false)
  const b = verify(before, task.id)
  rmSync(before, { recursive: true, force: true })

  const after = stage(task, true)
  const a = verify(after, task.id)
  rmSync(after, { recursive: true, force: true })

  const beforeOk = startsGreen ? !b.ok : !b.ok
  const ok = beforeOk && a.ok
  if (!ok) failures++
  console.log(
    `${ok ? 'ok  ' : 'FAIL'} ${task.id.padEnd(9)} untouched ${b.passed}/${b.total}${b.ok ? ' (PASSES — task is not failable)' : ''}` +
      `   solution ${a.passed}/${a.total}${a.ok ? '' : ' (DOES NOT PASS — verifier unsatisfiable)'}`
  )
  if (!a.ok) for (const c of a.checks ?? []) if (!c.ok) console.log(`       unmet: ${c.id} — ${c.detail}`)
  if (a.error) console.log(`       error: ${a.error}`)
}
console.log(failures ? `\n${failures} verifier(s) broken` : `\nall ${tasks.length} verifiers fail before and pass after`)
process.exit(failures ? 1 : 0)
