# Business rules: Campus Concierge

Plain-language rollup of the rules defined across `design-record/`. This is a summary for quick reading; the design-record files are the authoritative source if the two ever disagree.

## Domain invariants

Rules the domain model itself enforces, each traced to a design record:

1. **BR-D1:** An Errand's category must be approved at the moment the Errand is created (D-002, BR-01/BR-02).
2. **BR-D2:** An Errand's price is fixed to its category's standard price at post time and does not change even if the category's price changes later (D-001, pricing decision).
3. **BR-D3:** A Helper can be the subject of at most one active (non-terminal) Assignment at a time (D-003, no double-assignment).
4. **BR-D4:** An Assignment's outcome, once recorded, is immutable (supports audit and dispute evidence, D-004).
5. **BR-D5:** An Errand may have at most one Dispute, since DISPUTED is a terminal lifecycle state (D-004).
6. **BR-D6:** Only an Administrator may change an ErrandCategory's approved flag or standard price (D-002, pricing decision).
7. **BR-D7:** A Dispute's resolution can only be set by an Administrator, never directly by the Requester or Helper (D-004).

## Categories (D-001, D-002)
- Only two errand categories are enabled in the first vertical slice: **Parcel Collection** and **Non-assessed Document Printing/Collection**.
- Prohibited categories (never allowed, at any stage): bank/identity representation, submission of assessed academic work, confidential/sensitive documents, restricted goods, high-value purchases, unsafe off-campus travel, or anything requiring the helper to impersonate the requester.
- BR-01: only enabled, admin-approved categories may be posted.
- BR-02: a prohibited-category errand is rejected at creation, not caught later.
- BR-03: a helper is never asked for financial, identity, academic-assessment, or impersonation representation.
- BR-04: the first slice's UI and API only expose the two approved categories.

## Assignment and timeouts (D-003)
- A helper has **10 minutes** to accept or decline an assigned errand.
- Decline or timeout leads to immediate reassignment to the next eligible helper.
- Every declined/expired assignment is recorded against the original helper.
- No eligible helper available leads to the errand entering a backlog state and retrying as helpers free up.

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

## Identity (D-007)
- The identity service is mocked for the prototype rather than integrated with a real system, since D-006 already rules out a real pilot this semester.
