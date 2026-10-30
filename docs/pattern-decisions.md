# Pattern decisions: Campus Concierge

Each pattern below starts from a problem in this project, not from the pattern name. Three are adopted and one is rejected. Sources: `decisions/ADR-001-architecture.md`, `docs/architecture-drivers.md`, `docs/data-integrity.md`, `docs/api-contracts/core-operation.md`, `models/failure-recovery.drawio`, `models/detailed-class-design.drawio`.

## 1. Decision table

| ID | Project problem | Pattern chosen | Participants | Consequence accepted | Driver and test |
|---|---|---|---|---|---|
| PD-1 | The Errand Workflow must work with an identity check that is mocked today (D-007) and a Notification Service that can be down (failure-recovery). The workflow rules must not change when either is swapped or fails. | Ports and adapters | IdentityCheck, NotificationGateway, Clock (ports); MockIdentityAdapter, HttpNotificationGateway, SystemClock (adapters); ErrandWorkflowService (user of the ports) | Three extra interfaces to keep stable. Any change to a port touches core and adapter | AD-1, QS-1. Test: run the expiry test with a fake Clock and a gateway that always fails; the assignment still expires and moves on |
| PD-2 | Posting must create the errand, the assignment, the event and the outbox row together, and a race must not give one helper two assignments (DI-1, DI-9, QS-5). | Repository with a unit of work | UnitOfWork; ErrandRepository, AssignmentRepository, EventLog, NotificationOutbox; SqlWorkflowStore (adapter) | One more layer between service and tables. Every new query needs a method on a repository | AD-1, AD-3, QS-5. Test: 50 postings at once against 20 helpers gives exactly 20 active assignments |
| PD-3 | A notification outage must not fail the request or leave a stale offer (DI-11, DI-12, failure-recovery). | Transactional outbox | NotificationOutbox (interface); notification_outbox table; NotificationDispatcher; NotificationGateway | Delivery is late, not immediate, and the dispatcher must run. Duplicates are possible, so the outbox id is sent as the idempotency key | AD-1, QS-1. Test: gateway down for the whole acceptance window; the offer row is cancelled and the next helper is offered |

## 2. Why these three and not others

- PD-1 is limited to the three things the core cannot control: who the user is, whether a message is delivered, and what time it is. The ports for the administration data (CategoryCatalog, HelperDirectory) exist because modules must not read each other's tables (ADR-001), not because they have two implementations today.
- PD-2 follows from DI-1 and DI-9. Both need one transaction that spans several tables, so the service needs a way to say "do all of this together" without knowing the database.
- PD-3 follows from the failure flow already drawn. The offer and the assignment commit together, and sending happens afterwards.

## 3. Rejected decision

| ID | Considered | Reason for rejection | What we do instead |
|---|---|---|---|
| PD-R1 | Strategy pattern for helper selection (a HelperSelectionPolicy interface with swappable rules) | Only one selection rule exists, shown in `tests/matching-scenario-results.md`. A second rule is not in any requirement. An interface with one implementation adds a class, a binding and a test double, and it would invite policy changes nobody has asked for (accidental complexity) | A plain function `chooseHelper(helpers)` inside ErrandWorkflowService. If a second rule is ever required, extracting the interface is a small change because the function is called from one place |
| PD-R2 | Message broker with separate services for matching and notification | Not needed for 50 errands in 10 seconds (QS-5). Adds a new component to deploy and a delivery guarantee to prove. Already rejected for the architecture as a whole in ADR-001 (Alternative B) | Outbox table in the existing database (PD-3) |

## 4. Consistency with other documents

| Check | Result |
|---|---|
| Class names match `models/detailed-class-design.drawio` | Agree |
| Table names match `models/logical-data-model.drawio` (errand, assignment, errand_event, notification_outbox) | Agree |
| Constraint IDs DI-1, DI-9, DI-11, DI-12 are the ones in `docs/data-integrity.md` | Agree |
| Dependency direction: the core depends on interfaces; adapters depend on interfaces; the core never refers to an adapter | Agree, see `src/interfaces-or-ports/` |
| Open: HelperDirectory and CategoryCatalog are implemented by Category and Helper Administration, which also needs to own the requester table (open item from Lab 8) | Decide with the team |

## 5. Exit record

- **Interface boundary with the greatest benefit:** the UnitOfWork with the four repositories (PD-2), because it carries the guarantee behind the highest integrity risk (a helper getting two assignments).
- **Cost:** every new query has to be added as a method on a repository, and the service tests need a fake store.
- **Test that confirms the design works:** post 50 errands at the same time against 20 helpers. Pass only if exactly 20 assignments are active, no helper has more than one, and the other 30 errands are in backlog.
