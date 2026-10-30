# Test results summary

**Run:** 30 October 2026, Node.js 22, PostgreSQL 16, command `npm test` against an empty test database. Result: **21 passed, 0 failed.** `npm run typecheck` reports no errors.

Re-run on your own machine before the demonstration (see README). The tests use real PostgreSQL, fake time and a fake notification service, so the 10-minute window is tested without waiting.

## What each test proves

| Area | Test | Outcome checked | Traces to |
|---|---|---|---|
| Normal | Creates errand, locks price, assigns helper, records history and offer | 201; status AWAITING_ACCEPTANCE; expiry exactly 10 minutes later; 1 errand, 1 active assignment, 2 history events, 1 offer in outbox; meeting point absent from response | FR-01, FR-02, BR-D2, QS-1, QS-2 |
| Normal | Price stays at the locked value after the category price changes | Stored price 20 after category set to 30; next errand priced 30 | BR-D2, DI-6 |
| Normal | No free helper | 201; POSTED, backlog true; administrator flag queued; no assignment | QS-3 |
| Rule | Bad fields | 400 VALIDATION_FAILED naming the three bad fields; 0 errands | FR-01 |
| Rule | Missing idempotency key | 400 naming the header | DI-7 |
| Rule | Non-approved and unknown category | 422 CATEGORY_NOT_APPROVED; 0 errands and 0 history rows | FR-13, BR-D1 |
| Authorisation | Unidentified, unconfirmed and wrong-role callers | 401, 403 ACCOUNT_NOT_CONFIRMED, 403 FORBIDDEN; 0 errands | D-007 |
| Duplicate | Same key and body | 200 with replay header, identical body; still 1 errand and 1 assignment | DI-7 |
| Duplicate | Same key, different body | 409 IDEMPOTENCY_KEY_REUSED; original unchanged | DI-7 |
| Duplicate | Five identical requests at once | One errand, one assignment, one errand id in all responses | DI-7 |
| Workflow | Decline | Next helper offered; first assignment closed as declined; unsent offer cancelled; helper not offered again | FR-03, FR-04, DI-11 |
| Workflow | Timeout | Nothing at 9 minutes; at 10 minutes assignment timed out, next helper offered, history shows the sequence | FR-04, QS-1 |
| Workflow | Late accept before the sweep | 409 OFFER_EXPIRED; nothing changed | QS-1 |
| Workflow | Another helper answers the offer | 404; nothing changed | BR rules on assignment |
| Workflow | Backlog retry | Waiting errand offered to a helper who became free, oldest first; one admin flag per errand | QS-3 |
| Privacy | Confirmation gate | Contact refused to requester and helper before both confirm; status response never contains it; after both confirm both read it; other users get 404 or 401 | QS-2, FR-05, DI-8 |
| Failure | Notification Service down | Posting still 201; offer stays unsent with attempts 1; after expiry the stale offer is cancelled and the new one queued; after recovery only the live offer is sent, once, keyed by its outbox id | DI-11, DI-12 |
| Failure | Database unreachable | 503 SERVICE_UNAVAILABLE | core-operation.md |
| Concurrency | 50 postings at once, 20 helpers | 50 errands; exactly 20 active assignments; none doubled; 30 in backlog | DI-1, QS-5 |
| Database | Direct changes | Recorded outcome cannot change; history cannot be edited or deleted; a second active assignment for one errand is refused | DI-2, DI-3, DI-10 |

## Not covered by automated tests

- The user interface (none is built).
- The 30-second timer in `src/main.ts`. The sweep methods are tested with a fake clock; the timer itself was only run by hand.
- `HttpNotificationGateway` against a real Notification Service. It is tested only through a fake.
- Cancel, work-in-progress, completion, dispute and administrator flows (not built).
- Load beyond 50 postings, and running more than one application instance.
