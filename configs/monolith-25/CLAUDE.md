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

## Acronyms expanded

Expand every acronym on first use, then use the short form. This applies to internal shorthand as strictly as to industry terms — internal shorthand is worse, because the reader cannot look it up.

If a document is externally facing, prefer the expanded form throughout and drop the acronym entirely unless it appears more than three times.

## Attribution of ideas

Name whose analysis or idea a document builds on, and link the original. Synthesis that absorbs its sources without naming them reads as original work and quietly removes people from their own contributions.

This applies to work you are summarising as much as work you are agreeing with.

## Competitor references

Describe a competitor's product only as their own public documentation describes it. Characterising what they do from memory or from a deal debrief produces claims you cannot support.

Never assert a competitor's weakness as fact. Describe what we do, with specifics, and let the comparison be the reader's.

## Customer anonymisation

Externally, no customer is named without written permission on file. "A European logistics company with 400 seats" carries the same argumentative weight and does not require sign-off.

Internally, name customers plainly — anonymising internally destroys the ability to follow up and helps nobody.

## Dates explicit

Write dates as absolute and unambiguous: 14 March 2026, or 2026-03-14. Never "next Thursday", "end of month", or "in two weeks" — documents outlive the day they were written and relative dates silently become wrong.

Never use bare numeric formats that differ by locale. 03/04/2026 has two readings and no context resolves it for a reader in the wrong country.

## Escalation format

An escalation opens with what is being asked for, not with the history. Then: impact stated in customers or revenue, what has already been tried, and the decision or resource needed.

An escalation that ends without a specific ask is a complaint, and will be read as one.

## Forecast ranges

A forecast is a range with a stated confidence, never a point. A single number will be treated as a commitment no matter how it is captioned.

State the two or three assumptions the forecast is most sensitive to. A forecast whose sensitivities are not stated cannot be checked, and therefore cannot be trusted or corrected.

## Glossary terms

Use the defined term or define your own, never a near-synonym. "Active user", "engaged user" and "monthly user" used interchangeably in one document means the document has no numbers in it, only impressions.

If the right term does not exist, say so explicitly rather than coining one in passing.

## Incident writeups

Describe what the system did, not what a person failed to do. "The deploy skipped the migration step" is a finding; "Sam forgot to run migrations" is a name in a document forever and stops other people reporting incidents.

Timeline in absolute timestamps with timezone. Separate what was known at each point from what is known now — the whole value of the document is in that gap.

## Numbers in prose

Never give a relative change without the absolute figures behind it. "Cut errors by 40%" is not reportable; "from 5% to 3%" is, and "cut errors by 40% (5% to 3%)" is the house form.

A percentage without a denominator is not a statistic. Give the n.

Round consistently within a document. Mixing 12.4% and 13% in adjacent sentences reads as two sources, and usually is.

## One decision per doc

A decision document asks for one decision. Bundling a second decision in — even a small one, even a related one — means the reader must approve both or neither, and the usual outcome is neither.

If a second decision genuinely blocks the first, name it and say it needs its own document.

## Pricing claims

Every price carries its unit and its term: per seat per month, billed annually. A number without both is unquotable and will be quoted anyway.

Never state a competitor's price. It changes, you will not update it, and being wrong about someone's price is the kind of error that gets forwarded.

## Quotes attributed

Every quote carries who said it and where. A quote without attribution is an assertion wearing quotation marks.

Do not tidy a quote. If it needs cutting, mark the cut. If it needs a word for grammar, bracket it. Paraphrase is always preferable to a lightly-edited quote presented as verbatim.

## Roadmap language

Distinguish three states and never blur them: shipped, committed with a date, and under consideration. Anything not yet built is described in the language of intent, never of fact.

Do not give a date externally unless someone with authority has committed to it in writing. "Later this year" from a salesperson becomes "by December" in the customer's notes.

## Slide titles

A slide title states the slide's assertion, not its topic. "Q3 revenue" tells the reader nothing; "Q3 revenue grew on renewals, not new logos" is the point of the slide.

If you cannot write the assertion, the slide does not have one, and it should be cut or merged.

## Survey results

Every reported finding carries n, how respondents were selected, and when. "Users want X" from five self-selected respondents is a hypothesis, and calling it a finding launders it into a fact.

Report the question as it was asked. Leading questions produce findings shaped like the question, and only the wording reveals it.

## Tables over prose

Three or more items compared on the same dimensions belong in a table, not in paragraphs. Prose comparison forces the reader to hold a grid in their head and they will not.

Conversely, two items or one dimension do not need a table. A two-row table is a formatting tic.
