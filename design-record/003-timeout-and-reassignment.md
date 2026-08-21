# D-003: Helper acceptance timeout and reassignment rule

## Status
Approved (lecturer condition)

## Decision
When Campus Concierge auto-assigns an errand to a helper:

- The helper has **10 minutes** to accept or decline.
- If the helper **declines**, the errand is immediately reassigned to the next eligible helper.
- If the helper **does not respond within 10 minutes**, the assignment expires and the errand is reassigned to the next eligible helper.
- Every expired or declined assignment is recorded against the original helper (for capacity planning, not penalty in this slice).
- If no eligible helper exists at assignment time, the errand enters a **backlog/unassigned** state and is retried as helpers become available.

## Evidence that changed our mind
Lecturer feedback required explicit timeout, reassignment, cancellation and no-show rules rather than leaving "the system reassigns" undefined. Ten minutes was chosen as a middle ground: long enough for a helper who is in a lecture or has their phone silenced to plausibly respond, short enough that a requester with a real deadline is not stuck waiting through multiple long timeout cycles.

## Consequence we accept
A requester with an urgent errand could still wait 10+ minutes per failed assignment attempt if several helpers in a row decline or time out. This is an acceptable cost for the first slice given the small registered helper pool, but would need revisiting if the pool stays small while demand grows (see D-002's capacity risk).

## Next uncertainty to investigate
Whether the timeout should vary by errand urgency or deadline proximity once the system has more than one active category, and how many consecutive reassignment attempts should trigger a backlog state versus continuing to retry.
