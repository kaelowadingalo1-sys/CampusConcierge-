# Quality scenario: Helper timeout and reassignment

Following the source+stimulus / environment / artifact / response / measure structure, attached to a concrete scenario rather than left as a general goal.

| Part                  | Detail 
|---                    |
| **Source + stimulus** | An assigned helper does not accept or decline the errand. 
| **Environment**       | Normal operation; the helper has exactly one active assignment; the helper's device may be offline, silent, or simply unattended.
| **Artifact**          | The errand's assignment record and the helper's availability state. 
| **Response**          | The assignment to that helper expires at the timeout. The errand is reassigned to the next eligible helper. The expired assignment is recorded against the original helper (capacity tracking, not penalty, per D-003). 
| **Measure**           | Reassignment happens within 10 minutes of the original assignment (D-003). No errand is left in AWAITING_ACCEPTANCE beyond that 10-minute window without either a confirmation or a reassignment having occurred. 

## Evidence

What must be recoverable after the fact to show this behaved correctly:
- Assignment identifier
- `assigned_at` and `expires_at` timestamps for the original assignment
- The original helper's ID and the outcome recorded against them (timeout, not decline)
- The reassignment event, including the newly assigned helper's ID and timestamp
- If no next helper was eligible: the backlog flag raised to the Administrator (per the Level 0 context diagram's "capacity backlog flag" flow)

A measurable scenario like this tells the designer what must remain true even when a helper doesn't respond, the same way the reference scenario's 30-second/no-duplicate-publication measure did for a delivery-provider failure.

## Related test coverage

This scenario corresponds directly to `prototype/scenarios/helper-timeout.md` and the "First helper times out" row in `tests/matching-scenario-results.md`. The Measure above (10 minutes, no gap beyond it) is what "Correct?" in that table should actually be checked against once the prototype exists.
