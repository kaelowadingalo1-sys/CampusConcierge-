# Architecture options: Campus Concierge

Two realistic structures for the project, compared against the same criteria. Drivers and constraints come from `docs/architecture-drivers.md` and `docs/quality-to-architecture.md`. Neither option is a technology name: each is a structure with defined responsibilities.

## 1. The options

### Alternative A: Modular application

One deployable application with these modules, one relational database, and ports to the two external services.

| Module | Responsibility | Depends on |
|---|---|---|
| Web/API layer | Receives requests, checks identity, routes to modules | Identity check port, all modules |
| Errand Workflow | Errands, assignments, matching, expiry scheduler, confirmation gate, event history | Category and Helper Administration, Notifier port |
| Category and Helper Administration | Categories, standard prices, helper registry | none |
| Dispute | Disputes and administrator resolution | Errand Workflow (reads history, sets DISPUTED) |

Dependencies run in one direction with no cycles. Each module owns its own tables.

### Alternative B: Separate services with a message queue

| Service | Responsibility | Communicates through |
|---|---|---|
| Errand service | Errands, category check, event history | Queue and request calls |
| Matching service | Assignments, helper availability, expiry | Queue |
| Dispute service | Disputes and resolution | Request calls to the Errand service |
| Notification worker | Sends notifications | Queue |

Each service owns its own data store.

## 2. Comparison

Same criteria for both. "Better" means better for this project, not in general.

| Criterion | Alternative A | Alternative B | Better |
|---|---|---|---|
| No double assignment (QS-5) | One transaction checks and creates the assignment. A database rule enforces one active assignment per helper. | Assignment requests are ordered by the queue, but the one-active-assignment rule spans the Errand and Matching services and needs extra coordination. | A |
| Both-party contact gate (QS-2) | One gate in one module. Risk: other modules could read the fields by mistake. | Contact data can sit in one service's store, a stronger boundary. Risk: more messages carry the data. | B, slightly |
| History cannot disagree with state (QS-4) | Change and history written in one transaction. | History in the Errand service, state in the Matching service, so a dispute review joins records from two places. | A |
| Expiry on time (QS-1) | Scheduler in the same process as the data. Stops if the application stops, but catches up from stored times. | Separate expiry worker, independent of other services. More parts to keep running. | Equal |
| Failure boundary | One process: a crash affects everything, but there is only one thing to restart. | A failed service leaves others running but can leave a half-finished assignment between services. | Equal |
| Coupling | Modules are coupled through code interfaces in one process. | Services are coupled through messages and need versioned contracts. | A for this team size |
| Data ownership | Each module owns its tables in one database. | Each service owns its store, so ownership is clearer but joins are harder. | Equal |
| Security boundary | One boundary around the whole application. | Several internal boundaries. | B, slightly |
| Operational cost (small team, one semester) | One thing to build, run and debug. | Several services, a queue and monitoring to build and run. | A |
| Data and bandwidth for users | Neutral. | Neutral. | Equal |

## 3. Reading the comparison

A is better on the three criteria that matter most to this project's drivers (double assignment, history consistency, operational cost). B is slightly better on contact isolation and security boundaries. Neither option is chosen here: the choice and its consequences are recorded in `decisions/ADR-001-architecture.md`.

## 4. Evidence this comparison rests on

- QS-5 bound: 50 errands, 20 helpers, in `docs/quality-scenarios.md`
- Team size and one-semester limit: `docs/problem-and-scope.md`, Constraints
- Prototype evaluated through controlled scenarios, not live traffic: D-006
