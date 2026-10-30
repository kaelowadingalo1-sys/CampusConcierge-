# User profiles and task scenarios: Campus Concierge

Sources: `docs/stakeholders.md`, `docs/functional-requirements.md`, `docs/use-cases/UC-Post-Errand-Request.md`, `docs/api-contracts/core-operation.md`, `docs/quality-scenarios.md`. Screens: `prototype/wireframes.drawio`. Navigation: `models/navigation.drawio`.

## 1. Primary user: the requester

| Item | Description |
|---|---|
| Who | A University of Botswana student who needs a small errand done, such as collecting a parcel or printing a document, and is short of time |
| Context of use | On a phone, between classes or in a residence room, often on campus wifi or mobile data that may drop |
| Goal | Get the errand accepted by a helper without having to chase anyone |
| Concern | The helper does not show up, or the agreed terms are disputed later (stakeholders) |
| Skill | Uses messaging and banking apps daily; has not used this service before |

### Task T1: Post an errand and get a confirmed helper

**Scenario.** Thato has a parcel waiting at the courier point and a lecture until 15:00. She wants it collected before 17:00 on Friday. She opens Campus Concierge, posts the errand and expects to know quickly whether someone has taken it.

| Step | User action | System response | Screen |
|---|---|---|---|
| 1 | Opens My errands and chooses Post an errand | Shows the form | R1 |
| 2 | Chooses the category | Shows the standard price (P20) | R1 |
| 3 | Enters task details, deadline and meeting point, then posts | Creates the errand, assigns a helper if one is free | R2 or R2b |
| 4 | Waits | Shows status and when the offer expires | R2 |
| 5 | Is told a helper accepted, then confirms | Locks the terms and shows contact details | R3, R4 |

**Success criteria**
- A first-time user posts a valid errand in 90 seconds or less, with no help.
- The user can say, from the screen alone, what the price is and what state the errand is in.
- No contact or meeting detail is visible before both parties confirm (QS-2).
- A user whose connection drops while posting can retry without creating a second errand (idempotency key).

## 2. Secondary user: the helper

| Item | Description |
|---|---|
| Who | A vetted student registered to run errands |
| Context of use | On a phone, possibly in a lecture or walking; the offer arrives as a notification |
| Goal | Decide quickly whether to take an errand, with the terms clear |
| Concern | Being blamed later when there is no record of what was agreed (stakeholders) |

### Task T2: Respond to an errand offer within the window

**Scenario.** Kabelo gets a notification that an errand is offered to him. He has 10 minutes to answer. He opens it, checks the category, price and deadline, and accepts or declines.

| Step | User action | System response | Screen |
|---|---|---|---|
| 1 | Opens the offer notification | Opens the offer directly | H1 |
| 2 | Reads category, price, deadline, task | Shows the time left to respond | H1 |
| 3 | Accepts (or declines) | Records the answer; accept waits for the requester, decline passes it on | H2 |
| 4 | Waits | Shows terms and contact details after the requester confirms | H4 |

**Success criteria**
- The helper can answer in 2 actions from the notification.
- The helper can tell from the screen how long is left, in words, without watching a moving display.
- A helper who opens the offer after the window sees that it expired, not an error (H3).
- No contact or meeting detail is visible before both confirm (QS-2).

## 3. Administrator task (not designed in this lab)

Vetting helpers, setting category prices and resolving disputes (FR-10 to FR-12) are not wireframed here. T1 and T2 are the critical path of the first vertical slice. The administrator screens follow when the dispute slice starts.

## 4. Why these tasks

- T1 and T2 are the two halves of the core use case and the only ones with a time limit (QS-1) and a privacy rule (QS-2) that the screen has to respect.
- A realistic alternative was to design the administrator dispute screen first. It was left out because it is used rarely and by one person, while T1 and T2 decide whether an errand gets done at all.

## 5. Traceability

| Task or screen | Requirement | Quality scenario or rule |
|---|---|---|
| T1, R1 | FR-01, FR-13 | BR-D1, BR-D2 |
| T1, R2 | FR-02, FR-06 | QS-1 (expiry shown) |
| T1, R2b | FR-02 | QS-3 (backlog explained) |
| T1, R3, R4 | FR-05 | QS-2 |
| T2, H1 | FR-03, FR-17 | QS-1 |
| T2, H3 | FR-04 | QS-1 |
| T2, H2, H4 | FR-05 | QS-2 |
