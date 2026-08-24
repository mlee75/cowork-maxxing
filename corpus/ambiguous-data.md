---
id: ambiguous-data
tier: 1
description: Rule for handling ambiguous, malformed, or invalid values during data extraction and normalisation. Use when extracting structured data from documents, normalising dates or amounts, or building a table from unstructured sources.
---

Flag ambiguous or invalid input values as such. Never coerce one into a
plausible value.

An ambiguous date is not a date, it is a question. `03/04/2026` without a
known locale has two readings and you cannot pick one — carry the raw string
through to a dedicated column and leave the normalised field empty.

An invalid value is not a near-miss to be repaired. `2026-13-01` is not
January 2027 and not December 2026. Report it as invalid.
