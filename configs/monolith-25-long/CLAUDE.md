# House standards

Apply these to all work.

## Ambiguous data

Flag ambiguous or invalid input values as such. Never coerce one into a plausible value.

**Why this rule exists.** Coercion is invisible in the output. A date silently read as US convention looks exactly like a date that was unambiguous, and the reader has no way to tell which they are looking at. The error surfaces weeks later, in a reconciliation, when it is expensive.

**Ambiguity.** `03/04/2026` has two readings and no amount of care resolves it without knowing the source's locale. Carry the raw string through to a dedicated column and leave the normalised field empty. Do not pick the more likely reading, even where one is clearly more likely — a probable value in a date field is indistinguishable from a certain one.

Currency has the same shape. `$1,200` is not necessarily USD; AUD, CAD, NZD and several others use the symbol. If the document does not say, the currency is unknown.

**Invalidity is different from ambiguity.** `2026-13-01` is not a near-miss to be repaired. It is not January 2027 and not December 2026, and both repairs are guesses dressed as corrections. Report it as invalid and move on.

**The exception.** Where a coercion rule is explicitly given to you — "all dates in this batch are UK format" — apply it, and record in the output that it was applied and on whose authority. A stated assumption is auditable; an unstated one is a defect.

**What good output looks like.** A row that says `issue_date: (empty), ambiguous_raw: 03/04/2026` is complete and correct. It has not failed to extract the date; it has correctly reported that no date is extractable.

## Commitments

Preserve every commitment, name and date from the source, including ones made in passing. Distinguish commitments someone accepted from tasks merely assigned to them.

**Why this rule exists.** Action lists get relied on. A list that promotes a suggestion into a commitment creates an expectation on someone who never agreed to it, and the failure surfaces at the deadline, in front of the people who were counting on it.

**The three states, which must never collapse:**

- **Accepted** — the named owner acknowledged it. "I'll take it, end of next week."
- **Assigned** — someone named an owner who did not respond, or who was not in the room. Priya being volunteered for the runbook while absent is assigned, not accepted.
- **Raised** — proposed with no owner at all. "We should probably audit the permission model" followed by general agreement and a change of subject is raised. It is the most commonly mis-recorded state, because agreement sounds like commitment.

**The aside is the one that gets dropped.** "Oh — I'll get Dana the schema Thursday" arrives mid-sentence, in the middle of a different topic, and is exactly the commitment someone else is blocked on. Scan specifically for these; they do not announce themselves.

**Dates.** Record the date as given, including its vagueness. "Before the freeze, so the 5th" is a date. "Soon" is not, and converting it into one is fabrication.

**What good output looks like.** Seven rows where three are marked raised and one assigned is a more useful artifact than seven rows that all read as commitments, even though it looks like less was accomplished.

## Compliance claims

Never state a compliance or certification capability without naming the certifying standard and the date it took effect.

**Why this rule exists.** Compliance claims are read as contractual by the people who care about them. A procurement team reads "SOC 2 compliant" and records it as a control satisfied. If what we actually hold is a Type I from eighteen months ago, we have created a gap between what the customer believes and what is true, and it will be discovered during their audit rather than ours.

**The form.** "We are SOC 2 compliant" is not publishable. "SOC 2 Type II, audited through March 2026" is. The standard, the type where one exists, and the date or period. Three elements, every time.

**This applies most strictly where it is hardest.** Short formats — announcements, release notes, social copy, a line in a sales email — are where the qualifier gets dropped for length. That is precisely the material that circulates furthest and gets quoted back. A claim too long for the format is a claim that does not go in that format.

**Adjacent claims covered by this rule.** Data residency ("EU data stays in the EU" — under what guarantee, with what exceptions for metadata and backups), encryption ("encrypted at rest" — with what, managed by whom), and certifications held by a subprocessor rather than by us.

**When you do not know.** Do not write the claim. Leave a marked gap for someone who does. An unmarked omission reads as a considered decision not to claim anything, which is a different and usually worse signal.

**The competitor test.** If a competitor published our sentence, would we be able to tell what they actually hold? If not, ours is equally uninformative.

## Constraints

When a constraint is stated as fixed, do not propose ways around it. No phasing that smuggles the cut work back in, no deferral to next quarter, no asking for more capacity.

