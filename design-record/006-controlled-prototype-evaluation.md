# D-006: Matching evaluated via controlled prototype scenarios, not a real pilot

## Status
Approved (lecturer condition)

## Decision
The matching target (auto-assignment to an available registered helper) is evaluated using controlled, synthetic scenarios, not a real pilot with live student requests. A real pilot is only run if formal permission is obtained separately.

The scenario set (see `prototype/scenarios/` and `tests/matching-scenario-results.md`) covers:

- Available helper accepts immediately
- First helper declines
- First helper times out
- No helper is available
- Multiple helpers are available
- Several errands compete for helpers

Each scenario records: the scenario, the initial system state, the expected result, the actual result, and whether the matching rule behaved correctly.

## Evidence that changed our mind
Lecturer feedback explicitly required this: "Do not run a real pilot unless formal permission is obtained. Instead, create controlled/synthetic scenarios that test the matching target." A real pilot involving actual students would raise consent, safety and data-handling questions beyond what a semester project should take on without separate approval.

## Consequence we accept
Objective 1 in `docs/problem-and-scope.md` ("match at least 80% of posted errands... during a pilot with real errand requests") no longer accurately describes how the target will be evaluated and needs rewording to describe controlled-scenario evaluation instead. The team cannot claim real-world adoption or usage numbers from this evaluation, only that the matching logic behaves correctly against the defined scenario set.

## Next uncertainty to investigate
What "formal permission" would need to cover (ethics review, department sign-off, participant consent) if the team wanted to run a real pilot in a later phase beyond this semester.
