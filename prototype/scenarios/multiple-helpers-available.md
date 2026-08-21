# Scenario: Multiple helpers available

## Initial system state
- One errand posted, status POSTED
- Three eligible registered helpers available: Helper A, Helper B, Helper C

## Steps
1. System auto-assigns the errand

## Expected result
- Exactly one helper is assigned (the "next available" helper per the assignment ordering rule, e.g. longest-idle-first)
- The other two remain available for other errands
- No errand is ever assigned to more than one helper at a time

## Actual result
_To be filled in once the prototype implements this flow._

## Matching rule behaved correctly?
_To be filled in._