**Why this rule exists.** A fixed constraint is usually the output of a decision that was already hard and is already made. Re-opening it does not surface new information; it returns the work to the person who asked, who now has to make the same decision twice.

**The failure mode has a shape.** Asked to choose four of nine, the tempting answer picks four and then adds "with items 5 and 6 as fast-follows in early Q1." That is six features with a schedule attached. It reads as resourcefulness and functions as a refusal to cut, and the owner of item 5 will hear a commitment.

Other forms of the same move: proposing a reduced-scope version of a cut item, suggesting a contractor, noting that "if the hiring freeze lifts…", or presenting five options and asking the requester to choose.

**What is legitimate.** Stating a consequence is not evading a constraint. "Cutting audit log export means the two enterprise deals that named it will not close this quarter" is information the decision-maker needs. The distinction is that a consequence informs the decision as made, while an alternative asks for it to be remade.

It is also legitimate to say the constraint makes the goal unachievable, once, plainly, and then to do the task anyway under the constraint as given.

**What good output looks like.** Four features chosen, five cut, and five justifications a person could actually deliver to the owner — not a plan that quietly delivers seven.

## Memo format

A decision memo states its recommendation in the first two sentences, then the reasoning, then what would change the recommendation, then the specific decision being requested.

**Why this rule exists.** Decision memos are read by people who will stop early. The reader who stops after two sentences must still leave with the answer. A memo that builds toward its recommendation optimises for the reader who finishes, which is the minority, and it reads as though the author is not sure.

**The four parts.**

*Recommendation.* Two sentences, at the top, stating what should happen and the single strongest reason. "Buy rather than build. A hosted status page costs roughly $4k a year against an estimated six engineer-weeks to build and an ongoing on-call burden we do not have headroom for."

*Reasoning.* The evidence, ordered by weight, not chronologically. What you investigated last is rarely what matters most.

*What would change it.* Specific and checkable. "If usage grew" is useless. "If more than two enterprise customers ask in a quarter, or if the vendor's uptime drops below 99.9% in any month" is the standard. This section is what makes a memo revisitable rather than merely archived.

*The decision requested.* Named as an action with an owner and a date. "Approve the $4k annual spend by 12 September so procurement can process it before the quarter closes." Not "let me know your thoughts."

**The most common defect** is a memo that contains all four parts in the wrong order, with the recommendation on page two under a heading called Conclusion.

**Length.** One page. A decision that needs three pages of memo needs a meeting first.

## No invented fields

Never introduce a status colour, percentage complete, confidence score or risk rating that the source did not state.

**Why this rule exists.** Structured fields are read as measurements. A reader scanning a status report treats an amber RAG status as an assessment someone made, and acts on it — escalates, reprioritises, asks questions. If the status was inferred from the general tone of an update, the reader is acting on the summariser's impression while believing they are acting on the owner's assessment.

**Templates are the mechanism.** A template with an empty cell feels like an incomplete document, and the natural instinct is to fill it. Resist it. The absence of a RAG status in a source is information — it means nobody assessed it — and inventing one destroys that information irreversibly, because the invented value is indistinguishable from a real one in every downstream copy.

**"Estimated" does not help.** A field marked "70% (est.)" will be pasted into a slide as 70%. Qualifiers survive one copy and rarely two. If the number is not in the source, the cell reads "not stated".

**Fields this covers**, non-exhaustively: RAG and traffic-light status, percentage complete, confidence levels, risk severity and likelihood ratings, priority tiers, health scores, effort estimates, and any numeric score presented alongside real measurements.

**The legitimate version.** You may report what the source *said* in a way that fills the field, where the mapping is unambiguous. "That's not going to happen, it'll be more like the third week of September" supports a date change of roughly three weeks. It does not support "Status: Amber".

**What good output looks like.** A status report with three empty template fields and a line saying the owner did not assess status. It looks less finished. It is more true, and the gap is itself a prompt to go and ask.

## Plain delivery

Lead with the conclusion. Deliver unwelcome parts directly rather than softening them into ambiguity.

**Why this rule exists.** Hedging transfers work back to the reader. Someone asked for a recommendation precisely so they would not have to weigh the considerations themselves; returning a balanced survey of the considerations returns their own question with more words attached. Worse, ambiguity is usually read optimistically — a feature described as "not currently prioritised, though we're keeping it under review" is heard as "coming later" by the person who wants it.

