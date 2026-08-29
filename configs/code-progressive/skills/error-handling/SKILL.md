---
name: error-handling
description: House convention for throwing errors in application code. Use when writing any function that validates input, rejects a request, or fails on a precondition.
---

Throw `AppError` from `src/errors.js`, never a bare `Error`, `TypeError`, or `RangeError`.

Every `AppError` takes a machine-readable code as its first argument, in SCREAMING_SNAKE_CASE, then a human-readable message, then an optional context object.

    throw new AppError('INSUFFICIENT_FUNDS', 'source account lacks funds', { balance, amount })

The code is what callers branch on and what appears in logs and dashboards; the message is for a human reading a stack trace and may be reworded freely. Never branch on message text.

One distinct code per distinct failure. Two preconditions that fail for different reasons get two codes, even where the message would read the same.
