# cowork-maxxing

A benchmark for **Cowork configurations** — memory files, skills, and how
instructions get delivered to an agent doing knowledge work.

Every "make your agent smarter" guide asserts. None measure. This measures:
same tasks, same rubrics, different configs, reporting quality *and* token
cost side by side.

## Quickstart

Needs Node 18+ and an authenticated `claude` CLI. No dependencies to install.

```bash
git clone https://github.com/mlee75/cowork-maxxing && cd cowork-maxxing && npm run dry
```

That prints every command the sweep would run, and costs nothing. When it
looks right, the cheapest sweep that produces a real finding is six configs
across the two recall tasks:

```bash
node runner/run.mjs --configs monolith-25-terse,monolith-25,monolith-25-long,progressive-25-terse,progressive-25,progressive-25-long --tasks recall-01,recall-02 --repeats 1
```

Then `node runner/judge.mjs --run-id <id>` and `node runner/report.mjs --run-id <id>`.

**Bring your own rules.** The interesting use of this repo is not running my
corpus — it is dropping *your* memory file into `corpus/` and finding out
whether your setup actually earns its context. Add one file per rule, run
`npm run build`, and sweep.

A full run is 11 configs x 10 tasks. At `--repeats 3 --judges 3` that is 330
task runs and ~990 judge calls, so start small and scale deliberately.

---

## The thesis, and what measuring it actually found

The popular claim is that on-demand skills beat an always-on memory file on
both axes at once — better recall, fewer tokens — because only a pointer
sits in context until a task needs the body.

Enforcing true content parity (both configs generated from one corpus, rule
text byte-identical), the always-on saving is real. But it is **not**
governed by what everyone assumes.

**It does not grow with corpus size.** At 8, 25 and 60 rules the saving is
flat at 46–54%, because sixty rules need sixty descriptions — descriptions
scale linearly exactly as bodies do.

**It is governed by body-to-description ratio.** Holding rule count at
exactly 25 and descriptions byte-identical, varying only body length:

| Variant | Mean body | Body:desc | Always-on saving |
|---|---|---|---|
| `-25-terse` | 103 ch | 0.60 | **−64.2%** |
| `-25` | 374 ch | 2.16 | **+47.3%** |
| `-25-long` | 1,728 ch | 9.99 | **+88.0%** |

Break-even is at a ratio of roughly 1.0. Below it, progressive disclosure
costs *more* than a memory file — 64% more at the terse end. Which gives the
one-line version:

> If a rule fits in its own trigger description, a skill is strictly worse
> than a memory file.

That is arithmetic on file sizes, and it is where every existing guide
stops. It still does not answer the question that decides the argument: a
task that fires four skills pays for four bodies, so `-25-long`'s 88%
advantage could invert on a task that triggers five of them. `run.mjs`
measures real per-task usage. That sweep has not been run.

---

## What it measures

Per (task, config) pair:

- **Quality** — weighted rubric score, judged blind by a panel that is not
  told which config produced the output. Panel disagreement is reported, not
  smoothed away: a criterion the judges cannot agree on is a criterion whose
  score should not be trusted.
- **Ground truth where it exists** — `extract-01` is scored by comparison
  against `EXPECTED.csv`, not by a judge. Three of its six criteria are
  measured. Any task can add a scorer at `runner/checks/<task-id>.mjs`.
- **Cost** — real input, output, cache-creation and cache-read tokens, plus
  USD, from the CLI's own output. Not estimated.
- **Which skills actually fired** — parsed from the streaming event log. This
  is what separates the two ways a progressive config can lose: it never
  retrieved the rule, or it retrieved it and the body was too thin to apply.
  Those are different defects with different fixes.

Deltas are reported as **paired bootstrap confidence intervals over tasks**,
never as bare means. Tasks differ enormously in difficulty, so an unpaired
comparison mostly measures which tasks a config happened to run. Where an
interval crosses zero the report says *not distinguishable* rather than
printing a number — that is no measured effect, not a small one.

## Design