**What directness is not.** It is not bluntness for its own sake, and it is not withholding context. A cut feature is cut, and the owner is still entitled to know why and what would change it. The rule governs clarity of the message, not warmth of the delivery. "We're not building custom roles this quarter. It's eight weeks against sixteen weeks of total capacity, and SSO unblocks more revenue" is direct and respectful. "There are some capacity considerations we're working through" is neither.

**Structural form.** Conclusion first, then reasoning. The reasoning explains a position the reader already has; it does not build toward one. This inverts how most people draft, which is the order in which they thought — thinking order and reading order are rarely the same and the document should be reordered before it is sent.

**Specific things to cut:** restating the prompt or question back; a closing paragraph summarising what was just said; "it depends" as a standalone answer; presenting three options with no recommendation; and any sentence whose function is to delay the point by one more sentence.

**The test.** If the reader stopped after the first paragraph, would they have the answer, and would they have the right emotional read on it? If either is no, reorder.

## Source conflicts

When sources disagree, name the disagreement rather than picking a winner silently. Mark conflicts the evidence cannot settle as unresolved. Settle the ones it can, and cite what settled them.

**Why this rule exists.** A synthesis that silently resolves a conflict is more dangerous than one that gets it wrong openly, because the reader cannot see that a judgement was made. They inherit a confident narrative with no indication that two of its three sources disagreed, and they cannot audit a decision they do not know was taken.

**Do the work of settling what can be settled.** Marking everything unresolved is not caution. It produces a document that lists disagreements without adding anything, and it scores the same as inventing a resolution — both leave the reader where they started. System timestamps, document order, ticket histories and direct quotes settle a surprising number of apparent conflicts.

Often the resolution is that both parties are right about different things. Two people citing 4 August and 11 August as the contract freeze date may both be accurate — one naming when review began, the other when the ticket closed. That is a resolvable conflict, and resolving it dissolves an argument rather than adjudicating one.

**Mark the rest explicitly, and say what would settle it.** "Who approved the additional fields is unresolved: no written approval exists in the tracker, one party recalls a verbal approval, and the named approver was on leave. A written approval or the calendar entry for that sync would settle it." That last clause turns an unresolved item into an action.

**Distinguish disagreement from contradiction.** Two sources emphasising different causes are not necessarily in conflict; they may both be true and partial. Say so rather than manufacturing a dispute to adjudicate.

**Never average.** Where two sources give different numbers, report both with attribution. The midpoint is a figure no source supports.

## Acronyms expanded

Expand every acronym and initialism on first use, then use the short form.

**Why this rule exists.** An unexpanded acronym costs the reader either a lookup or a guess, and most readers guess. In cross-functional documents the same letters routinely mean different things to different teams, and both readers proceed confidently in different directions.

**Internal shorthand is worse than industry jargon.** A reader can search for "SOC 2". They cannot search for "the Atlas migration" or "P2 accounts" or a team's nickname for a system. Internal terms need expansion more urgently than external ones, not less, and they are the ones most likely to be omitted because they feel obvious to the author.

**Collisions to watch.** In one organisation, "CS" is customer success and computer science; "AM" is account manager and asset management; "PR" is pull request and public relations. The reader resolves by context and is sometimes wrong.

**External documents.** Prefer the expanded form throughout and drop the acronym entirely unless the term appears more than three times. Acronyms are a compression optimisation for frequent use; below that threshold they cost the reader more than they save.

**Product and feature names** follow the same rule. A feature name is an acronym for a capability, and a customer who has not used the feature does not know what it does. "Smart Routing (automatically assigns incoming tickets by topic)" on first use.

**The exception.** Terms more familiar in short form than long — API, CSV, URL, PDF, HTTP — are not expanded. The test is whether the expansion would inform anyone; "Portable Document Format" informs nobody.

**Placement.** Expand at first use in the body, not only in a glossary at the end. Readers do not read appendices first.

## Attribution of ideas

Name whose analysis or idea a document builds on, and link the original.

**Why this rule exists.** Synthesis absorbs its sources. A document that draws on three people's work and names none of them reads as original, and after one or two rounds of forwarding it becomes the citable source — the people who did the work have been removed from it by a process nobody intended and nobody notices.

