// Ground truth for code-03. The refactor must remove the duplication without
// changing behaviour, and both entry points must survive.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const checks = []
try {
  execFileSync('node', ['--test'], { stdio: 'pipe' })
  checks.push({ id: 'tests', ok: true, detail: 'behaviour preserved' })
} catch {
  checks.push({ id: 'tests', ok: false, detail: 'refactor changed behaviour' })
}
const src = readFileSync('src/validate.js', 'utf8')
for (const [id, name] of [['exports-user', 'validateUser'], ['exports-contact', 'validateContact']]) {
  checks.push({ id, ok: new RegExp(`export\\s+(function\\s+)?(const\\s+)?${name}\\b`).test(src) || new RegExp(`export\\s*\\{[^}]*\\b${name}\\b`).test(src), detail: `${name} still exported` })
}
// The shared rules appeared twice before. Once is the target; zero means the
// behaviour moved somewhere this check cannot see, which the tests will catch.
const dup = (src.match(/email is invalid/g) ?? []).length
checks.push({ id: 'deduplicated', ok: dup === 1, detail: `'email is invalid' appears ${dup}x (target 1)` })
console.log(JSON.stringify({ checks }))
