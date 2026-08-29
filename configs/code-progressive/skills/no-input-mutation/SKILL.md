---
name: no-input-mutation
description: Rule against mutating function arguments. Use when writing functions that take objects or arrays and return derived values.
---

Do not mutate arguments. Return new objects.

    return { ...account, status: 'closed' }   // yes
    account.status = 'closed'; return account // no

A caller cannot see that a function mutated what they passed until something else breaks, usually far away and much later. This applies to arrays as strictly as to objects: prefer `toSorted`, `with`, and spreads over `sort`, index assignment, and `push` on an argument.
