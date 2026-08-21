# D-004: Cancellation, no-show and dispute rules

## Status
Approved (lecturer condition)

## Decision

### Cancellation
- The requester may cancel freely **before** a helper accepts.
- **After** acceptance, cancellation requires a stated reason and is recorded against the errand's history.
- A cancelled errand cannot re-enter the normal completion flow; it is terminal.

### Requester no-show
- The helper reports arrival at the agreed handoff point.
- The helper waits **10 minutes**.
- If the requester does not appear, the helper reports a requester no-show.
- The event is recorded and may be escalated to a dispute.

### Helper no-show
- The requester reports that the helper did not appear within the agreed window.
- The event is recorded.
- The dispute workflow determines the outcome (see below); this is not auto-resolved.

### Dispute resolution
- Either party may open a dispute on a failed or contested errand.
- The system records the stated reason plus the full recorded event history for that errand (assignment, confirmation, status changes, timestamps).
- An app admin reviews the recorded evidence.
- The admin resolves the dispute with an explicit outcome, which is retained with a timestamp.
- Campus Concierge does not attempt automated or legal/disciplinary adjudication; the admin's recorded resolution is the system's final state for that errand.

## Evidence that changed our mind
Lecturer feedback required explicit rules for cancellation and both directions of no-show, plus a defined (if lightweight) dispute-resolution path, rather than leaving "files a dispute" as an undefined endpoint.

## Consequence we accept
Admins take on a manual review role for every dispute, which does not scale automatically as usage grows. For a semester-sized vertical slice with a small helper pool this is acceptable; it would need a triage or escalation mechanism if adopted more broadly.

## Next uncertainty to investigate
Whether a party who disagrees with the admin's resolution needs any further recourse, or whether the admin's decision is treated as final for the scope of this project.
