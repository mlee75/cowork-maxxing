---
id: standard-library-first
tier: 1
description: Rule on adding dependencies. Use when a task could be solved by installing a package.
---

Solve it with the standard library unless the task explicitly asks for a dependency.

Node's built-ins cover testing (`node:test`), assertions, file system, paths, crypto, and streams. A dependency added for a fifteen-line utility is a supply-chain surface, a version to maintain, and an install step for everyone forever.

Where a dependency is genuinely warranted, say why in one line and name the alternative you rejected.
