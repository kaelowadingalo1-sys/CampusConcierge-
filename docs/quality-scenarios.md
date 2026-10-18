# Quality scenarios: Campus Concierge

Five scenarios, each a distinct quality attribute, in stimulus / context / response / measure form.

| # | Attribute | Stimulus | Context | Response | Measure |
|---|---|---|---|---|---|
| QS-1 | Reliability | Assigned helper does not accept or decline | Helper has one active assignment; device may be offline or silent | Assignment expires; errand reassigns to the next eligible helper; timeout recorded against the original helper (D-003) | The acceptance window itself is fixed at 10 minutes from assignment creation. The system detects expiry and creates the next assignment within 1 minute of that expiry. No errand remains in AWAITING_ACCEPTANCE for more than 11 minutes total from the original assignment's creation. |
| QS-2 | Privacy | An errand is posted and awaiting a match | Other students can browse open errands | Contact and meeting details stay hidden until a helper's assignment is confirmed by both parties | Zero contact-detail exposure to any party before confirmation, checked on every posted errand |
| QS-3 | Availability | An errand is posted with zero eligible helpers currently free | Normal operation, small registered helper pool | Errand enters a backlog state; a capacity flag is raised to the administrator; assignment retries as helpers free up | Backlog flag raised within the same request cycle that found zero helpers; no errand silently dropped |
| QS-4 | Auditability | A dispute is opened on a contested errand | Either party can open a dispute at any point after acceptance | The system reconstructs the full event history (assignment, confirmation, status changes, timestamps) for admin review | 100% of recorded fields available to the admin; no dispute reviewed with missing event history |
| QS-5 | Scalability | A batch of up to 50 errands is posted within the same 10-second window | Helper pool of 20 registered helpers, smaller than the posting batch | Errands are assigned in a defined order (post-time); the remainder enter backlog; no helper receives two active assignments | Zero double-assignments across a 50-errand batch against a 20-helper pool; all errands beyond the 20th enter backlog within that same request cycle |

Each scenario corresponds to a design record and, where applicable, a controlled test scenario:
- QS-1 -> D-003, `prototype/scenarios/helper-timeout.md`
- QS-3 -> D-003, `prototype/scenarios/no-helper-available.md`
- QS-5 -> `prototype/scenarios/multiple-errands-compete.md`
- QS-2, QS-4 -> D-004, D-007 (no dedicated prototype scenario yet)