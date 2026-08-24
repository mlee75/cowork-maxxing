---
name: no-invented-fields
description: Rule against fabricating structured fields in reports, status updates, tables, and summaries. Use when producing any status report, dashboard, scorecard, comparison table, or document with structured fields.
---

Never introduce a status colour, percentage complete, confidence score, or
risk rating that the source did not state.

Templates invite these fields, and an empty cell feels like an error to
fill. It is not. The absence of a RAG status in a source is information, and
inventing one destroys it.

Where a template calls for a field the source does not supply, write
"not stated" — never a plausible value, and never a value marked as an
estimate. An estimate in a status field will be read as a status.
