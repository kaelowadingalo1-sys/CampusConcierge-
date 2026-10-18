# Traceability matrix: Campus Concierge

Requirement -> use case -> analysis element -> verification.

| Requirement | Use case | Analysis element | Verification |
|---|---|---|---|
| FR-01 | Post Errand Request | Errand, ErrandCategory | AC-1, AC-2 |
| FR-02 | Post Errand Request | Assignment | prototype/scenarios/multiple-helpers-available.md, AC-3 |
| FR-03 | Decline Errand Assignment | Assignment | prototype/scenarios/helper-accepts.md, helper-declines.md |
| FR-04 | Decline Errand Assignment | Assignment | AC-4, prototype/scenarios/helper-declines.md, helper-timeout.md, QS-1 |
| FR-05 | Post Errand Request (confirmation phase) | Errand, Assignment | AC-1, QS-2 |
| FR-06 | Cancel Errand | Errand | AC-6: cancel from POSTED or AWAITING_ACCEPTANCE is free and ends in CANCELLED; cancel after ACCEPTED needs a reason |
| FR-07 | Report No Show | Dispute | AC-7: helper reports after waiting the defined window; one Dispute is created |
| FR-08 | Report No Show | Dispute | AC-8: requester reports a helper who has not appeared in the agreed window |
| FR-09 | Report Dispute | Dispute, Assignment, Errand | QS-4, AC-9: a second Dispute on the same errand is refused (BR-D5) |
| FR-10 | Resolve Dispute | Administrator, Dispute | QS-4, AC-10: a resolution set by a non-administrator is refused (BR-D7) |
| FR-11 | Register Helper | Administrator, Helper | AC-11: only a registered helper receives assignment offers |
| FR-12 | Set Category Price | Administrator, ErrandCategory | AC-12: a price change applies to new errands only (BR-D2, BR-D6) |
| FR-13 | Post Errand Request | ErrandCategory, Errand | AC-2 |
| FR-14 | (policy, no single use case) | ErrandCategory | Review check: no approved category allows financial, identity, assessment or impersonation tasks (BR-03) |
| FR-15 | (policy, no single use case) | Errand, price attribute only | Review check: no payment field exists in the domain model, only the locked category price |
| FR-16 | Confirm Account via University Email | outside domain model, see D-007 | AC-5 |
| FR-17 | Receive Notification | outside domain model, external service | AC-17: offer, helper-accepted, contact-reveal and rejection notifications are each sent once |

## Abbreviations
- **FR** = Functional Requirement (docs/functional-requirements.md)
- **AC** = Acceptance Criterion (docs/acceptance-criteria.md)
- **QS** = Quality Scenario (docs/quality-scenarios.md)
- **BR** = Business Rule (docs/business-rules.md)
- **D** = Design record / decision (design-record/)

## Note on gaps
AC-6 to AC-12 and AC-17 are defined here but not yet written in docs/acceptance-criteria.md. FR-14 and FR-15 are verified by review check, not by a scenario.