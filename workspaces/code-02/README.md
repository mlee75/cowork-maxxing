`roundHalfEven` implements banker's rounding: exact ties round to the
nearest even digit rather than always upward. `roundHalfEven(0.5)` is `0`,
`roundHalfEven(1.5)` is `2`, `roundHalfEven(2.5)` is `2`.

There are no tests. That is the gap.
