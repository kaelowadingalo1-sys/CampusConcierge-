# Lecturer feedback reference: R1-R6

Source: "Laboratory 2 - Technical Recovery" feedback on the Campus Concierge proposal. Status: Approved with minor conditions.

| Label  | Lecturer's condition | Addressed by |
|---     |---                   |---           | 
| **R1** | Restrict the first vertical slice to one or two low-risk campus errand categories. | `design-record/001-mvp-errand-categories.md` |
| **R2** | Prohibit errands involving bank/identity representation, assessed-work submission, confidential documents, restricted goods, high-value purchases, unsafe off-campus travel, or impersonating the requester. | `design-record/002-safety-and-prohibited-errands.md` |
| **R3** | Define helper acceptance timeouts, reassignment, cancellation, requester no-show, helper no-show, and dispute-resolution rules. | `design-record/003-timeout-and-reassignment.md`, `design-record/004-cancellation-noshow-dispute.md` |
| **R4** | Do not process or store payment information. | `design-record/005-payment-boundary.md` |
| **R5** | Evaluate matching using controlled prototype scenarios; do not run a real pilot unless formal permission is obtained. | `design-record/006-controlled-prototype-evaluation.md`, `prototype/scenarios/`, `tests/matching-scenario-results.md` |
| **R6** | Submit a Level 0 system context diagram showing requester, helper, administrator, and relevant notification/identity services. | `models/context/level-0-context.drawio` |

Related, not part of R1-R6 but decided alongside them:
- **D-007** — identity service is mocked for the prototype rather than integrated with a real system.
