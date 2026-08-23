# Acceptance criteria: Post Errand Request

| ID | Given | When | Then |
|---|---|---|---|
| AC-1 | An approved category, complete task details and a deadline | The requester submits the errand | It is recorded as POSTED with the category's current standard price locked in |
| AC-2 | A category not on the approved list (D-002) | The requester attempts to submit | The system rejects it before any errand record is created |
| AC-3 | No eligible registered helper is currently available | An errand is posted | It stays POSTED, enters the backlog, and a capacity flag is raised to the administrator |
| AC-4 | An assigned helper has not responded | 10 minutes elapse (D-003) | The errand reassigns to the next eligible helper and the timeout is recorded against the original helper |
| AC-5 | The requester's account is not yet confirmed via university email (D-007) | They attempt to post an errand | The system refuses posting until confirmation completes |

Each row traces to the use case in `models/use-cases/post-errand-request-scenario.md` and the design record named in parentheses.
