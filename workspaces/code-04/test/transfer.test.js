import { test } from 'node:test'
import assert from 'node:assert/strict'
import { transfer } from '../src/transfer.js'

test('moves funds between accounts', () => {
  const r = transfer({ id: 'a', balance: 100 }, { id: 'b', balance: 5 }, 30)
  assert.equal(r.from.balance, 70)
  assert.equal(r.to.balance, 35)
})

test('rejects an overdraft', () => {
  assert.throws(() => transfer({ id: 'a', balance: 10 }, { id: 'b', balance: 0 }, 30))
})

test('rejects a non-positive amount', () => {
  assert.throws(() => transfer({ id: 'a', balance: 10 }, { id: 'b', balance: 0 }, 0))
})

test('does not mutate its inputs', () => {
  const from = { id: 'a', balance: 100 }
  transfer(from, { id: 'b', balance: 0 }, 10)
  assert.equal(from.balance, 100)
})
