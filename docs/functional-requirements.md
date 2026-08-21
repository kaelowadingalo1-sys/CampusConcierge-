# Functional requirements: Campus Concierge

Each requirement is written as an actor goal and traces to the design-record decision that justifies it.

| ID    | Requirement | Traces to |
|---    |---          |---        |
| FR-01 | A requester can post an errand request under an approved category, with task details and a deadline. | D-001, D-002 |
| FR-02 | The system automatically assigns a posted errand to an available registered helper. | D-003 |
| FR-03 | An assigned helper can confirm or decline the errand within the acceptance window. | D-003 |
| FR-04 | If a helper declines or does not respond within the acceptance window, the system reassigns the errand to the next eligible helper. | D-003 |
| FR-05 | Once an errand is confirmed, the system locks the agreed terms (task, category, standard price, deadline) and reveals contact/meeting details to both parties. | D-003, D-005 |
| FR-06 | A requester can cancel an errand freely before acceptance; cancellation after acceptance requires a stated reason and is recorded. | D-004 |
| FR-07 | A helper can report a requester no-show after waiting the defined window at the handoff point. | D-004 |
| FR-08 | A requester can report a helper no-show if the helper does not appear within the agreed window. | D-004 |
| FR-09 | Either party can open a dispute on a contested or failed errand; the system captures the full recorded event history as evidence. | D-004 |
| FR-10 | An administrator can review a dispute's recorded evidence and resolve it with a retained, timestamped outcome. | D-004 |
| FR-11 | An administrator can vet and register a student as a helper. | D-002 (App admin stakeholder) |
| FR-12 | An administrator can set and adjust the standard price for an errand category. | Category pricing decision |
| FR-13 | The system rejects an errand posted under a prohibited or non-approved category at creation, not later. | D-001, D-002 (BR-01, BR-02) |
| FR-14 | The system never requires a helper to perform financial, identity, academic-assessment, or impersonation representation, regardless of category. | D-002 (BR-03) |
| FR-15 | The system does not process, transfer, or store payment information; only the category's standard price is recorded as data. | D-005 |
| FR-16 | A student creates an account by confirming a link sent to their university email address; the account is self-service after that. | D-007 |
| FR-17 | A requester or helper receives status, assignment, and dispute notifications through the Notification Service. | Level 0 context diagram |

## Note on scope
This list covers the first vertical slice only (Parcel Collection and Non-assessed Document Printing/Collection, per D-001).
