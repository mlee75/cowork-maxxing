import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateUser, validateContact } from '../src/validate.js'

test('user: accepts a valid record', () => {
  assert.deepEqual(validateUser({ email: 'a@b.com', name: 'Ana', age: 30 }), { ok: true, errors: [] })
})
test('user: rejects bad email and blank name, in that order', () => {
  const r = validateUser({ email: 'nope', name: '  ' })
  assert.equal(r.ok, false)
  assert.deepEqual(r.errors, ['email is invalid', 'name is required'])
})
test('user: rejects a negative age', () => {
  assert.deepEqual(validateUser({ email: 'a@b.com', name: 'Ana', age: -1 }).errors, ['age must be a non-negative integer'])
})
test('user: age is optional', () => {
  assert.equal(validateUser({ email: 'a@b.com', name: 'Ana' }).ok, true)
})
test('contact: accepts a valid record', () => {
  assert.equal(validateContact({ email: 'a@b.com', name: 'Ana', company: 'Acme' }).ok, true)
})
test('contact: rejects a blank company', () => {
  assert.deepEqual(validateContact({ email: 'a@b.com', name: 'Ana', company: ' ' }).errors, ['company must not be blank'])
})
test('contact: has no age rule', () => {
  assert.equal(validateContact({ email: 'a@b.com', name: 'Ana', age: -5 }).ok, true)
})
