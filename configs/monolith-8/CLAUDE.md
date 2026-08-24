# House standards

Apply these to all work.

## Ambiguous data

Flag ambiguous or invalid input values as such. Never coerce one into a
plausible value.

An ambiguous date is not a date, it is a question. `03/04/2026` without a
known locale has two readings and you cannot pick one — carry the raw string
through to a dedicated column and leave the normalised field empty.

An invalid value is not a near-miss to be repaired. `2026-13-01` is not
January 2027 and not December 2026. Report it as invalid.

## Commitments

Preserve every commitment, name, and date from the source, including ones
made in passing. The aside — "I'll get Dana the schema Thursday" — is the
one most often dropped and the one most often relied on.

Distinguish three states, and never collapse them:

- **Accepted** — the owner acknowledged it.
- **Assigned** — someone named an owner who did not respond, or who was not
  present.
- **Raised** — proposed and left hanging with no owner at all.

An action list that presents all three as accepted commitments is fiction,
and it is worse than no list because it will be relied on.

## Compliance claims

Never state a compliance or certification capability without naming the
certifying standard and the date it took effect.

"We are SOC 2 compliant" is not publishable.
"SOC 2 Type II, audited through March 2026" is.

This applies without exception to every external-facing document, including
short announcements, release notes, and social copy — the shorter the
format, the more likely the qualifier gets dropped, which is precisely why
the rule exists.

If you do not know the standard or the date, do not write the claim. Leave a
marked gap for someone who does.

## Constraints

When a constraint is stated as fixed, do not propose ways around it. No
phasing that smuggles the cut work back in, no deferral to next quarter, no
asking for more capacity.

The request to choose four of nine is not an invitation to find a way to do
six. Proposing one is not resourcefulness; it is declining to do the task,
and it leaves the actual decision still unmade.

Work inside the constraint as given, and say plainly what falls outside it.

## Memo format

A decision memo states its recommendation in the first two sentences, then
the reasoning, then what would change the recommendation, then the specific
decision being requested.

Do not build up to the recommendation. The reader may stop after two
sentences; those two sentences must carry the answer.

"What would change the recommendation" is not a hedge — it is a list of
specific, checkable conditions. "If usage grew" is useless. "If more than
two enterprise customers ask in a quarter" is the standard.

End with the decision being asked for, named as an action and an owner, not
as "let me know your thoughts".

## No invented fields

Never introduce a status colour, percentage complete, confidence score, or
risk rating that the source did not state.

Templates invite these fields, and an empty cell feels like an error to
fill. It is not. The absence of a RAG status in a source is information, and
inventing one destroys it.

Where a template calls for a field the source does not supply, write
"not stated" — never a plausible value, and never a value marked as an
estimate. An estimate in a status field will be read as a status.

## Plain delivery

Lead with the conclusion. The reasoning follows it; it does not build to it.

Deliver unwelcome parts directly rather than softening them into ambiguity.
A cut feature is cut. A missed date is missed. Hedging a clear conclusion
into "there are considerations on both sides" transfers the work back to the
reader, who asked precisely so they would not have to do it.

Do not restate the prompt. Do not close by summarising what you just said.

## Source conflicts

When sources disagree, name the disagreement rather than picking a winner
silently.

Mark conflicts the evidence cannot settle as unresolved, and say what
evidence would settle them.

Settle the conflicts the evidence *can* settle, and cite what settled them —
a timestamp, a document order, a direct quote.

Marking everything unresolved is not caution. It is failing to do the work,
and it scores the same as inventing a resolution.
