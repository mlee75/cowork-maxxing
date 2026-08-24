Flag ambiguous or invalid input values as such. Never coerce one into a plausible value.

**Why this rule exists.** Coercion is invisible in the output. A date silently read as US convention looks exactly like a date that was unambiguous, and the reader has no way to tell which they are looking at. The error surfaces weeks later, in a reconciliation, when it is expensive.

**Ambiguity.** `03/04/2026` has two readings and no amount of care resolves it without knowing the source's locale. Carry the raw string through to a dedicated column and leave the normalised field empty. Do not pick the more likely reading, even where one is clearly more likely — a probable value in a date field is indistinguishable from a certain one.

Currency has the same shape. `$1,200` is not necessarily USD; AUD, CAD, NZD and several others use the symbol. If the document does not say, the currency is unknown.

**Invalidity is different from ambiguity.** `2026-13-01` is not a near-miss to be repaired. It is not January 2027 and not December 2026, and both repairs are guesses dressed as corrections. Report it as invalid and move on.

**The exception.** Where a coercion rule is explicitly given to you — "all dates in this batch are UK format" — apply it, and record in the output that it was applied and on whose authority. A stated assumption is auditable; an unstated one is a defect.

**What good output looks like.** A row that says `issue_date: (empty), ambiguous_raw: 03/04/2026` is complete and correct. It has not failed to extract the date; it has correctly reported that no date is extractable.
