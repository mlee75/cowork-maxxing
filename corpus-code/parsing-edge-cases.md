---
id: parsing-edge-cases
tier: 1
description: Rule for writing parsers, splitters, and format handlers. Use when implementing or fixing code that reads a text format — CSV, dates, query strings, delimited data.
---

Text formats have escapes, and a naive `split` is wrong on all of them.

Before writing a parser, enumerate: the delimiter appearing inside a quoted region, the quote character escaped inside a quoted region, empty fields, leading and trailing whitespace, and a trailing delimiter.

Decide explicitly whether whitespace inside quotes is significant. It usually is, and trimming it is a silent data change.

If the format has a specification, the specification decides these questions, not intuition.
