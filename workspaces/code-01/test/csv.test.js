import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitCsvLine } from '../src/csv.js'

test('plain fields', () => {
  assert.deepEqual(splitCsvLine('a,b,c'), ['a', 'b', 'c'])
})

test('trims surrounding whitespace', () => {
  assert.deepEqual(splitCsvLine('a , b ,c'), ['a', 'b', 'c'])
})

test('a quoted field may contain a comma', () => {
  assert.deepEqual(splitCsvLine('a,"b,c",d'), ['a', 'b,c', 'd'])
})

test('a quoted field keeps interior whitespace', () => {
  assert.deepEqual(splitCsvLine('a,"  b  ",c'), ['a', '  b  ', 'c'])
})

test('a doubled quote inside a quoted field is one literal quote', () => {
  assert.deepEqual(splitCsvLine('a,"say ""hi""",b'), ['a', 'say "hi"', 'b'])
})

test('an empty field is preserved', () => {
  assert.deepEqual(splitCsvLine('a,,b'), ['a', '', 'b'])
})