**The cost is concrete.** Attribution is how people are found for follow-up questions, and how the actual expert in an organisation becomes locatable. Unattributed synthesis routes every future question back to the summariser, who cannot answer them.

**What to name:** whose analysis, whose data, whose framing, and whose idea — including where you disagree with them. Disagreement without attribution is the worst case, since the person cannot see or respond to a characterisation of their position.

**Link the original.** A name without a link means the reader takes your summary as the whole of it. The link also lets the original author correct the record.

**Attribute prior work you are superseding.** "This replaces the June analysis by the platform team, which reached the opposite conclusion on different volume assumptions" is more useful than silently publishing a contradiction, and it prevents both documents circulating as current.

**Aggregated or anonymous inputs** still get sourced to their process: "from the Q2 support-theme review" tells a reader where to look.

**This applies to your own prior work.** Self-plagiarism in internal documents produces multiple undated versions of the same analysis with no indication of which is current.

**Do it in the body**, at the point of use, not in a credits line at the end.

## Competitor references

Describe a competitor's product only as their own public documentation describes it.

**Why this rule exists.** Most of what a team believes about a competitor comes from lost-deal debriefs, which are filtered through a customer's partial understanding and a salesperson's need to explain a loss. It is the least reliable source available, and it hardens into confident internal folklore within about two quarters.

**The standard.** Cite their documentation, with the page and the date you read it. If the claim cannot be sourced that way, it does not go in a document. This is not deference — it is the only version of a competitive claim that survives being challenged in front of a customer.

**Never assert a weakness as fact.** "They don't support regional isolation" is falsifiable in one click by a prospect who then discounts everything else in the document. Describe what we do, with specifics, and let the comparison happen in the reader's head. A specific true claim about ourselves outperforms a general negative claim about someone else, and cannot be refuted.

**Their vagueness is not our opportunity.** Where a competitor's claims are ambiguous, the response is to make ours precise, not to make ours equally ambiguous and better-sounding. Buyers in a segment where the question is being asked have learned to ask the follow-up.

**Date every competitive claim.** Products change and competitive documents are rarely revisited. An undated claim is asserted as current forever.

**Internal versus external.** Internal analysis may reason from partial evidence, clearly labelled as such. It must not be lifted into external material without being re-sourced, and this is the most common route by which folklore reaches a customer.

**Tone.** Write as though their team will read it, because eventually they do.

## Customer anonymisation

Externally, no customer is named without written permission on file.

**Why this rule exists.** A customer's use of a product is their information, not ours. Naming them exposes their vendor choices, their scale, and sometimes their problems, to their competitors — and it does so permanently, since published material is archived and forwarded well past the point where anyone remembers approving it. The permission is also frequently contractual, and breaching it is a commercial event rather than an embarrassment.

**Written means written.** A verbal "sure, feel free to mention us" from an enthusiastic champion is not permission. Champions leave, and their successor did not agree to anything. The record should name who approved, in what scope, and when.

**Scope is specific.** Permission for a case study is not permission for a conference talk, a sales deck, or a social post. Permission to use a logo is not permission to describe their architecture or their volumes.

**Anonymised description carries the same weight.** "A European logistics company with roughly 400 seats" makes the argument as well as the name does, and requires nothing. Use it by default and treat the named version as the exception that needs paperwork.

**Watch for re-identification.** Enough attributes identify a company as surely as a name. "A Nordic airline" is one of about four organisations. Coarsen the attributes until the description covers a real class, or get permission.

**Screenshots and diagrams count.** Customer names appear in URLs, account switchers, browser tabs, and sample data, and are the most common route by which an unapproved name is published.

**Internally, name customers plainly.** Anonymising internally destroys the ability to follow up, and helps nobody.

## Dates explicit

Write dates as absolute and unambiguous: 14 March 2026, or 2026-03-14.

**Why this rule exists.** Documents outlive the day they were written. "Next Thursday" is precise when typed and meaningless three weeks later when the document is forwarded, and there is no way for the later reader to recover which Thursday was meant. Relative dates do not decay visibly — they read as specific and are wrong.

**Banned forms:** next/last week, end of month, EOD, in two weeks, this quarter, shortly, soon, the 5th (without a month), and any weekday name used as a date.

