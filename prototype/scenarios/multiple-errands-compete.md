# Scenario: Several errands compete for helpers

## Initial system state
- Three errands posted at approximately the same time, all status POSTED
- Two eligible registered helpers available: Helper A, Helper B

## Steps
1. System attempts to auto-assign all three errands

## Expected result
- Two errands are assigned (one each to Helper A and Helper B)
- The third errand enters the backlog/unassigned state (same rule as "no helper available")
- No helper receives more than one active assignment at a time
- Assignment order across the three competing errands follows a defined, explainable rule (e.g. post-time order), not an arbitrary one

## Actual result
_To be filled in once the prototype implements this flow._

## Matching rule behaved correctly?
_To be filled in._
