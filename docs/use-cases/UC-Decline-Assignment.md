# Use case: Decline Errand Assignment

**Primary actor:** Helper
**Supporting actors:** Notification Service, Administrator (backlog flag only)
**Trigger:** An assignment offer has been sent to the helper (sequence message 6-7) and the errand is in AWAITING_ACCEPTANCE.
**Precondition:**
- The helper is registered and vetted (FR-11).
- An Assignment exists for this helper and errand, with no outcome recorded yet (BR-D4).
- The Assignment's acceptance window (10 minutes from creation, QS-1) has not expired.

**Postcondition (success):**
- The Assignment's outcome is recorded as declined and cannot change afterwards (BR-D4).
- The helper has no active assignment for this errand and is free for others (BR-D3).
- The errand has been offered to the next eligible helper and remains in AWAITING_ACCEPTANCE, or, if no helper is eligible, is back in POSTED in backlog with a capacity flag raised to the Administrator (QS-3).
- The requester's contact and meeting details have not been revealed to anyone (QS-2).

## Success scenario

1. Helper opens the assignment offer received through the Notification Service.
2. Helper chooses to decline the offer.
3. Campus Concierge checks that the Assignment has no outcome yet and its acceptance window has not expired (Assignment.hasExpired()).
4. Campus Concierge records the outcome as declined against the Assignment (message 14: recordOutcome(declined)).
5. Campus Concierge frees the helper from this assignment so the helper can receive other offers (BR-D3).
6. Campus Concierge requests reassignment of the errand (message 15: requestReassignment()).
7. Campus Concierge selects the next eligible helper and creates a new Assignment for them (message 16: createAssignment(nextEligibleHelper)).
8. Campus Concierge notifies the new helper of the offer (same flow as messages 6-7).
9. Campus Concierge shows the declining helper that the decline was recorded.

The requester is not notified of an individual decline. The errand stays in AWAITING_ACCEPTANCE from their point of view, and they only see a status update once an assignment is confirmed (message 17).

## Alternative flows and failure conditions

| Scenario | Required system response | Design principle |
|---|---|---|
| Acceptance window expires before the helper declines (helper silent or offline) | Same path as steps 4-8, but the outcome is recorded as timedOut, not declined. A decline arriving after expiry is rejected with a message that the offer has already expired. | Failure policy (QS-1, D-003) |
| No next eligible helper exists at step 7 | Record the decline as normal. The errand returns to POSTED in backlog and a capacity flag is raised to the Administrator in the same request cycle. No errand is dropped. | Failure policy (QS-3, D-003) |
| Helper submits decline twice, or declines and the window expires at the same moment | The first outcome recorded wins. Any later attempt is rejected and the stored outcome is unchanged. | Immutability and audit (BR-D4, D-004) |
| Requester cancels the errand while the offer is outstanding | Cancellation takes precedence (free cancellation before acceptance, FR-06). The Assignment is closed, the errand moves to CANCELLED, and a late decline is rejected as no longer applicable. | State legality (Errand.canTransitionTo) |
| Notification to the next helper fails to send | The new Assignment is still created and its window starts. Delivery is retried, and if the helper never sees it, the window expires and the normal timeout path applies. | Failure policy, no silent loss |
| The decline request cannot be recorded (system error) | Report the failure to the helper and leave the Assignment unchanged. The helper may retry while the window is open. | Atomicity |
| Helper declines after already confirming but before the requester confirms | **Open question for the team.** Current model has no withdraw rule. Either block it (confirmation is binding) or allow it and reset helperConfirmed. Decision needed before this is treated as final. | Both-party confirmation (QS-2) |

## Scenario steps become obligations

- Open offer: the offer must carry enough to decide on (category, price, deadline) without revealing contact details (QS-2)
- Decline: a single, authoritative place that decides whether an outcome may still be set (Assignment, BR-D4)
- Check window: expiry must be computed from stored times, not from the helper's device clock (Assignment.hasExpired())
- Record outcome: an immutable, timestamped record that later supports dispute evidence (BR-D4, QS-4)
- Free the helper: the one-active-assignment rule must hold at the moment of decline, or the helper is wrongly excluded from new offers (BR-D3)
- Reassign: ordered selection of the next eligible helper, with a defined end when none remain (QS-3, QS-5)

## Traceability

| Item | References |
|---|---|
| Requirements | FR-03, FR-04, FR-17 |
| Business rules | BR-D3, BR-D4 |
| Quality scenarios | QS-1, QS-2, QS-3, QS-4 |
| Sequence messages | 13: decline(); 14: recordOutcome; 15: requestReassignment(); 16: createAssignment(nextEligibleHelper) |
| Lifecycle | AWAITING_ACCEPTANCE -> POSTED (decline or timeout edge), then POSTED -> AWAITING_ACCEPTANCE; POSTED -> CANCELLED for the cancel-during-offer case |
| Classes | Assignment, Errand, Helper |