**Locale-ambiguous numerics.** Never write 03/04/2026. It has two readings and nothing in the surrounding document resolves it for a reader in the wrong country. This matters most in material shared across regions, which is most material.

**Timezones.** Any date carrying a time carries a timezone. "The migration runs at 02:00" is a different event in Dublin and Sydney, and the people who need to be awake for it are in both.

**Deadlines specifically.** A deadline states the date and what happens at it. "Copy due 12 March" is weaker than "Copy due 12 March; the build ships 14 March with whatever is in it." The second is a deadline, the first is an aspiration.

**Ranges.** Write both endpoints and say whether they are inclusive. "March to April" is between one and three months depending on reading.

**The exception.** In direct speech and quoted material, preserve what was said and add the absolute date in brackets: "I'll have it Thursday [12 March]". Do not silently rewrite someone's words into house format.

## Escalation format

An escalation opens with what is being asked for, not with the history.

**Why this rule exists.** Escalations are read by people with less context and less time than the person writing them. A message that opens with background is read as a complaint, because the reader reaches the end of the first paragraph without knowing what they are being asked to do, and their attention is allocated before they get to the ask.

**The order.**

*The ask.* One sentence. "We need a decision on whether to roll back the billing migration today." Specific enough to be answered yes or no, or to name a resource.

*Impact.* In customers, revenue, or risk — units the reader already cares about. "Fourteen accounts are being double-charged; three have opened complaints; the largest is in renewal." Not "this is a P1."

*What has already been tried.* Short, and honest about what did not work. This is what prevents the reader's first instinct being a suggestion you exhausted two days ago.

*What is needed.* A decision, a person, or a budget. Named.

**An escalation with no ask is a complaint** and will be received as one, regardless of how serious the underlying issue is.

**Escalate to a person, not a channel.** Channels diffuse responsibility; the message is seen by twelve people who each assume another will act.

**State the deadline and what happens at it.** "If we have no decision by 16:00 the batch runs again and the number of affected accounts roughly doubles." Urgency asserted without a mechanism reads as pressure and is discounted.

**Do not escalate and simultaneously keep working the problem silently.** Say which you are doing.

## Forecast ranges

A forecast is a range with a stated confidence, never a point.

**Why this rule exists.** A single number is treated as a commitment no matter how it is captioned. It gets pulled into a plan, and the plan is built assuming it, and the uncertainty that the author held in their head at the moment of writing is nowhere in the artifact. Ranges survive copying; caveats do not.

**The form.** "$1.4M–$2.2M, most likely around $1.8M, at roughly 70% confidence" carries what the author actually believes. Three numbers instead of one, and the spread itself is information — a wide range honestly stated is more useful than a narrow one that is wrong.

**Name the two or three assumptions the forecast is most sensitive to.** A forecast whose sensitivities are not stated cannot be checked, corrected, or updated when the world moves. This is also the discipline that catches the failure mode where the headline assumptions are inert and the conclusion actually rests on something buried and unexamined.

**Sensitivity analysis must test the assumption that matters.** Testing a ±10% swing on a variable the model is insensitive to demonstrates robustness that does not exist. Test the one that would break it, and report that result even when it is unflattering.

**Distinguish a forecast from a target.** A target is a decision about what to aim for; a forecast is a belief about what will happen. Presenting a target as a forecast corrupts planning downstream, because everyone else treats it as an input rather than an ambition.

**Record the forecast and revisit it.** Forecasts that are never scored do not improve. Note the date, and check it when the period closes.

## Glossary terms

Use the defined term or define your own, never a near-synonym.

**Why this rule exists.** Defined terms are the only thing making a document's numbers comparable. When "active user", "engaged user" and "monthly user" appear in one document, the document contains no measurements — only impressions that look like measurements — and the discussion it triggers is about definitions rather than about the decision.

**Near-synonyms are the failure mode**, not obviously wrong terms. Nobody confuses revenue with headcount. People routinely alternate between "account" and "customer", or "signup" and "activation", believing they are avoiding repetition. Repetition is correct here; variation reads as distinction and the reader looks for a difference that is not there.

**Where the right term does not exist**, say so explicitly and define what you mean in place, rather than coining a term in passing. A term coined mid-document acquires users who did not read the definition.

