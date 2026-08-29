# Reference solutions

These exist so `npm run selftest` can prove each verifier is satisfiable — a
check that can never pass is worse than no check. They are also the clearest
statement of what each task considers correct.

**They are never visible to a run.** Each task executes in a temp copy of
`workspaces/<id>` alone; nothing in `verifiers/` is copied into it. Publishing
them does not weaken the benchmark for the same reason publishing SWE-bench's
gold patches does not: the agent under test cannot read them.

They are reference, not optimum. A solution that passes verification while
differing from these is fine, and the rubric — not this directory — judges
whether it is a good solution.
