# Scenario: Helper accepts

## Initial system state
- One errand posted in category "Parcel Collection", status POSTED
- Exactly one eligible registered helper is available (status: available, no active assignment)

## Steps
1. System auto-assigns the errand to the available helper (status → AWAITING_ACCEPTANCE)
2. Helper confirms acceptance within the 10-minute window (D-003)

## Expected result
- Errand status moves to ACCEPTED
- Terms (task, category, standard price, deadline) are locked
- Contact/meeting details are revealed to both parties
- Assignment is recorded with helper ID and timestamp

## Actual result
_To be filled in once the prototype implements this flow._

## Matching rule behaved correctly?
_To be filled in._
