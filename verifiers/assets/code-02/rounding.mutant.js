// Deliberately wrong: rounds ties away from zero instead of to even.
// A test suite that does not fail against this file has not tested the
// behaviour that makes roundHalfEven worth having.
export function roundHalfEven(x, dp = 0) {
  const f = 10 ** dp
  return Math.round(x * f) / f
}
