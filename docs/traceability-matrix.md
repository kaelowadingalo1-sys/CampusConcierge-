# Traceability matrix: Campus Concierge

Requirement -> use case -> analysis element -> verification.

| Requirement | Use case | Analysis element | Verification |
|---|---|---|---|
| FR-01 | Post Errand Request | Errand, ErrandCategory | AC-1, AC-2 |
| FR-02 | Post Errand Request | Assignment | prototype/scenarios/multiple-helpers-available.md |
| FR-03 | Confirm or Decline Assigned Errand | Assignment | prototype/scenarios/helper-accepts.md |
| FR-04 | Confirm or Decline Assigned Errand | Assignment | prototype/scenarios/helper-declines.md, helper-timeout.md |
| FR-05 | Confirm or Decline Assigned Errand | Errand, Assignment | AC-1 |
| FR-06 | Cancel Errand | Errand | Pending, no scenario yet |
| FR-07 | Report No Show | Dispute | Pending, no scenario yet |
| FR-08 | Report No Show | Dispute | Pending, no scenario yet |
| FR-09 | Report Dispute | Dispute, Assignment, Errand | QS-4 |
| FR-10 | Resolve Dispute | Administrator, Dispute | QS-4 |
| FR-11 | Register Helper | Administrator, Helper | Pending, no scenario yet |
| FR-12 | Set Category Price | Administrator, ErrandCategory | Pending, no scenario yet |
| FR-13 | Post Errand Request | ErrandCategory, Errand | AC-2 |
| FR-14 | (policy, no single use case) | ErrandCategory | Pending, no scenario yet |
| FR-15 | (policy, no single use case) | Errand, price attribute only | Pending, no scenario yet |
| FR-16 | Confirm Account via University Email | outside domain model, see D-007 | Pending, no scenario yet |
| FR-17 | Receive Notification | outside domain model, external service | Pending, no scenario yet |

## Abbreviations
- **FR** = Functional Requirement (docs/functional-requirements.md)
- **AC** = Acceptance Criterion (docs/acceptance-criteria.md)
- **QS** = Quality Scenario (docs/quality-scenarios.md)
- **D** = Design record / decision (design-record/)

## Note on gaps
Rows marked "Pending" have a real requirement and a real use case but no acceptance criterion or scenario written yet. 