# Use case: Post Errand Request

**Actor:** Requester
**Precondition:** The requester has a confirmed account (D-007).
**Postcondition:** A validated errand exists in POSTED status, tied to an approved category and its current standard price, with the requester able to see its status.

## Success scenario

A conversation across the system boundary, not a list of interface actions:

1. Requester selects an approved errand category.
2. Campus Concierge retrieves the category's current standard price and general backlog status.
3. Requester supplies the task details and a deadline.
4. Campus Concierge validates the category against the approved/prohibited list (BR-01, BR-02).
5. Campus Concierge records the errand as POSTED, with the category's standard price locked in as the recorded price.
6. Campus Concierge confirms the errand identifier and status to the requester.

## Alternative flows

| Scenario | Required system response | Design principle |
|---|---|---|
| Category is not on the approved list | Reject the request before creating any errand record. | Access policy (BR-01, BR-02 / D-001, D-002) |
| No eligible helper is currently available | Still record the errand as POSTED; flag the capacity backlog to the Administrator. | Failure policy (D-003) |
| Requester's account is not yet confirmed | Refuse posting until university-email confirmation completes (D-007). | Access policy |
| Duplicate submission (same task resubmitted quickly) | Return the existing pending errand rather than creating a second one. | Idempotency |
| Category's standard price changed between the requester viewing it and submitting | Use the current standard price at the moment of submission, not a cached one from step 2. | Version identity |

## Scenario steps become obligations

Tracing each main-flow step into the design question it raises, before any class or table is named:

- Select category: stable category identity and its associated standard price
- Retrieve standard price / backlog: source boundary and failure handling if that lookup fails
- Supply task details and deadline: draft data capture and validation
- Validate category: policy enforcement and business-rule evidence (BR-01, BR-02)
- Record errand as POSTED: state and audit trail (see `models/state/errand-lifecycle.drawio`)
- Confirm identifier and status: the interface contract returned to the requester