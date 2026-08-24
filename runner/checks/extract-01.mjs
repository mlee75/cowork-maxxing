// Deterministic scoring for extract-01, which has ground truth in
// fixtures/extract-01/EXPECTED.csv. Criteria e1 (completeness), e2 (accuracy)
// and e3 (ambiguity flagged) are decided by comparison, not by a judge.
// The remaining criteria stay with the judge — format and commentary are
// genuinely qualitative.

import { readFileSync } from 'node:fs'

const splitCsvLine = (line) => {
  const out = []
  let cur = '', q = false
  for (const ch of line) {
    if (ch === '"') q = !q
    else if (ch === ',' && !q) { out.push(cur); cur = '' }
    else cur += ch
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

const norm = (s) => (s ?? '').toString().trim().toLowerCase().replace(/^"|"$/g, '').replace(/\s+/g, ' ')
const num = (s) => {
  const n = Number(norm(s).replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : null
}

// Pull the widest comma-table out of a free-text answer: a fenced block if one
// exists, otherwise the longest run of lines that parse to the same arity.
function extractRows(text) {
  const fenced = [...text.matchAll(/```(?:csv)?\s*\n([\s\S]*?)```/g)].map((m) => m[1])
  const candidates = fenced.length ? fenced : [text]
  let best = []
  for (const block of candidates) {
    const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.includes(','))
    let run = []
    for (const l of lines) {
      const cells = splitCsvLine(l)
      if (cells.length >= 5) run.push(cells)
      else {
        if (run.length > best.length) best = run
        run = []
      }
    }
    if (run.length > best.length) best = run
  }
  // Drop a header row if the first cell looks like a column name.
  if (best.length && /vendor|invoice/i.test(best[0][0] ?? '')) best = best.slice(1)
  return best
}

export default function scoreExtract01(outputText, fixtureDir) {
  const expLines = readFileSync(`${fixtureDir}/EXPECTED.csv`, 'utf8').trim().split('\n').slice(1)
  const expected = expLines.map(splitCsvLine).map((c) => ({
    vendor: norm(c[0]), invoice: norm(c[1]), date: norm(c[2]), currency: norm(c[3]), amount: num(c[4]), ambiguous: norm(c[6])
  }))
  const got = extractRows(outputText).map((c) => ({ cells: c, amounts: c.map(num).filter((n) => n !== null) }))

  // Match on invoice id + amount, the two fields that identify a line item.
  const matched = expected.filter((e) =>
    got.some((g) => g.cells.some((cell) => norm(cell).includes(e.invoice)) && g.amounts.some((a) => Math.abs(a - e.amount) < 0.005))
  )
  const completeness = matched.length / expected.length

  // Accuracy: of the rows we found, do currency and vendor also line up?
  const accurate = matched.filter((e) =>
    got.some((g) => {
      const row = g.cells.map(norm).join(' ')
      return row.includes(e.invoice) && row.includes(e.currency) && e.vendor.split(' ')[0] && row.includes(e.vendor.split(' ')[0])
    })
  )
  const accuracy = matched.length ? accurate.length / matched.length : 0

  // Ambiguity: both raw strings must survive, and neither may be normalised
  // into a real date somewhere in the answer.
  const t = outputText
  const rawsPresent = ['03/04/2026', '2026-13-01'].filter((r) => t.includes(r))
  const coerced = [/2026-03-04/, /2026-04-03/, /2027-01-01/, /2026-12-01/].filter((re) => re.test(t))
  const ambiguity = rawsPresent.length === 2 && coerced.length === 0 ? 2 : rawsPresent.length >= 1 && coerced.length === 0 ? 1 : 0

  const band = (x) => (x >= 0.99 ? 2 : x >= 0.7 ? 1 : 0)
  return {
    scores: [
      { id: 'e1', score: band(completeness), evidence: `matched ${matched.length}/${expected.length} expected line items` },
      { id: 'e2', score: band(accuracy), evidence: `${accurate.length}/${matched.length || 0} matched rows agree on vendor and currency` },
      { id: 'e3', score: ambiguity, evidence: `raw values present: ${rawsPresent.length}/2; coerced values found: ${coerced.length}` }
    ],
    deterministic: ['e1', 'e2', 'e3']
  }
}
