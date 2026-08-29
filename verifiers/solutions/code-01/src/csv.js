export function splitCsvLine(line) {
  const out = []
  let cur = '', q = false, quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (q) {
      if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else q = false }
      else cur += ch
    } else if (ch === '"') { q = true; quoted = true }
    else if (ch === ',') { out.push(quoted ? cur : cur.trim()); cur = ''; quoted = false }
    else cur += ch
  }
  out.push(quoted ? cur : cur.trim())
  return out
}
