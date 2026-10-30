# API contract: Post Errand Request

Core operation of Campus Concierge. It realises `docs/use-cases/UC-Post-Errand-Request.md` and sequence messages 1 to 4 and 5b to 6b in `models/sequence-core-use-case.drawio`. Requirements: FR-01, FR-02, FR-13. Rules: BR-D1, BR-D2, BR-01, BR-02. Quality: QS-2, QS-3, QS-5.

The response is the acknowledgement for use-case step 6 (confirm the errand identifier and status to the requester), which was previously implicit.

## 1. Operation

```
POST /errands
```

The caller is identified by the identity check port, not by a field in the body. Only requesters may call it.

### Request

| Part | Field | Type | Required | Rule |
|---|---|---|---|---|
| Header | Idempotency-Key | text, 8 to 64 characters | Yes | Identifies one user intent. A resubmission uses the same key. Stored as errand.request_key. |
| Body | categoryId | integer | Yes | Must exist and be approved at the moment of the request (BR-D1, BR-01, BR-02). |
| Body | taskDetails | text, 1 to 500 characters | Yes | Not blank. |
| Body | deadline | date and time | Yes | Must be later than the time of the request. |
| Body | meetingPoint | text, 1 to 200 characters | Yes | Stored in errand_contact. Never returned in this response or in browse results (QS-2). |

Example:

```
POST /errands
Idempotency-Key: 7f3c9a12-4b1e-4c55
{
  "categoryId": 1,
  "taskDetails": "Collect parcel from courier point, name on the label is T. Moeng",
  "deadline": "2026-10-02T17:00:00+02:00",
  "meetingPoint": "Student centre, main entrance"
}
```

## 2. Validation and rules, in order

| Step | Check | Failure outcome |
|---|---|---|
| 1 | Caller is identified and the account is usable | 401 NOT_AUTHENTICATED or 403 ACCOUNT_NOT_CONFIRMED |
| 2 | Idempotency-Key present | 400 VALIDATION_FAILED |
| 3 | Same key already used by this requester | Same body: replay the original response. Different body: 409 IDEMPOTENCY_KEY_REUSED |
| 4 | Field validation (table above) | 400 VALIDATION_FAILED |
| 5 | Category exists and is approved (BR-D1) | 422 CATEGORY_NOT_APPROVED. No errand record is created |
| 6 | Create errand with price = category's current standard price (BR-D2), status POSTED, event recorded | 503 SERVICE_UNAVAILABLE if the database fails. Nothing is stored |
| 7 | Find an eligible helper and create the assignment in the same transaction (QS-5) | If none: set backlog = true and queue the capacity notice to the administrator (QS-3). The request still succeeds |
| 8 | Commit, then dispatch notifications from the outbox | A notification failure never fails the request |

Steps 6 and 7 commit together or not at all. A partial errand never exists.

## 3. Success response

`201 Created` for a new errand. `200 OK` with header `Idempotent-Replay: true` when the same key and body are sent again; the body is identical to the original.

Helper found:

```
{
  "errandId": 412,
  "status": "AWAITING_ACCEPTANCE",
  "backlog": false,
  "price": 20,
  "deadline": "2026-10-02T17:00:00+02:00",
  "acceptanceExpiresAt": "2026-09-30T14:10:00+02:00"
}
```

No helper available:

```
{
  "errandId": 413,
  "status": "POSTED",
  "backlog": true,
  "price": 20,
  "deadline": "2026-10-02T17:00:00+02:00",
  "acceptanceExpiresAt": null
}
```

The response never contains meetingPoint, phone numbers or the helper's identity (QS-2).

## 4. Error responses

All errors use one shape:

```
{ "error": "CATEGORY_NOT_APPROVED", "message": "text for the user", "fields": [] }
```

`error` is a stable code that clients can rely on. `message` can change. `fields` lists field names for VALIDATION_FAILED and is empty otherwise.

| Status | error | Meaning | Errand created | Safe to retry |
|---|---|---|---|---|
| 400 | VALIDATION_FAILED | A field is missing, blank, too long or the deadline is in the past | No | After fixing the fields |
| 401 | NOT_AUTHENTICATED | The caller could not be identified | No | After signing in |
| 403 | ACCOUNT_NOT_CONFIRMED | The identity check port reports the account cannot post | No | After the account is usable |
| 409 | IDEMPOTENCY_KEY_REUSED | The key was used with a different request body | No (original stands) | With a new key |
| 422 | CATEGORY_NOT_APPROVED | The category is not on the approved list (BR-01, BR-02) | No | With an approved category |
| 503 | SERVICE_UNAVAILABLE | The database could not be reached | No | Yes, with the same key |

## 5. Guarantees

- Exactly one errand per requester and key (database rule on requester_id and request_key).
- The price in the response equals the price stored; it does not change later even if the category price changes (BR-D2).
- A repeated request with the same key and body never creates a second errand or a second assignment.
- A notification outage does not change the response or the stored data. See `models/failure-recovery.drawio`.

## 6. Rationale and alternative

- **Idempotency key chosen over duplicate detection by content.** Two real errands can look identical, such as two printing jobs, so comparing content would wrongly block them. A key from the client separates "same intent resent" from "two intents". The consequence accepted: the client must generate and keep a key.
- **Assignment created in the same call.** This follows the sequence and the lifecycle edge "errand posted [helper auto-assigned]". The consequence accepted: the call does more work, but the requester sees the true status immediately and no errand waits for a separate matching step.