**Status vocabularies are terms too.** "Blocked", "at risk" and "delayed" mean specific things if they mean anything. Using them loosely means the one time something is genuinely blocked it reads as a mood.

**Check for drift across documents, not just within one.** A term redefined in a newer document while older documents remain in circulation produces two live definitions and no signal about which applies.

**Definitions state exclusions.** "Active user" is defined by what does not count — internal accounts, trials, automation — far more than by what does.

**When quoting someone who used a term differently**, preserve their usage and note the difference. Silently normalising their words into house vocabulary changes what they said.

## Incident writeups

Describe what the system did, not what a person failed to do.

**Why this rule exists.** Incident documents are permanent and widely read. A name attached to a failure stays attached, and the predictable result is that people stop reporting incidents early, which is the only mechanism that makes incidents cheap. The trade is a small amount of narrative satisfaction for a large amount of future information.

**The rewrite is mechanical.** "Sam forgot to run the migrations" becomes "the deploy pipeline did not run migrations and did not fail when they were absent." The second is more useful anyway: it names something that can be fixed, whereas the first names something that will recur with a different name attached.

**Timeline discipline.** Absolute timestamps with a timezone, one line per event, including the events where nothing was noticed. The gaps are usually the finding — the twenty minutes between the first alert and the first human response is the number that matters most and it only exists if quiet periods are recorded.

**Separate what was known then from what is known now.** This is the entire analytical value of the document. Actions that look inexplicable in hindsight were reasonable given the information available at the time, and the remedy is almost always to change what information is available rather than to ask people to decide better.

**Contributing factors, not root cause.** Single-cause incidents are rare; the singular framing stops the analysis at the first plausible stopping point.

**Actions.** Each has an owner and a date, and is small enough to actually happen. An action item reading "improve deployment safety" is a sentiment.

**Publish it.** An incident document read only by the team that had the incident teaches nobody else.

## Numbers in prose

Never give a relative change without the absolute figures behind it. Every percentage carries its n.

**Why this rule exists.** Relative change is the most reliable way to mislead without lying. "Cut errors by 40%" is true whether the rate went from 50% to 30% or from 0.005% to 0.003%, and those are entirely different facts. The reader cannot recover the difference and will assume the more impressive one.

**The house form.** Give the relative change with the absolutes in parentheses: "cut errors by 40% (5% to 3%)". This costs four words and removes the ambiguity permanently, including in the version that gets pasted into a slide.

**Denominators.** A percentage without an n is not a statistic. "43% of respondents" from seven people is "3 of 7", and should be written that way — below roughly thirty observations, report counts rather than percentages, because percentages imply a precision the sample cannot support.

**Rounding.** Be consistent within a document. Adjacent sentences reading 12.4% and 13% suggest two sources with different methodologies, and usually there genuinely are two, which is worth knowing. Pick a precision and hold it.

**Growth over small bases.** "Tripled" from two customers to six is arithmetically correct and rhetorically dishonest in a document about market traction. Give the absolutes and let the reader judge.

**Compounding.** Do not add percentages that apply to different bases. A 10% uplift on retained accounts plus a 20% expansion figure do not make 30% of anything.

**The test.** Could a reader reconstruct the underlying numbers from what you wrote? If not, you have given them a conclusion and withheld the evidence.

## One decision per doc

A decision document asks for one decision.

**Why this rule exists.** Bundled decisions are approved or rejected together, and the usual outcome is neither — the reader who is comfortable with the first and uncertain about the second defers both, and the document stalls on its weakest element. A memo asking to buy a status page and to change the on-call rotation will be blocked by whichever of those is more contentious, no matter how obvious the other is.

**Symptoms of a bundled document:** the recommendation section contains the word "and" joining two verbs; the reader could plausibly agree with half of it; the title names a theme rather than a choice; or the ask at the end lists more than one thing to approve.

**When the second decision genuinely blocks the first.** Name it explicitly, state that it needs its own document, and say which order they must be taken in. "This assumes we continue to run our own on-call rotation. If that is under review, this decision should wait." That is a dependency, handled visibly.

**Sequencing decisions is legitimate; bundling them is not.** Two documents in a known order will both get decided. One document containing two decisions frequently gets neither.

**Options are not decisions.** Presenting three options for a single choice is one decision. Presenting one recommendation each for three separate choices is three.

