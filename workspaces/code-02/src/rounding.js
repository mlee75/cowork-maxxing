// Banker's rounding: ties go to the nearest even digit, not always up.
// This is the correct implementation. Do not change it.
export function roundHalfEven(x, dp = 0) {
  const f = 10 ** dp
  const scaled = x * f
  const floor = Math.floor(scaled)
  const diff = scaled - floor
  if (Math.abs(diff - 0.5) > Number.EPSILON) return Math.round(scaled) / f
  return (floor % 2 === 0 ? floor : floor + 1) / f
}
