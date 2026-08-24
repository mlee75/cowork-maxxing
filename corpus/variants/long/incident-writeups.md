Describe what the system did, not what a person failed to do.

**Why this rule exists.** Incident documents are permanent and widely read. A name attached to a failure stays attached, and the predictable result is that people stop reporting incidents early, which is the only mechanism that makes incidents cheap. The trade is a small amount of narrative satisfaction for a large amount of future information.

**The rewrite is mechanical.** "Sam forgot to run the migrations" becomes "the deploy pipeline did not run migrations and did not fail when they were absent." The second is more useful anyway: it names something that can be fixed, whereas the first names something that will recur with a different name attached.

**Timeline discipline.** Absolute timestamps with a timezone, one line per event, including the events where nothing was noticed. The gaps are usually the finding — the twenty minutes between the first alert and the first human response is the number that matters most and it only exists if quiet periods are recorded.

**Separate what was known then from what is known now.** This is the entire analytical value of the document. Actions that look inexplicable in hindsight were reasonable given the information available at the time, and the remedy is almost always to change what information is available rather than to ask people to decide better.

**Contributing factors, not root cause.** Single-cause incidents are rare; the singular framing stops the analysis at the first plausible stopping point.

**Actions.** Each has an owner and a date, and is small enough to actually happen. An action item reading "improve deployment safety" is a sentiment.

**Publish it.** An incident document read only by the team that had the incident teaches nobody else.
