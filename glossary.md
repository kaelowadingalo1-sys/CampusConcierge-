# Campus Concierge glossary

| Term | Working definition |
|---|---|
| Requester | A student who posts an errand they need completed. |
| Helper | A student who has been vetted and registered by an administrator to complete errands. |
| Errand | A request in a defined category with task details, a deadline and a standard price. |
| Errand category | An administrator-managed grouping of errands that has one fixed standard price. |
| Deal | The traceable agreement created when a helper confirms an assigned errand. |
| Standard price | The non-negotiable price recorded for an errand category; the system records it but does not process payment. |
| Assignment | The system's allocation of a posted errand to the next available registered helper. |
| Reassignment | Allocation to another eligible helper after a decline or missed response window. |
| Backlog | The state of a posted errand with no eligible helper currently available; retried as helpers free up. |
| Dispute | A requester or helper report that an errand was not completed as agreed, supported by the recorded deal. |
| App admin | The role that vets helpers, maintains category prices and monitors assignment capacity. |
| Identity Service | The external entity a real login would depend on; mocked for this semester's prototype (D-007). |
| Notification Service | The external channel used for signup confirmation and assignment/status/dispute alerts. |
| Errand status | The lifecycle a single errand moves through: POSTED, AWAITING_ACCEPTANCE, ACCEPTED, IN_PROGRESS, COMPLETED, CLOSED, with exception paths to REASSIGN, CANCELLED or DISPUTED. See `models/state/errand-lifecycle.drawio`. |

## Traceability

Every term above is used as written in `docs/problem-and-scope.md` (the approved problem and scope) and `docs/stakeholders.md` (the five stakeholders: Requester, Helper, App admin, Residence/hall administration, University IT). Where a term maps to a specific design decision, the relevant `design-record/` file is referenced directly in this table rather than repeated here.