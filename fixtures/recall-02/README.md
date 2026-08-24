# Fixture size — known gap

`recall-02` is designed to test rule recall **under context pressure**, and
that requires enough material to create the pressure. This directory
currently holds roughly 1,000 words. The task as designed calls for ~15k
tokens of distractor material.

Until it is grown, `recall-02` is running below its design point and the
recall-01 / recall-02 delta will understate the effect. Do not report that
delta as a headline number before this is fixed.

Grow it with real documents of the same kind — strategy notes, competitive
analysis, support summaries — not with generated filler. Filler compresses
differently and does not create realistic retrieval difficulty.
