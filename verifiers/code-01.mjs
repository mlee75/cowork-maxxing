// Ground truth for code-01. Exit code of the suite is the whole answer.
import { execFileSync } from 'node:child_process'
const checks = []
try {
  execFileSync('node', ['--test'], { stdio: 'pipe' })
  checks.push({ id: 'tests', ok: true, detail: 'all tests pass' })
} catch (e) {
  const out = (e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? '')
  const fails = (out.match(/^not ok /gm) ?? []).length
  checks.push({ id: 'tests', ok: false, detail: `${fails || '?'} failing test(s)` })
}
console.log(JSON.stringify({ checks }))
