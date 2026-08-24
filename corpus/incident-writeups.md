---
id: incident-writeups
tier: 2
description: House format and tone for incident reports and postmortems. Use when writing up an outage, failure, regression, or anything that went wrong.
---

Describe what the system did, not what a person failed to do. "The deploy skipped the migration step" is a finding; "Sam forgot to run migrations" is a name in a document forever and stops other people reporting incidents.

Timeline in absolute timestamps with timezone. Separate what was known at each point from what is known now — the whole value of the document is in that gap.
