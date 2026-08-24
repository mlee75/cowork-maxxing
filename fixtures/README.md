# Fixtures

**Every organisation and person named in these files is fictional.** The
documents are written for this benchmark: the invoices, questionnaire
responses, transcripts, retros and business cases describe events that never
happened, at companies that do not exist, involving people who are not real.

They are written to read as genuine working documents because a benchmark
built on obviously-synthetic input measures the wrong thing — but nothing in
here is a record of anything, and no statement about any named company
should be read as a claim about a real one.

Names were chosen to be implausible as real firms. If one nevertheless
collides with an actual organisation, the collision is accidental and the
name should be changed — open an issue.

## What is deliberately wrong in here

Several fixtures contain planted defects, and they are the point of the
suite. Do not "fix" them:

- `extract-01` contains an unresolvable date (`03/04/2026`) and an invalid
  one (`2026-13-01`). `EXPECTED.csv` is the ground truth and encodes both as
  unextractable.
- `extract-02` contains action items that were suggested but never accepted,
  and one assigned to someone not present.
- `synth-01` contains two conflicts the timestamps can settle and two they
  cannot.
- `synth-02` contains a vendor who never states a breach notification
  window, and one who answers it only obliquely.
- `doc-02` contains a speaker who gives no status colour and no percentage
  complete, and one commitment made as an aside.

Each task's `notes` field in `tasks/` says what its fixture discriminates.
