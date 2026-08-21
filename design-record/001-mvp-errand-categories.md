# D-001: First vertical slice is restricted to two low-risk errand categories

## Status
Approved (lecturer condition)

## Decision
The first vertical slice supports exactly two errand categories:

1. **Parcel Collection**
2. **Non-assessed Document Printing/Collection**

No other category is enabled until this slice is complete and demonstrated end to end (post, match, accept, lock terms, start, complete, confirm/dispute).

## Evidence that changed our mind
Lecturer feedback on the Lab 2 proposal (Laboratory 2 — Technical Recovery) required the first vertical slice to restrict to one or two low-risk campus errand categories, rather than the open-ended "any errand" scope originally proposed.

## Consequence we accept
The demo and test scenarios only need to prove the workflow for two structurally different but low-risk categories. This narrows the implementation surface for the semester but means the category/pricing model is only validated against two cases, not a representative spread of errand types.

## Next uncertainty to investigate
Whether additional low-risk categories (e.g. a third, clearly bounded category) should be added once this first slice is working, and what criteria would qualify a new category as "low-risk" for that decision.
