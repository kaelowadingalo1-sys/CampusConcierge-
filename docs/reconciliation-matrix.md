# Reconciliation matrix: design, code, tests, result

Compares the Phase 1 and Phase 2 design with what is in the repository on 30 October 2026. Differences are disclosed here; the diagrams have **not** been edited to hide them. Test names refer to `tests/workflow.test.ts` (summary in `tests/results-summary.md`).

Result key: **Done** = implemented and tested. **Partial** = some of it. **Not built** = no code. **Differs** = built differently from the design.

## 1. Functional requirements

| Requirement | Code | Test | Result and difference |
|---|---|---|---|
| FR-01 Post errand | `ErrandWorkflowService.postErrand`, `POST /errands` | Normal; validation; duplicate | **Done** at API level. No user interface yet (wireframes only) |
| FR-02 Automatic assignment | `offerToNextHelper` | Normal; 50 against 20 | **Done**. Helpers are tried in helper id order, skipping those already offered. See TD-7 |
| FR-03 Helper accepts or declines in the window | `helperAccept`, `helperDecline` | Decline; late accept; wrong helper | **Done** |
| FR-04 Reassign on decline or timeout | `closeAndReassign`, `expireDueAssignments` | Decline; timeout | **Done** |
| FR-05 Lock terms, reveal contact to both | `requesterConfirm`, `contactFor` | Confirmation gate | **Differs**: terms are locked by the requester's confirmation flag; there is no separate LOCKED status. The price was already locked at posting, not at confirmation |
| FR-06 Cancel | none | none | **Not built** |
| FR-07, FR-08 No-show reports | none | none | **Not built** |
| FR-09, FR-10 Dispute and resolution | `dispute` table only | DB rules only | **Not built** (table and constraints exist; no code) |
| FR-11 Vet and register helpers | none | none | **Not built**. Helpers come from the sample data file |
| FR-12 Adjust category price | none | price lock test changes it by direct SQL | **Not built** as a function. The price lock itself is **Done** |
| FR-13 Reject non-approved category at creation | `postErrand` step 5 | Non-approved; unknown | **Done** |
| FR-14 No financial, identity, assessment or impersonation tasks | none | none | **Not built**. Nothing in the code enforces it; it depends on the category list |
| FR-15 No payment data | schema has no payment fields | inspection only | **Done by omission** |
| FR-16 Account by email-link confirmation | `MockIdentityAdapter` | Authorisation | **Differs** (D-007): identity is mocked with fixed tokens. No email link exists. The FR text and D-007 still disagree |
| FR-17 Notifications | `notification_outbox`, `NotificationDispatcher` | Outage | **Partial**: queued and sent through a port. Only a fake and a log adapter were run. The real Notification Service is not integrated |

## 2. Quality scenarios

| Scenario | Code | Test | Result and difference |
|---|---|---|---|
| QS-1 timeout and reassign within 1 minute | `expireDueAssignments`; 30-second timer in `main.ts` | Timeout; late accept; outage | **Partial**. Logic tested with a fake clock. The timer and the 1-minute measure were not measured end to end; by design the delay is at most 30 seconds plus processing |
| QS-2 no contact before confirmation | `contactFor`; `errand_contact` read only there | Confirmation gate; normal | **Done** for the API. Not verified for any future interface |
| QS-3 backlog flag, nothing dropped | `offerToNextHelper`, `retryBacklog` | No free helper; backlog retry | **Done**. Flag is raised in the same transaction that found no helper |
| QS-4 full history for dispute review | `errand_event`, append-only trigger | Normal; timeout; DB rules | **Partial**. History is recorded for the built transitions only. The administrator review screen and dispute flow are not built |
| QS-5 50 in 10 s against 20 helpers | unique rules + transaction | 50 against 20 | **Done** for correctness (zero doubled, 30 in backlog). **Differs**: errands are handled concurrently, so "assigned in post-time order" is not guaranteed. The 10-second time was not measured |

