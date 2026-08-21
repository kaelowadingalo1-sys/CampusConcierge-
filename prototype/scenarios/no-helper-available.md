# Scenario: No helper available

## Initial system state
- One errand posted, status POSTED
- Zero eligible registered helpers are currently available (all busy or none registered for this category)

## Steps
1. System attempts to auto-assign the errand

## Expected result
- No assignment is made
- Errand enters a backlog/unassigned state (D-003)
- The system flags the capacity backlog to the Administrator (per the context diagram's "capacity backlog flag" flow)
- Assignment is retried automatically once a helper becomes available

## Actual result
_To be filled in once the prototype implements this flow._

## Matching rule behaved correctly?
_To be filled in._
