# Matching scenario evaluation results

This records the controlled-scenario evaluation committed to in `design-record/006-controlled-prototype-evaluation.md`, per lecturer condition R5. It is evaluated against the rules in `design-record/003-timeout-and-reassignment.md`.

| Scenario | Initial state | Expected result | Actual result | Correct? |
|---|---|---|---|---|
| Helper accepts | 1 errand, 1 available helper | Errand → ACCEPTED, terms locked, contact revealed | _pending prototype_ | _pending_ |
| First helper declines | 1 errand, 2 available helpers | Immediate reassignment to next helper, decline recorded | _pending prototype_ | _pending_ |
| First helper times out | 1 errand, 2 available helpers | Assignment expires at 10 min, reassigned, timeout recorded | _pending prototype_ | _pending_ |
| No helper available | 1 errand, 0 available helpers | Errand enters backlog, capacity flag raised to Administrator | _pending prototype_ | _pending_ |
| Multiple helpers available | 1 errand, 3 available helpers | Exactly one helper assigned, others remain available | _pending prototype_ | _pending_ |
| Multiple errands compete | 3 errands, 2 available helpers | 2 assigned, 1 enters backlog, no double-assignment | _pending prototype_ | _pending_ |

Full scenario detail (steps, initial state, expected result) for each row lives in `prototype/scenarios/`.

**Status:** Scenarios and expected results are defined; "Actual result" and "Correct?" columns are filled in once the prototype implements the assignment/reassignment logic against these rules. This table should be updated in place, not duplicated, as each scenario is run.