**The rule corpus is the controlled variable.** `configs/RULES.md` holds
eight house rules. Every non-baseline config carries all eight, identical in
content. Configs differ *only* in delivery mechanism. Change a rule and you
change every config in the same commit, or the run measures two things at
once.

**Eleven configs ship**, six of them generated from `corpus/` by
`runner/build-configs.mjs` so that content parity is structural rather than
maintained by hand:

| Config | Delivery |
|---|---|
| `baseline` | Nothing. No memory, no skills, no project settings. The floor. |
| `monolith-8` / `-25` / `-60` | N rules in one always-on memory file. |
| `progressive-8` / `-25` / `-60` | The same N rules as on-demand skills. |
| `monolith-25-terse` / `-25-long` | 25 rules, bodies at ~103 and ~1,728 ch. |
| `progressive-25-terse` / `-25-long` | The same, as skills. Descriptions unchanged. |
| `code-baseline` | No conventions. The floor for code tasks. |
| `code-claude-md` | Conventions as a real `CLAUDE.md` in the project root. |
| `code-monolith` | The identical text injected into the system prompt. |
| `code-progressive` | The identical bodies as on-demand skills. |

`code-claude-md` matters on its own: it is the mechanism Claude Code users
actually have. Whether an auto-discovered project memory file behaves the
same as the same text injected into the system prompt is an open question,
and these two configs differ in nothing else.

The corpus is tiered: `-8` is tier 1, `-25` is tiers 1–2, `-60` is all
three. Editing `configs/monolith-*` or `configs/progressive-*` by hand is
pointless — the next build overwrites it. Edit `corpus/` and rebuild.

**Fourteen seed tasks across two domains.**

*Cowork side (10 tasks)* — research synthesis, document generation,
extraction and normalisation, judgment and analysis, and context recall. The
last is the point of that half: a house rule the prompt never hints at,
tested with and without heavy distractor context, to isolate what context
pressure does to rule retrieval.

*Claude Code side (4 tasks)* — bug fix, test writing, refactor, and
convention-following, each in a real workspace with a real test suite. This
half has something the other cannot: **ground truth you can execute.**
Correctness is decided by running the code, so the judge is never asked
whether an answer was right, only whether the change was minimal, idiomatic,
and honestly described.

`code-02` is scored by *mutation*: the suite the agent writes must pass
against the correct implementation and fail against a deliberately wrong one.
A test file that only checks `1.4` and `1.6` passes both and is caught being
empty — which coverage metrics would not catch.

`code-04` is the code analogue of `recall-01`. The prompt says nothing about
error handling and the tests only require that *something* throws; the house
convention lives in the config, and the repo itself demonstrates the pattern.
So it separates three things: whether the rule reached the model, whether the
model inferred the convention from surrounding code with no rule at all, and
whether delivery mechanism changes either.

Verifiers and mutants live in `verifiers/`, never inside the workspace — an
agent that can read the checks can satisfy them without doing the work. Each
run gets a fresh temp copy, so runs cannot inherit each other's edits.

Every task's `notes` field names what it discriminates between and where the
trap is. A task whose `notes` cannot state that is decoration and gets cut.

## Running it

```bash
node runner/build-configs.mjs
```

```bash
node runner/context-cost.mjs
```

```bash
npm run selftest
```

```bash
node runner/run.mjs --dry-run
```

```bash
node runner/run.mjs --model sonnet --repeats 3
```

```bash
node runner/judge.mjs --run-id <id> --judges 3
```

```bash
node runner/report.mjs --run-id <id>
```

Requires the `claude` CLI, authenticated, and Node 18+. No dependencies.

`selftest` runs no model at all: it stages every code task twice — untouched
and with its reference solution — and asserts each verifier fails on the
first and passes on the second. A check that cannot do both measures nothing.
Run it after touching a workspace or a verifier.

`context-cost.mjs` measures each config's real always-on token cost with a
trivial probe, which supersedes the chars/4 arithmetic in
`CONTEXT-COST.md`. Where the two disagree, the measured file is right.

