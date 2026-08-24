# Task schema

One JSON file per task in `tasks/`. Fields:

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Stable slug. Never reuse or renumber — results reference it. |
| `category` | yes | One of the five in `README.md`. Determines the default rubric. |
| `title` | yes | One line, human-readable. |
| `prompt` | yes | Verbatim text sent to the model. No config-specific hints. |
| `fixtures` | no | Paths under `fixtures/` made available via `--add-dir`. |
| `rubric` | yes | Path to the rubric used for scoring. |
| `max_turns` | no | Cap on agent turns. Default 12. Prevents a runaway from dominating cost stats. |
| `notes` | no | Why this task is in the suite and what it discriminates between. |

## Rules for adding a task

1. **The prompt must not name a config.** If a task only works when a
   particular skill is loaded, it measures whether the skill fired, not
   whether the config is better. That is a different (also valid) test —
   put it in the `context-recall` category and say so.
2. **The task must be failable.** Run it once against `baseline`. If
   baseline scores full marks, the task discriminates nothing and costs
   real money on every future sweep. Cut it.
3. **Fixtures are committed, never fetched.** A task that reads the live
   web is not reproducible and its results cannot be compared across dates.
4. **State the discrimination in `notes`.** "This separates configs that X
   from configs that Y." If you cannot write that sentence, the task is
   decoration.
