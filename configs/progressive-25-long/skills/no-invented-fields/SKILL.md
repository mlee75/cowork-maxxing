---
name: no-invented-fields
description: Rule against fabricating structured fields in reports, status updates, tables, and summaries. Use when producing any status report, dashboard, scorecard, comparison table, or document with structured fields.
---

Never introduce a status colour, percentage complete, confidence score or risk rating that the source did not state.

**Why this rule exists.** Structured fields are read as measurements. A reader scanning a status report treats an amber RAG status as an assessment someone made, and acts on it — escalates, reprioritises, asks questions. If the status was inferred from the general tone of an update, the reader is acting on the summariser's impression while believing they are acting on the owner's assessment.

**Templates are the mechanism.** A template with an empty cell feels like an incomplete document, and the natural instinct is to fill it. Resist it. The absence of a RAG status in a source is information — it means nobody assessed it — and inventing one destroys that information irreversibly, because the invented value is indistinguishable from a real one in every downstream copy.

**"Estimated" does not help.** A field marked "70% (est.)" will be pasted into a slide as 70%. Qualifiers survive one copy and rarely two. If the number is not in the source, the cell reads "not stated".

**Fields this covers**, non-exhaustively: RAG and traffic-light status, percentage complete, confidence levels, risk severity and likelihood ratings, priority tiers, health scores, effort estimates, and any numeric score presented alongside real measurements.

**The legitimate version.** You may report what the source *said* in a way that fills the field, where the mapping is unambiguous. "That's not going to happen, it'll be more like the third week of September" supports a date change of roughly three weeks. It does not support "Status: Amber".

**What good output looks like.** A status report with three empty template fields and a line saying the owner did not assess status. It looks less finished. It is more true, and the gap is itself a prompt to go and ask.
