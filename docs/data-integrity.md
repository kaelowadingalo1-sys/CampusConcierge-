# Data integrity: Campus Concierge

States the rules the data must keep, how each is enforced, and how it will be tested. Sources: `models/logical-data-model.drawio`, `docs/api-contracts/core-operation.md`, `models/deployment.drawio`, `models/failure-recovery.drawio`, `docs/business-rules.md`, `docs/quality-scenarios.md`, `decisions/ADR-001-architecture.md`.

## 1. Integrity constraints

| ID | Rule | Source | Enforced by | Test |
|---|---|---|---|---|
| DI-1 | A helper has at most one active assignment | BR-D3, QS-5 | Unique rule on assignment.helper_id where is_active is true, plus one transaction for check and create | Post 50 errands at once against 20 helpers: exactly 20 active assignments, none per helper above 1, 30 errands in backlog |
| DI-2 | An errand has at most one active assignment | D-003 | Unique rule on assignment.errand_id where is_active is true | Offer an errand twice at once: the second attempt is refused |
| DI-3 | An assignment outcome, once set, cannot change | BR-D4 | Database rule that allows outcome to change only from empty to a value | Try to update a recorded outcome: refused, original stays |
| DI-4 | An errand has at most one dispute | BR-D5 | Unique rule on dispute.errand_id | Open a second dispute on the same errand: refused |
| DI-5 | Only an administrator can set a dispute resolution | BR-D7 | Check that resolved_by is set whenever resolution is set; only administrator calls reach the resolve operation | Resolve as requester or helper: refused |
| DI-6 | An errand references an approved category, and its price equals the category price at posting | BR-D1, BR-D2 | Category checked inside the posting transaction; price copied into errand.price and never updated | Change a category price after posting: the errand price is unchanged |
| DI-7 | The same posting key never creates a second errand | FR-01, duplicate-submission alternative flow | Unique rule on errand (requester_id, request_key); request_hash compared on reuse | Send the same request twice: one errand, second call replays the first response |
| DI-8 | Contact and meeting details are readable only after both parties confirm | QS-2, FR-05 | Details held in errand_contact and read only through the confirmation gate, which checks helper_confirmed and requester_confirmed | With only one flag true, no response from any operation contains meeting_point or any phone number |
| DI-9 | Every status change has a history record written in the same transaction | QS-4, D-004 | Status and errand_event written in one transaction | Force a failure after the status update: neither the status nor the event is stored |
| DI-10 | History rows are never edited or deleted | QS-4 | Database permissions allow insert and select only on errand_event | Try to update or delete an event: refused |
| DI-11 | An unsent notification belongs to a live assignment | QS-1 | When an assignment is closed, its unsent outbox rows are cancelled in the same transaction | Close an assignment while its offer is unsent: the row is cancelled and never sent |
| DI-12 | A notification is delivered at most once per outbox row | FR-17 | Outbox id is sent as the idempotency key; sent_at is set after acceptance | Retry after a lost reply: the service receives the same key and does not deliver twice |

## 2. Failure handling

| Failure | Result | Recovery |
|---|---|---|
| Database unavailable during posting | Nothing stored; 503 SERVICE_UNAVAILABLE | Client retries with the same key (DI-7) |
| Crash between steps of posting | Transaction rolls back; no partial errand or assignment | Client retries with the same key |
| Notification Service unavailable when an offer is sent | Data is already committed; the outbox row stays unsent | Dispatcher retries; if the assignment expires first, it is closed and reassigned and the stale offer is cancelled (`models/failure-recovery.drawio`) |
| Application stopped while an assignment expires | Expiry is late, not lost | Expiry time is stored; the scheduler checks stored times at startup and at a short interval |
| Client resubmits after a lost response | One errand only | Replay of the original response (DI-7) |

## 3. Differences from the domain model

The logical model keeps the domain classes (Requester, Helper, Administrator, ErrandCategory, Errand, Assignment, Dispute) and their rules. It adds or changes the following, each for a stated reason.

| Difference | Reason |
|---|---|
| Added errand_contact (meeting_point, requester_phone) and contact_phone on helper | The domain model has no contact or meeting details, but FR-05 and QS-2 need something for the confirmation gate to protect |
| Added errand_event | The domain model describes history in words; QS-4 needs it stored and append-only |
| Added notification_outbox | Needed to send notifications after commit and retry them (ADR-001) |
| Added errand.request_key and request_hash | Needed for duplicate-submission handling (core operation) |
| Added assignment.is_active | The domain rule "one active assignment" needs a flag the database can enforce |
| Added errand.backlog | Backlog is recorded as a flag on a POSTED errand, matching the state diagram, where backlog is not a separate state |
| Dispute opened_by stored as a role | The domain model does not say who opened it; QS-4 review needs it |
| Notification Service and Identity Service have no tables | They are external (Level 0 context diagram), reached through ports |

## 4. Cross-check

| Check | Result |
|---|---|
| Table and column names match domain classes and the sequence (helper_confirmed, requester_confirmed, outcome, expires_at) | Agree |
| Module ownership: each table belongs to one module (workflow: errand, assignment, errand_contact, errand_event, notification_outbox; administration: errand_category, helper, administrator; dispute: dispute; requester shared via identity) | Agree with `models/component-architecture.drawio`; the Dispute module reads errand_event and does not write it |
| Deployment: the database accepts connections from the application node only; contact details leave the server only through the gate | Agree with `models/deployment.drawio` |
| API contract fields map to columns (Idempotency-Key to request_key, meetingPoint to errand_contact) | Agree |
| Open: the requester table is shared by the workflow and dispute modules, and the component view does not say which module owns it | Decide ownership; suggested owner is Category and Helper Administration, renamed to include requesters |

## 5. Traceability

| Requirement or scenario | Data | API | Deployment | Failure |
|---|---|---|---|---|
| FR-01, FR-13 | errand, errand_category (DI-6, DI-7) | Post Errand Request | Application server | Database unavailable |
| FR-02, QS-5 | assignment (DI-1, DI-2) | Step 7 of the operation | Application server, database | Crash between steps |
| QS-1 | assignment.expires_at, notification_outbox (DI-11) | acceptanceExpiresAt | Application server | Notification outage, restart |
| QS-2, FR-05 | errand_contact (DI-8) | meetingPoint never returned | Server zone boundary | none |
| QS-3 | errand.backlog | backlog flag in response | Application server | none |
| QS-4 | errand_event (DI-9, DI-10), dispute (DI-4, DI-5) | none | Database server | none |
| FR-17 | notification_outbox (DI-12) | Step 8 | Notification Service | Notification outage |

## 6. Exit record

- **Integrity risk:** two simultaneous postings giving the same helper two active assignments (DI-1). This is the highest integrity risk because QS-5 asks for zero double assignments and it is the most likely to fail silently under load.
- **Mechanism:** one transaction that checks and creates the assignment, backed by a database rule that allows only one active assignment per helper, so a race fails instead of corrupting data.
- **Test:** post 50 errands at the same time against 20 helpers. Pass only if exactly 20 assignments are active, no helper has more than one, and the other 30 errands are in backlog with the capacity notice queued.
