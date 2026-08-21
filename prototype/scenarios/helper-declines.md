# Scenario: First helper declines

## Initial system state
- One errand posted, status POSTED
- Two eligible registered helpers available: Helper A, Helper B

## Steps
1. System auto-assigns the errand to Helper A (status → AWAITING_ACCEPTANCE)
2. Helper A declines within the timeout window

## Expected result
- Errand is immediately reassigned to Helper B (D-003)
- The decline is recorded against Helper A
- Errand status returns to AWAITING_ACCEPTANCE under the new assignment, not back to POSTED

## Actual result
_To be filled in once the prototype implements this flow._

## Matching rule behaved correctly?
_To be filled in._
