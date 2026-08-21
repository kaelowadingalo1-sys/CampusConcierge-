# Business rules summary: Campus Concierge

Plain-language rollup of the rules defined across `design-record/`. This is a summary for quick reading; the design-record files are the authoritative source if the two ever disagree.

## Categories (D-001, D-002)
- Only two errand categories are enabled in the first vertical slice: **Parcel Collection** and **Non-assessed Document Printing/Collection**.
- Prohibited categories (never allowed, at any stage): bank/identity representation, submission of assessed academic work, confidential/sensitive documents, restricted goods, high-value purchases, unsafe off-campus travel, or anything requiring the helper to impersonate the requester.
- BR-01: only enabled, admin-approved categories may be posted.
- BR-02: a prohibited-category errand is rejected at creation, not caught later.
- BR-03: a helper is never asked for financial, identity, academic-assessment, or impersonation representation.
- BR-04: the first slice's UI and API only expose the two approved categories.

## Assignment and timeouts (D-003)
- A helper has **10 minutes** to accept or decline an assigned errand.
- Decline or timeout → immediate reassignment to the next eligible helper.
- Every declined/expired assignment is recorded against the original helper.
- No eligible helper available → errand enters a backlog state and retries as helpers free up.

## Cancellation and no-shows (D-004)
- Requester can cancel freely before a helper accepts.
- After acceptance, cancellation needs a stated reason and is recorded.
- Helper waits 10 minutes at the handoff point before reporting a requester no-show.
- Requester reports a helper no-show if the helper doesn't appear in the agreed window.
- Either no-show can be escalated to a dispute.

## Disputes (D-004)
- Either party can open a dispute on a contested or failed errand.
- The system captures the full recorded event history as evidence.
- An app admin reviews and resolves the dispute; the resolution is final within this system (no automated or legal adjudication).

## Payment (D-005)
- No payment is processed, transferred, or held by the system.
- No payment credentials (bank, card, mobile-money) are ever stored.
- Only the category's fixed standard price is recorded as data, as part of the deal.

## Evaluation (D-006)
- The matching/assignment logic is evaluated against controlled, synthetic scenarios (see `prototype/scenarios/` and `tests/matching-scenario-results.md`).
- No real pilot with live student requests runs without separate formal permission.