`--repeats 3` with `--judges 3` is the honest minimum: single-run
differences on a 10-task suite are inside the noise, and a lone judge is
erratic. The report takes the median across the judge panel per criterion.

## Reading the output

`report.mjs` emits quality and token cost per config, broken out by category
and by task — plus a **suite health** section that flags tasks where every
config scores within 5 points. Those tasks discriminate nothing, cost money
on every sweep, and should be cut. The benchmark audits itself.

---

## Open questions this exists to answer

1. **Does the always-on saving survive contact with a real task?**
   Progressive starts ~50% lighter but pays a body per skill that fires.
   At what number of triggered skills does it lose? This is the central
   question and `run.mjs` measures exactly it.
2. **Does the ratio effect hold on quality, not just on cost?** Terse
   bodies are cheaper in a monolith but may be too thin to apply correctly.
   The `-25-terse` / `-25` / `-25-long` triple tests exactly that.
3. **Does description quality dominate?** A skill fires or it does not, on
   the strength of one description line. The gap between a well-written and
   a lazy description may be larger than the gap between architectures.
4. **What does context pressure cost recall?** The recall-01 / recall-02
   delta, at several distractor sizes.
5. **Does a monolith degrade with length?** Rule 8 of 8 versus rule 40 of
   40, holding the task constant.

## Honest limitations

- **Absolute scores mean nothing.** The rules were written alongside the
  rubrics, which is correct for comparing delivery mechanisms and invalid as
  a general capability claim. Report deltas between configs. Never report a
  number from this suite as "Cowork is N% good at research."
- **The `recall-02` fixture is under its design size** (~1k words against a
  ~15k-token target). Its delta understates the effect until grown. See
  `fixtures/recall-02/README.md`.
- **An LLM judge is not ground truth.** `extract-01` is scored by
  comparison; everything else is judged. Panel disagreement is reported so
  the instrument's reliability is visible, but agreement is not accuracy —
  three judges can be consistently wrong together. No human-labelled
  calibration set exists yet, and until one does the judge's bias is
  unmeasured.
- **The stream event shape is unverified.** Token usage and the result
  object were checked against CLI 2.1.221; the tool-call event structure
  that skill telemetry parses was not. If it differs, telemetry degrades to
  `null` rather than failing a run — but absent telemetry means the causal
  table is empty, not that no skills fired. Run `--no-stream` to fall back
  to the verified output path.
- **No `--max-turns` in CLI 2.1.221**, so task `max_turns` is advisory. A
  runaway agent can distort cost figures for its config; check `num_turns`
  in the raw records before trusting a cost delta.
- **Four code tasks is too few for solve-rate statistics.** Solve rate is a
  per-task binary, so its interval is much wider than the rubric's: in
  validation, a planted +33pt gap still reported as *not distinguishable*.
  That is the statistics behaving correctly, and it means code-side deltas
  are directional until the suite reaches roughly 8-10 tasks. The report
  flags this itself.
- **Statistics do not fix a small suite.** Ten tasks and three repeats is
  enough to detect a large effect and not enough to detect a real 2-point
  one. The report flags this in its suite-health section rather than
  letting a tight-looking interval imply more power than exists.
- **This will decay.** It is pinned to `claude` CLI 2.1.221 and to Cowork as
  of 2026-08. Date every result. A benchmark that does not say when it ran
  is worse than no benchmark.

## Status

Harness and suite complete. The reporting statistics are self-tested against
synthetic data with known ground truth: a config seeded at +10 recovers as
`+9.6 (8.7, 10.4) better`, and one seeded as pure noise recovers as
`-0.8 (-3.6, 2.3) not distinguishable` — the difference a bare-means report
would have printed as a finding. Output is byte-identical across runs
(seeded bootstrap), so results are reproducible.

The `extract-01` scorer is self-tested against a perfect answer (2/2/2) and
against one that silently coerces `03/04/2026` (0/2/0).

Dry-run verified. **No sweep has been run
yet** — the table above is a static measurement of the configs themselves,
not a result. There are no numbers in this repo that came from a model, and
there will not be until `results/` contains a dated run.
