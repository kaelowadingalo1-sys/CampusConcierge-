# ADR-001: Modular application as the Phase 2 architecture

## Status
Proposed (team to confirm)

## Context
Campus Concierge matches errands to helpers, holds contact details back until both parties confirm, and keeps a history that supports dispute review. The architecture is driven by:

- QS-5 (zero double assignment, 50 errands in 10 seconds against 20 helpers)
- QS-2 (no contact details before both parties confirm)
- QS-4 (full event history on dispute)

It is also limited by a small student team, one semester, no payment data (D-005), a mocked identity service (D-007) and an external Notification Service. The prototype is evaluated through controlled scenarios, not live traffic (D-006). See `docs/quality-to-architecture.md` and `docs/architecture-options.md`.

## Decision
Build Alternative A: one deployable application with four parts (Web/API layer, Errand Workflow, Category and Helper Administration, Dispute), one relational database, and ports for the Identity Service and the Notification Service. The responsibilities and dependency direction are in `models/component-architecture.drawio`.

Errand Workflow owns assignments, the confirmation gate and the event history, so that assignment, status change and history record happen in one transaction.

## Alternatives considered

| Alternative | Why not chosen |
|---|---|
| B: separate services with a message queue | Needs coordination to keep one active assignment per helper across services, splits history across stores, and costs more to build and run than a small team can carry in one semester. |

## Consequences

**Positive**
- Double assignment is prevented with an ordinary transaction and database rule (QS-5).
- A status change and its history entry cannot disagree (QS-4).
- One thing to build, run and debug within the semester.
- Identity and notification can be replaced later behind their ports.

**Negative**
- The whole system fails and scales as one unit.
- The contact-detail boundary is a module boundary, not a hard one. Another module could read the fields directly, so this must be enforced by review and by a test.
- The expiry scheduler runs in the same process, so a stopped application delays reassignment until it restarts.
- Isolating contact data later, if needed, means splitting Errand Workflow.

## Risks

| Risk | Affects | Mitigation |
|---|---|---|
| Expiry missed while the application is stopped (**highest risk**) | QS-1 | Store expiry time on each Assignment; check stored times at startup and at a short interval. |
| A module reads contact details without going through the gate | QS-2 | Only the confirmation gate exposes those fields; test that no response contains them before both flags are true. |
| Notification failure rolls back workflow changes | QS-3 | Send after the transaction commits; retry on failure. |

## Evidence that would make us reconsider
- A concurrent test of 50 errands against 20 helpers produces any double assignment that a database rule cannot prevent.
- The contact-detail test fails more than once, showing the module boundary is not holding.
- Missed expiries occur in testing even with stored-time catch-up.
- Real use grows well beyond one campus, or a real pilot is approved (D-006).
- The team capacity changes enough to carry the cost of separate services.
