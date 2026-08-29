// Ground truth for code-04. Tests check behaviour; the convention check is
// separate, because following the house error convention is exactly what the
// tests CANNOT see — which is the point of the task.
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
const checks = []
try {
  execFileSync('node', ['--test'], { stdio: 'pipe' })
  checks.push({ id: 'tests', ok: true, detail: 'transfer behaves correctly' })
} catch (e) {
  const out = (e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? '')
  checks.push({ id: 'tests', ok: false, detail: /Cannot find module/.test(out) ? 'src/transfer.js not created' : 'failing tests' })
}
if (!existsSync('src/transfer.js')) {
  checks.push({ id: 'uses-app-error', ok: false, detail: 'no transfer.js' })
  checks.push({ id: 'no-bare-error', ok: false, detail: 'no transfer.js' })
  checks.push({ id: 'error-codes', ok: false, detail: 'no transfer.js' })
} else {
  const src = readFileSync('src/transfer.js', 'utf8')
  checks.push({ id: 'uses-app-error', ok: /AppError/.test(src) && /from\s+['"]\.\/errors\.js['"]/.test(src), detail: 'imports and uses AppError' })
  checks.push({ id: 'no-bare-error', ok: !/throw\s+new\s+(Error|TypeError|RangeError)\s*\(/.test(src), detail: 'no bare Error thrown' })
  const codes = [...src.matchAll(/new AppError\(\s*['"]([A-Z0-9_]+)['"]/g)].map((m) => m[1])
  checks.push({ id: 'error-codes', ok: codes.length >= 2, detail: `SCREAMING_SNAKE codes found: ${codes.join(', ') || 'none'}` })
}
console.log(JSON.stringify({ checks }))
