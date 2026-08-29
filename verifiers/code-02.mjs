// Ground truth for code-02, via mutation testing. Running the tests is not
// enough: an empty test directory passes. The suite must also FAIL against a
// deliberately wrong implementation, or it has not tested the behaviour that
// makes banker's rounding different from Math.round.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The mutant lives with the verifier, never in the workspace: an agent that
// can read the mutant knows exactly which case to test, and the task stops
// measuring anything.
const MUTANT = join(dirname(fileURLToPath(import.meta.url)), 'assets', 'code-02', 'rounding.mutant.js')

const checks = []
const testFiles = (() => { try { return readdirSync('test').filter((f) => f.endsWith('.test.js')) } catch { return [] } })()
checks.push({ id: 'tests-exist', ok: testFiles.length > 0, detail: `${testFiles.length} test file(s)` })

const run = () => { try { execFileSync('node', ['--test'], { stdio: 'pipe' }); return true } catch { return false } }

if (!testFiles.length) {
  checks.push({ id: 'tests-pass', ok: false, detail: 'no tests' })
  checks.push({ id: 'mutant-killed', ok: false, detail: 'no tests' })
} else {
  checks.push({ id: 'tests-pass', ok: run(), detail: 'against the correct implementation' })
  const original = readFileSync('src/rounding.js', 'utf8')
  try {
    copyFileSync(MUTANT, 'src/rounding.js')
    const survived = run()
    checks.push({ id: 'mutant-killed', ok: !survived, detail: survived ? 'mutant survived: tests do not distinguish half-even from half-up' : 'mutant killed' })
  } finally {
    writeFileSync('src/rounding.js', original)
  }
}
console.log(JSON.stringify({ checks }))