## 3. Models and decisions

| Design artefact | Code | Result and difference |
|---|---|---|
| Sequence (`models/sequence-core-use-case.drawio`) | `postErrand`, `helperAccept`, `requesterConfirm`, `contactFor` | **Agrees** on the order: post, assign, helper accepts, requester confirms, lock, reveal. The step 6 acknowledgement is the API response |
| Lifecycle (`models/lifecycle-or-activity.drawio`) | status values in schema and code | **Partial**. Built transitions: POSTED to AWAITING_ACCEPTANCE, AWAITING_ACCEPTANCE to ACCEPTED, AWAITING_ACCEPTANCE back to POSTED. IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED, CLOSED exist as allowed values but nothing moves an errand into them |
| Component view (`models/component-architecture.drawio`) | `core/`, `adapters/pg-administration.ts`, `web/` | **Partial**. Web, Errand Workflow and Category and Helper Administration exist as separate code. The Dispute module is not built. **Differs**: the workflow adapter reads the `requester` table (phone copy at posting), because requester ownership was never decided |
| Logical data model (`models/logical-data-model.drawio`) | `migrations-or-schema/001_init.sql` | **Agrees** with all tables and the unique and trigger rules. **Differs**: `notification_outbox` gained `assignment_id` (needed to cancel a stale offer, DI-11) and `recipient_role`; prices are whole numbers |
| API contract (`docs/api-contracts/core-operation.md`) | `web/app.ts`, `postErrand` | **Agrees** with fields, steps and the six listed error codes. **Differs**: six codes added (FORBIDDEN, NOT_FOUND, OFFER_EXPIRED, OFFER_NOT_ACTIVE, NOT_READY, CONTACT_NOT_AVAILABLE) and the accept, decline, confirm, status and contact endpoints are new. The contract says the category is checked inside the transaction; the code checks it just before, through the administration port |
| Failure recovery (`models/failure-recovery.drawio`) | `closeAndReassign`, `NotificationDispatcher` | **Agrees** with messages 1 to 14 in effect and is tested. **Differs**: message 7 sets a next retry time; the code only counts attempts and retries on every 30-second pass, with no back-off or limit |
| Deployment (`models/deployment.drawio`) | one Node process and one database | **Agrees** for one instance. Trust zones and HTTPS are not configured |
| Class design (`models/detailed-class-design.drawio`) | `src/interfaces-or-ports/`, `src/core/`, `src/adapters/` | **Differs** in detail, not in structure: the dependency direction holds (the core imports only interfaces). Changes: `CategoryCatalog.isApproved` and `standardPrice` became `approvedCategoryPrice`; `HelperDirectory.eligibleHelpers` became `availableHelpers`; `AssignmentRepository.save` became `tryCreateActive` and `close`; `NotificationOutbox.nextUnsent` became `listUnsent` and `markFailed`; `ConfirmationGate` is the method `contactFor`, not a class; `ExpiryScheduler` is a timer in `main.ts`; `chooseHelper` is a private function (PD-R1 held) |
| Data integrity (`docs/data-integrity.md`) | schema rules | DI-1 to DI-4, DI-7 to DI-12 enforced and tested. DI-5 (only an administrator resolves) is a constraint on the table with no code path |
| ADR-001, ADR-002 | whole slice | **Agrees**: one application, one database, ports for identity and notifications, outbox, no broker, hand wiring. ADR statuses should be updated after the team review |
| UI design (Lab 10 wireframes) | none | **Not built**. The API error codes match `docs/ui-states.md`, so the screens can be built against it |

## 4. Summary

Built and tested: requirements FR-01 to FR-05 and FR-13 at API level, the privacy gate, the failure behaviour for a Notification Service outage, and the integrity rules. Not built: cancel, no-show, dispute, administrator functions, a user interface and real identity. The largest design change is that terms are locked by a flag, not a status; all other changes are listed above.
