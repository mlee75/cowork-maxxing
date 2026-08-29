import { test } from 'node:test'
import assert from 'node:assert/strict'
import { roundHalfEven } from '../src/rounding.js'
test('ties round to even', () => {
  assert.equal(roundHalfEven(0.5), 0)
  assert.equal(roundHalfEven(1.5), 2)
  assert.equal(roundHalfEven(2.5), 2)
  assert.equal(roundHalfEven(3.5), 4)
})
test('non-ties round normally', () => {
  assert.equal(roundHalfEven(1.4), 1)
  assert.equal(roundHalfEven(1.6), 2)
})
