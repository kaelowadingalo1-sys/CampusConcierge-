# Framework and dependency decision: Campus Concierge

**Status: accepted by the team.** ADR-001 deliberately named no stack; this note fixes it for Phase 2.

## 1. What the choice has to satisfy

| Need | Source |
|---|---|
| One deployable application with a relational database | ADR-001, `models/deployment.drawio` |
| Transactions and uniqueness rules enforced by the database | `docs/data-integrity.md` (DI-1 to DI-4, DI-7) |
| A scheduler inside the application for expiry and the notification dispatcher | AD-1, QS-1 |
| Core code that can be tested without a web server or a database | PD-1, PD-2 |
| A language every team member can read and review | Course constraint |

## 2. Chosen stack

| Part | Choice | Reason |
|---|---|---|
| Language | TypeScript | Interfaces are checked by the compiler, so the ports in `src/interfaces-or-ports/` are real and a breaking change shows at build time |
| Runtime and web layer | Node.js with a small web library (Express or Fastify) | Covers the Web/API layer only. No framework that decides the structure of the core |
| Database | PostgreSQL | Partial unique indexes enforce DI-1 and DI-2 directly; transactions cover DI-9 |
| Database access | A query builder or plain SQL through one adapter (SqlWorkflowStore) | Keeps the transaction boundary visible. A full ORM would hide it |
| Tests | One test runner with fake adapters | Runs the core with no network |


## 3. Dependency management

| Rule | Reason |
|---|---|
| Packages are installed from a lock file that is committed | Everyone builds the same versions |
| A new dependency needs a line in the pull request saying what it is for and what was considered instead | Stops hidden dependencies |
| Only the adapters and the web layer may import the database driver or the HTTP client. The core imports interfaces only | Keeps the dependency direction in `models/detailed-class-design.drawio` |
| Dependencies are checked for known vulnerabilities before each phase submission | Low cost, and Phase 2 is marked on a working build |

## 4. Rejected: dependency-injection container and full-stack framework

| Considered | Reason for rejection |
|---|---|
| A framework with a dependency-injection container and decorators (for example NestJS) | The container decides at run time which class fills an interface, so the wiring is hidden from the reader. For three ports and four repositories, the wiring fits in one file |
| Replacement | A single composition file that creates the adapters and passes them to ErrandWorkflowService by hand. If it grows past one screen, revisit |

## 5. Risks and cost

- Hand-written interfaces in `src/interfaces-or-ports/` must be kept in step with the adapters; the compiler catches a mismatch at build time.
- Hand wiring is more typing than a container. Accepted, because it keeps the dependencies visible.
