# Consistency matrix: Post and accept an errand

Links each use-case step to the sequence-diagram messages that realise it, the responsible
class (per the CRC cards), the lifecycle state it produces or requires, and the requirement(s)
and business rule(s) it traces to. Scope is the full "Post and accept an errand" interaction:
`docs/use-cases/UC-Post-Errand-Request.md` covers steps 1-6 (ending at POSTED); the matching and
acceptance phase in Section C continues past that use case's postcondition and is currently
represented only in `models/sequence-core-use-case.drawio`.

Sources: `docs/use-cases/UC-Post-Errand-Request.md`, `models/sequence-core-use-case.drawio`,
`docs/crc-cards.md`, `models/errand-lifecycle.svg`, `docs/functional-requirements.md`, `docs/business-rules.md`,
`docs/quality-scenarios.md`.

## A. Main flow (UC-Post-Errand-Request)

| Step | Use-case step | Sequence message(s) | Responsible class (CRC) | Resulting state | Requirement / rule |
|---|---|---|---|---|---|
| 1 | Requester selects an approved category | 1: postErrand(categoryId, taskDetails, deadline) *(part)* | Requester (actor) | - | FR-01 |
| 2 | System retrieves the category's standard price / backlog status | 2: isApproved(); 3: approved/rejected, standardPrice | ErrandCategory - "Know its own approved status and standard price" | - | FR-01, BR-D1 |
| 3 | Requester supplies task details and deadline | 1: postErrand(...) *(part)* | Requester (actor) | - | FR-01 |
| 4 | System validates the category (BR-01, BR-02) | 2: isApproved(); 3: approved/rejected | ErrandCategory - "Refuse to let a new Errand reference it while not approved (BR-D1)" | rejected -> no Errand created; approved -> continues | FR-13, BR-D1 |
| 5 | System records the errand as POSTED, price locked | 4: lockPrice(standardPrice) | Errand - "Lock its price to the category's standard price at posting time (BR-D2)" | POSTED | FR-01, BR-D2 |
| 6 | System confirms the errand identifier and status to the requester | *not separately drawn* | Errand | POSTED | FR-01. **Gap:** this is an implicit synchronous return after step 5, not its own message on the diagram. Flagged as a Lab 6 candidate fix (add an explicit ack message after 4: lockPrice). |

## B. Alternative flows (UC-Post-Errand-Request)

| Alt flow | Sequence message(s) | Responsible class (CRC) | Resulting state | Requirement / rule |
|---|---|---|---|---|
| Category not on the approved list | *opt* frame: 3a notify(requester, errandRejected); 3b errandRejected notification | ErrandCategory / Errand (rejects before any record is created) | no Errand record created | FR-13, BR-D1 |
| No eligible helper currently available | *alt* [else] branch: 5b enterBacklog(), status = Backlog; 6b notify(admin, capacityFlag) | Errand (status management, extends "know its own status") | POSTED, backlog sub-state. **Note:** backlog is not a separate node on the state diagram - see Known gaps below | FR-02, QS-3 |
| Requester's account is not yet confirmed | *not modelled* | - | - | FR-16, D-007. **Gap:** no diagram currently shows this precondition check |
| Duplicate submission | *not modelled* | - | - | **Gap:** idempotency behaviour is not represented in any current diagram |
| Category price changed between view and submission | covered implicitly: 2/3 (isApproved / standardPrice) are read synchronously inside the same postErrand call, so no cached value is used | ErrandCategory | POSTED, current price locked | FR-01, BR-D2 |

## C. Matching and acceptance (sequence-diagram continuation, supports FR-02 to FR-05)

| Phase | Sequence message(s) | Responsible class (CRC) | Resulting state | Requirement / rule |
|---|---|---|---|---|
| Offer to eligible helper | *alt* [eligible helper found]: 5 createAssignment(eligibleHelper); 6 notify(helper, assignmentOffer); 7 assignmentOffer notification | Assignment - "Know which helper it was offered to, and when" | AWAITING_ACCEPTANCE | FR-02, BR-D3 |
| Helper confirms | 8 confirm(); 9 recordAcceptance(), helperConfirmed = true | Assignment - "Record its own outcome once decided" | AWAITING_ACCEPTANCE (helperConfirmed = true) | FR-03 |
| Requester confirms (both-party gate) | 9b notify(requester, helperAccepted); 9c helperAccepted notification; 9d confirm() | Assignment (requesterConfirmed flag) | AWAITING_ACCEPTANCE (both flags true) | FR-05, QS-2 |
| Lock terms, reveal contacts | 10 lockTerms(), status = Confirmed [requires both]; 11 notify(contactDetailsRevealed); 12 confirmation + contact details | Errand - "Validate that a requested status transition is legal"; Assignment | ACCEPTED | FR-05, QS-2 |
| Decline or timeout, reassign | 13 decline() / window expires; 14 recordOutcome(declined \| timedOut); 15 requestReassignment(); 16 createAssignment(nextEligibleHelper) | Assignment - "Record its own outcome once decided"; "Know whether its acceptance window has expired" | AWAITING_ACCEPTANCE (next helper), or POSTED if no eligible helper remains (decline/timeout -> POSTED edge on the state diagram) | FR-04, QS-1, BR-D3 |
| Status update to requester | 17 errandStatusUpdate(Confirmed) | Errand | ACCEPTED | FR-05 |
