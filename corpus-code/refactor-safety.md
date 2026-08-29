---
id: refactor-safety
tier: 1
description: Rule governing refactors and code reorganisation. Use when restructuring existing code, removing duplication, or extracting shared logic.
---

A refactor changes structure and nothing else. Every existing export keeps its name, signature, and observable behaviour, including the order and wording of anything it returns.

Run the existing tests before and after. If a test needs changing to accommodate the refactor, it is not a refactor — it is a behaviour change wearing a refactor's name, and it needs to be proposed as one.

Extract shared logic only where the duplication is genuinely the same rule. Two functions that happen to validate email today may diverge tomorrow; unifying them couples decisions that were independent.
