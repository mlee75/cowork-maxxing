// Splits one CSV line into fields.
export function splitCsvLine(line) {
  return line.split(',').map((s) => s.trim())
}