**The exception.** A ratifying document that records several decisions already taken elsewhere is not asking for a decision at all, and this rule does not apply. Title it so that is obvious, so nobody reads it as a request.

**The test.** Can the reader reply with a single word that resolves the document? If the shortest sufficient reply is "yes to the first, not sure about the second", it is two documents.

## Pricing claims

Every price carries its unit and its term: per seat per month, billed annually.

**Why this rule exists.** A bare number will be quoted, and it will be quoted as whatever the reader assumed. "$18" becomes $18 per month in one person's notes and $18 per year in another's, and both will believe they are quoting us. Price disputes traced back to an ambiguous figure in our own material are entirely self-inflicted.

**The complete form** states the amount, the unit it applies to, the period it covers, and the billing frequency where that differs from the period. "$18 per seat per month, billed annually" is four facts and all four are load-bearing.

**Discounts.** Give the condition and the duration alongside the discount. A rate that reverts after twelve months is a different offer from one that does not, and the difference is where disputes originate.

**Never state a competitor's price.** It changes, we will not notice when it changes, and the document will outlive the accuracy. Being publicly wrong about someone else's price is the kind of error that gets screenshotted and forwarded to them. Where a comparison is necessary, cite their published page and its access date, and let the reader follow it.

**Total cost comparisons** must include the same categories on both sides. A build-versus-buy comparison that counts licence cost for the vendor and only engineering time for the build has omitted maintenance, on-call, and opportunity cost, and it always favours building.

**Currency.** State it. `$` is ambiguous across at least five currencies and the ones it is ambiguous between are all plausible for a software purchase.

**Estimates.** Label them, give the range, and name what they exclude — typically tax, overage, and onboarding.

## Quotes attributed

Every quote carries who said it and where. A quote without attribution is an assertion wearing quotation marks.

**Why this rule exists.** Quotation marks confer authority. An unattributed quote reads as evidence while functioning as the author's own claim, and the reader cannot weigh it because they cannot see whose judgement it is. "Users find the onboarding confusing" in quotes, from an unnamed source, is unfalsifiable in a way the same sentence unquoted is not.

**What attribution requires:** who said it, where it was said, and when. A role is sufficient where a name is inappropriate — "a security lead at a 400-seat customer, in a June call" — but "a customer" is not, because it does not indicate whether this was one person in passing or a considered position.

**Do not tidy a quote.** Removing a hesitation, fixing grammar, or dropping a qualifier changes what the person said while presenting it as verbatim. The qualifier is often the substance: "I think we'd probably want that eventually" is not "we want that."

Where editing is genuinely needed: mark cuts with an ellipsis, bracket any inserted word, and never do either in a way that changes the sense. If a quote needs more repair than that, paraphrase it and drop the quotation marks. Paraphrase with attribution is always preferable to a lightly-edited quote presented as exact.

**Length.** Quote the shortest span that carries the point. Long quotes transfer the work of interpretation to the reader while appearing rigorous.

**Aggregating quotes is not evidence of a pattern.** Five quotes selected from fifty interviews show that five people said something. State the denominator alongside them, or the selection is doing the argument's work invisibly.

**Internal sources.** The same rules apply to quoting colleagues. People are held to what documents say they said.

## Roadmap language

Distinguish three states and never blur them: shipped, committed with a date, and under consideration.

**Why this rule exists.** Everything said about unbuilt work is heard as a commitment by whoever wants it. The customer who hears "that's on the roadmap" records a delivery expectation; the salesperson who hears "probably Q4" quotes Q4. Neither is being unreasonable — the language did not carry its own uncertainty, so the listener supplied none.

**The three states in practice.**

*Shipped* is described in the present tense and only after it is available to the customer being told. Available in beta to three accounts is not shipped.

*Committed* means someone with authority has agreed a date in writing. Only that person's commitment can be repeated, and it is repeated with the date attached and no embellishment.

*Under consideration* is described in the language of intent and given no date at all, not even a vague one. "We're looking at it for later this year" is a date; it becomes December in the listener's notes.

**Never give an external date you did not receive in writing.** The mechanism by which unfounded dates enter the world is almost always someone repeating a plausible-sounding internal estimate outside the room it was made in.

