# Architecture drivers: Campus Concierge

This note names the quality drivers that will shape the architecture and compares two realistic alternatives. Drivers come from the project's quality scenarios and constraints (`docs/quality-scenarios.md`, `docs/problem-and-scope.md`)

## 1. Drivers

| ID | Driver | Source | What the architecture must achieve |
|---|---|---|---|
| AD-1 | Safe assignment and timed reassignment | QS-1, QS-3, QS-5; BR-D3; D-003; FR-02, FR-04 | A helper never holds two active assignments, even when up to 50 errands are posted within 10 seconds against 20 helpers. An unanswered offer expires after 10 minutes and the next assignment is created within 1 minute of expiry. No errand is silently dropped. |
| AD-2 | Controlled disclosure of contact details | QS-2; FR-05; D-005 | Contact and meeting details are released only after both helper and requester have confirmed. One place decides this, so no screen, notification or report can reveal them early. |
| AD-3 | Durable, trustworthy event history | QS-4; BR-D4, BR-D5; D-004; FR-09, FR-10 | Every assignment, confirmation, status change and outcome is recorded with a timestamp and cannot be altered afterwards. The administrator can see the full history of a disputed errand with no missing fields. |

### Constraints that limit the options

| ID | Constraint | Source |
|---|---|---|
| C-1 | Usable on limited campus data or wifi, so responses and screens must stay small | problem-and-scope.md, Constraints |
| C-2 | Deployable and supportable by a small student team | problem-and-scope.md, Constraints |
| C-3 | Delivered in one semester as a vertical slice | problem-and-scope.md, Constraints |
| C-4 | No payment processing or payment data stored | D-005 |
| C-5 | Identity service is a mock for the prototype, but must sit behind a replaceable boundary | D-007 |
| C-6 | Notifications go through an external Notification Service | Level 0 context diagram, FR-17 |

## 2. Alternatives

### Alternative A: Single deployable application with internal modules

One application, split into modules that match the domain (Errand, Assignment, Category, Dispute, Notification, Identity). One relational database. A scheduler runs inside the application to expire assignments. Notification and Identity sit behind interfaces so the mock and the real service can be swapped.

### Alternative B: Separate services with a message queue

Assignment and matching run as their own service. Errand and dispute handling are a second service. Notifications are sent by a background worker fed from a message queue. Each service owns its own data.

### How each alternative meets the drivers (preliminary)

| Driver | Alternative A | Alternative B |
|---|---|---|
| AD-1 Safe assignment and timed reassignment | One database transaction can check and create an assignment together, so double assignment is prevented with ordinary database rules. The expiry scheduler lives in the same place as the data. Risk: scheduler stops if the one application stops. | Queue ordering can serialise assignment requests, but "one active assignment per helper" now spans messages and needs extra coordination to stay true. Expiry can run as a separate worker. Risk: more failure points between post, assign and expire. |
| AD-2 Controlled disclosure | Contact details are read through one module that checks both confirmation flags. Easy to enforce and to test. Risk: discipline is needed inside the code so other modules do not read the fields directly. | Contact details can live in a separate store only the confirming service can read, which is a stronger boundary. Risk: every extra service and message that carries the data is another place it could leak. |
| AD-3 Event history | History and the business data share one database and one transaction, so a status change and its history entry cannot disagree. | Each service keeps its own history, so reconstructing one errand's full timeline means joining records from several places. A dispute review becomes harder. |
| C-1 Limited data | One request path, small responses. | More internal calls but no extra data on the user's connection. Neutral. |
| C-2, C-3 Small team, one semester | One thing to build, run and debug. | Several services to build, deploy and monitor. Likely too much for the team and timeline. |

### Consequences the team would accept

- **Choosing A:** the whole system scales and fails as one unit. This is acceptable for a small helper pool and a prototype that is evaluated through controlled scenarios (D-006), but it would need revisiting if usage grew well beyond one campus.
- **Choosing B:** a stronger separation for contact details and independent scaling, paid for with coordination work, more deployment effort and harder history reconstruction, none of which the current scope needs.

### Preliminary leaning (not a decision)

Alternative A fits all three drivers using simpler means and is the only one that respects C-2 and C-3 realistically. Alternative B is kept as the fallback if further analysis shows AD-2 cannot be met with a module boundary.

## 3. What this note does not decide

- Programming language, framework or database product
- Deployment hosting
- How the Identity Service would be replaced after the prototype (D-007)
- Whether the scheduler is a timer, a polling job or a database-driven job

## 4. Traceability

| Driver | Quality scenario | Business rule / design record | Requirement | Lifecycle / sequence evidence |
|---|---|---|---|---|
| AD-1 | QS-1, QS-3, QS-5 | BR-D3, D-003 | FR-02, FR-04 | AWAITING_ACCEPTANCE -> POSTED; seq. msgs 5, 13-16, 5b-6b |
| AD-2 | QS-2 | D-005 | FR-05 | seq. msgs 9b-9d, 10-12 |
| AD-3 | QS-4 | BR-D4, BR-D5, D-004 | FR-09, FR-10 | Assignment.outcome, Dispute |