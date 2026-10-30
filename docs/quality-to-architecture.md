# Quality scenarios to architecture

Translates the project's quality scenarios and constraints into design obligations, then shows which architecture element answers each one. The three scenarios that most strongly shape the architecture are marked **primary**. Elements are defined in `models/component-architecture.drawio` and `decisions/ADR-001-architecture.md`.

## 1. Design obligations

| Scenario | Primary | Obligation on the architecture | Architectural response | Element |
|---|---|---|---|---|
| QS-5 Scalability (50 errands in 10 s, 20 helpers, zero double assignment) | Yes | The check "helper has no active assignment" and the creation of a new assignment must happen as one indivisible step. | Create assignments inside one database transaction, backed by a rule that allows only one active assignment per helper. Assign in post-time order. | Errand Workflow, Relational database |
| QS-2 Privacy (no contact details before both parties confirm) | Yes | Exactly one place decides whether contact details may be released, and every other path must go through it. | Contact and meeting details are readable only through the confirmation gate, which checks helperConfirmed and requesterConfirmed. No other module reads those fields. | Errand Workflow (confirmation gate) |
| QS-4 Auditability (full history on dispute) | Yes | A status change and its history record can never disagree, and history cannot be edited. | The workflow writes the history entry in the same transaction as the change. History is append-only. The Dispute module reads it and never writes it. | Errand Workflow, Dispute |
| QS-1 Reliability (10-minute window, reassignment within 1 minute) | No | Expiry must still happen if the application restarts or a timer is missed. | Store an expiry time on each Assignment. A scheduler checks stored times at a short interval and at startup. | Errand Workflow (expiry scheduler) |
| QS-3 Availability (backlog flag in the same request cycle) | No | An errand with no eligible helper is never lost, and the administrator is told. | Set backlog status and send the capacity notice in the same request. Retry when a helper becomes free. | Errand Workflow, Notifier port |

## 2. Constraints

| Constraint | Obligation | Architectural response | Element |
|---|---|---|---|
| Limited data or wifi | Keep responses small and few per action. | One request per user action. The server does the matching, not the client. | Web/API layer |
| Small student team, one semester | Keep what must be built, run and debugged small. | A single deployable application with modules. | Whole application |
| No payment data (D-005) | No place to store payment fields. | No payment tables or modules exist. | Relational database |
| Identity is a mock (D-007) | Real identity can replace the mock later without changing the workflow. | Identity check port with a mock behind it. | Identity check port |
| External Notification Service | A notification failure must not break the workflow. | Notifier port, called after the transaction commits. | Notifier port |

## 3. Traceability: quality scenario to architecture element

| Scenario | Element | Verified by |
|---|---|---|
| QS-1 | Errand Workflow (expiry scheduler) | prototype/scenarios/helper-timeout.md |
| QS-2 | Errand Workflow (confirmation gate) | Test: no contact fields in any response until both flags are true |
| QS-3 | Errand Workflow, Notifier port | prototype/scenarios/no-helper-available.md |
| QS-4 | Errand Workflow (history), Dispute | Test: open a dispute and compare returned history with recorded events |
| QS-5 | Errand Workflow, Relational database | prototype/scenarios/multiple-errands-compete.md |