**Sequencing without dates is safe and often sufficient.** "Single sign-on comes before audit log export" tells a customer what they need for planning and commits to nothing.

**Say what is not coming.** Sales positioning an unstaffed item is worse than an admitted gap, because the gap is discovered at the point of a signed contract.

## Slide titles

A slide title states the slide's assertion, not its topic.

**Why this rule exists.** Decks are read without their presenter far more often than with one, and the titles are what survive. A deck whose titles read "Q3 revenue", "Churn", "Next steps" conveys nothing on its own; a deck whose titles read "Q3 revenue grew on renewals, not new logos" conveys the argument even if every chart is skipped.

**The discipline is diagnostic.** If you cannot write the assertion, the slide does not have one. That is not a titling problem — it is a slide that should be cut, merged, or moved to an appendix. Working title-first surfaces this before the chart is built rather than after.

**Read the titles alone, in order.** They should form the argument. Where the sequence does not read as a coherent case, the deck's structure is wrong, and no amount of design fixes it. This is the fastest available review of a deck and takes about a minute.

**Length.** A title is a sentence and may run to two lines. Optimising titles for brevity is what produces topic labels in the first place.

**The body serves the title.** Each slide carries the evidence for its own assertion and nothing else. Material that supports a different claim belongs on a different slide.

**Exceptions.** Section dividers and pure-reference appendix slides may carry topic labels, since they assert nothing by design. Everything in the main argument carries an assertion.

**Numbers in titles.** Where the assertion is quantitative, put the number in the title. "Onboarding takes 14 minutes; target is 10" is the point of the slide.

## Survey results

Every reported finding carries n, how respondents were selected, and when.

**Why this rule exists.** "Users want X" is a sentence that erases its own evidence. Whether it came from five self-selected respondents to a banner or from a stratified sample of four hundred is the entire question, and once the sentence is written without that context it circulates as a fact and gets cited in decisions.

**Selection matters more than size.** A hundred responses from a link posted in a power-user community tells you about power users, and no sample size fixes it. State the recruitment channel, because that is what determines who could possibly have answered.

**Report the question as it was asked.** Answers are shaped by wording and cannot be reinterpreted without it. "Would you find an audit log useful?" and "What would you most like us to build next?" produce different worlds, and only the second tells you about priority. Leading questions are visible in the wording and invisible in the finding.

**Response rate, not just response count.** Four hundred responses from forty thousand invitations is a self-selected 1%, and the people who answer surveys differ systematically from those who do not.

**Quantify qualitative work honestly.** "Six of eleven interviewees mentioned it unprompted" is a real and useful finding. "55% of users say" from the same eleven interviews is not, and the conversion into a percentage is where the misrepresentation happens.

**Distinguish what people said from what they did.** Stated preference and revealed preference diverge, particularly on price and on features people believe they ought to want.

**Date it.** A finding from before a major release describes a product that no longer exists.

## Tables over prose

Three or more items compared on the same dimensions belong in a table, not in paragraphs.

**Why this rule exists.** Prose comparison asks the reader to build a grid in their head and hold it while reading. They will not. What they retain instead is whichever item was described most vividly, which is usually the one the author knew most about rather than the one that scores best.

**The threshold is real in both directions.** Three items across two or more dimensions: table. Two items, or one dimension: prose, because a two-row table is a formatting tic that adds structure without adding comparison.

**Table discipline.** Every column is a dimension applied identically to every row. If a cell needs a different kind of answer than the cell above it, the column is doing two jobs and should be split. Cells that read "yes, but only on enterprise plans, and it requires a support ticket" mean the dimension was not well chosen.

**Empty cells carry meaning and must be disambiguated.** "Not applicable", "not offered", and "the vendor did not answer" are three different facts and a blank cell conflates all three. Write which one it is; a legend at the foot of the table handles the repetition.

**Order rows deliberately.** Alphabetical order is a decision not to have an opinion. Order by whatever the reader is deciding on, and say what the ordering is.

**The prose still has a job.** A table shows the comparison; it does not state the conclusion. One or two sentences before or after should say what the table means, because readers extract the wrong conclusion from tables surprisingly often when left to do it themselves.

**Width.** A table that needs horizontal scrolling has too many dimensions. Cut to the ones the decision turns on and put the rest in an appendix.
