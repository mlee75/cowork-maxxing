# The shared rule corpus

**The corpus is the controlled variable.** `corpus/` holds 60 rules, each
tagged with a tier. Every rule-carrying config is *generated* from it by
`runner/build-configs.mjs`, so `monolith-25` and `progressive-25` contain
byte-identical rule text and differ only in delivery mechanism.

| Size | Tiers included | Rules |
|---|---|---|
| `-8` | 1 | 8 |
| `-25` | 1–2 | 25 |
| `-60` | 1–3 | 60 |

## Editing

Edit `corpus/`, then run `node runner/build-configs.mjs`. Do not hand-edit
anything under `configs/monolith-*` or `configs/progressive-*`; it is
overwritten on the next build.

A corpus file needs `id`, `tier`, and `description` in frontmatter, and a
body. The build fails loudly if a tier does not hold exactly its expected
count, so a miscounted tier cannot quietly produce a size-mismatched sweep.

## Why generation rather than parallel directories

Six hand-maintained config directories carrying the same rules would drift
within a week — a rule reworded in the monolith and not in the skills, and
every subsequent run silently measures a content difference while reporting
it as an architecture difference. Generation makes that failure impossible
rather than merely discouraged.

## A validity caveat, stated up front

The rules were written alongside the rubrics, so they overlap with what the
rubrics reward. That makes cross-config comparison valid — knowledge is held
constant, only delivery varies — but it makes the *absolute* scores
meaningless as a general capability claim. Report deltas between configs.
Never report a score from this suite as "Cowork is N% good at research."

A second caveat specific to the tiers: tier 3 was written more tersely than
tier 1, so body-to-description ratio is not constant across sizes. See
`configs/CONTEXT-COST.md`. Any result that varies with size needs to rule
this out before it is called a finding.
