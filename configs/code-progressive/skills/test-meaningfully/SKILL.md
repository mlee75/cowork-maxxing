---
name: test-meaningfully
description: Rule for what a test must actually demonstrate. Use when writing, reviewing, or adding tests.
---

A test suite that would still pass against a deliberately wrong implementation has not tested anything.

Before writing a test, name the specific wrong behaviour it rules out. For a rounding function that breaks ties to even, a test that asserts `round(1.4) === 1` rules out nothing — `Math.round` passes it too. The test that matters asserts `round(2.5) === 2`.

Test the boundary, the tie, the empty input, and the case the obvious wrong implementation gets wrong. Coverage of the happy path is the least informative kind of coverage.
