# Project conventions

These apply to all code in this repository.

## Error handling

Throw `AppError` from `src/errors.js`, never a bare `Error`, `TypeError`, or `RangeError`.

Every `AppError` takes a machine-readable code as its first argument, in SCREAMING_SNAKE_CASE, then a human-readable message, then an optional context object.

    throw new AppError('INSUFFICIENT_FUNDS', 'source account lacks funds', { balance, amount })

The code is what callers branch on and what appears in logs and dashboards; the message is for a human reading a stack trace and may be reworded freely. Never branch on message text.

One distinct code per distinct failure. Two preconditions that fail for different reasons get two codes, even where the message would read the same.

## No input mutation

Do not mutate arguments. Return new objects.

    return { ...account, status: 'closed' }   // yes
    account.status = 'closed'; return account // no

A caller cannot see that a function mutated what they passed until something else breaks, usually far away and much later. This applies to arrays as strictly as to objects: prefer `toSorted`, `with`, and spreads over `sort`, index assignment, and `push` on an argument.

## Parsing edge cases

Text formats have escapes, and a naive `split` is wrong on all of them.

Before writing a parser, enumerate: the delimiter appearing inside a quoted region, the quote character escaped inside a quoted region, empty fields, leading and trailing whitespace, and a trailing delimiter.

Decide explicitly whether whitespace inside quotes is significant. It usually is, and trimming it is a silent data change.

If the format has a specification, the specification decides these questions, not intuition.

## Refactor safety

A refactor changes structure and nothing else. Every existing export keeps its name, signature, and observable behaviour, including the order and wording of anything it returns.

Run the existing tests before and after. If a test needs changing to accommodate the refactor, it is not a refactor — it is a behaviour change wearing a refactor's name, and it needs to be proposed as one.

Extract shared logic only where the duplication is genuinely the same rule. Two functions that happen to validate email today may diverge tomorrow; unifying them couples decisions that were independent.

## Standard library first

Solve it with the standard library unless the task explicitly asks for a dependency.

Node's built-ins cover testing (`node:test`), assertions, file system, paths, crypto, and streams. A dependency added for a fifteen-line utility is a supply-chain surface, a version to maintain, and an install step for everyone forever.

Where a dependency is genuinely warranted, say why in one line and name the alternative you rejected.

## Test meaningfully

A test suite that would still pass against a deliberately wrong implementation has not tested anything.

Before writing a test, name the specific wrong behaviour it rules out. For a rounding function that breaks ties to even, a test that asserts `round(1.4) === 1` rules out nothing — `Math.round` passes it too. The test that matters asserts `round(2.5) === 2`.

Test the boundary, the tie, the empty input, and the case the obvious wrong implementation gets wrong. Coverage of the happy path is the least informative kind of coverage.
