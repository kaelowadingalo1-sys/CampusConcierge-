# Scenario: First helper times out

## Initial system state
- One errand posted, status POSTED
- Two eligible registered helpers available: Helper A, Helper B

## Steps
1. System auto-assigns the errand to Helper A (status → AWAITING_ACCEPTANCE)
2. Helper A neither accepts nor declines within 10 minutes

## Expected result
- Assignment to Helper A expires automatically at the 10-minute mark (D-003)
- Errand is reassigned to Helper B
- The expired assignment is recorded against Helper A (capacity tracking, not penalty)

## Actual result
_To be filled in once the prototype implements this flow._

## Matching rule behaved correctly?
_To be filled in._
