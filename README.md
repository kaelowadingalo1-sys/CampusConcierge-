# Campus Concierge

Errand marketplace for University of Botswana students. This repository holds the CSI473 project: design documents (Phase 1) and a working vertical slice (Phase 2).

## What works now (Phase 2 vertical slice)

One end-to-end path through API, application logic and PostgreSQL:

1. A requester posts an errand (`POST /errands`) with an idempotency key. The category is checked, the standard price is locked, a helper is assigned automatically, history is recorded and an offer is queued.
2. If no helper is free the errand goes to backlog and the administrator is flagged. Backlog errands are retried when helpers free up.
3. The helper accepts or declines (`POST /assignments/:id/accept`, `.../decline`). A decline, or no answer in 10 minutes, offers the errand to the next helper.
4. The requester confirms (`POST /errands/:id/confirm`). Only then can either party read the meeting point and phone numbers (`GET /errands/:id/contact`).

What is **not** built is listed in `docs/reconciliation-matrix.md` and `docs/technical-debt-and-risks.md`. In short: no user interface (wireframes only), no cancel, work-in-progress, completion or dispute flows, no administrator functions, and identity is mocked.

## Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer, running locally

## Set up and run

```
npm install

# create two empty databases (names are examples)
createdb concierge
createdb concierge_test

# create the tables and load synthetic sample data
export DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/concierge
npm run db:setup -- --sample

# start the application on port 3000
npm start
```

On Windows PowerShell use `$env:DATABASE_URL="postgres://USER:PASSWORD@localhost:5432/concierge"`.

Sample accounts (mock identity, D-007) are used as bearer tokens: `requester-1`, `requester-2`, `helper-1`, `helper-2`, `helper-3`, `admin-1`, and `requester-unconfirmed`.

## Try the slice

```
# 1. requester-1 posts an errand
curl -s -X POST localhost:3000/errands -H "content-type: application/json" \
  -H "Authorization: Bearer requester-1" -H "Idempotency-Key: demo-key-0001" \
  -d '{"categoryId":1,"taskDetails":"Collect parcel","deadline":"2030-01-01T10:00:00Z","meetingPoint":"Student centre"}'

# 2. helper-1 accepts the offer (assignment 1)
curl -s -X POST localhost:3000/assignments/1/accept -H "Authorization: Bearer helper-1"

# 3. contact details are still hidden
curl -s localhost:3000/errands/1/contact -H "Authorization: Bearer requester-1"

# 4. requester confirms, then contact details are shared
curl -s -X POST localhost:3000/errands/1/confirm -H "Authorization: Bearer requester-1"
curl -s localhost:3000/errands/1/contact -H "Authorization: Bearer helper-1"
```

`docs/demo-script.md` has the five-minute demonstration with the failure and rule cases.

## Run the tests

The tests use a real PostgreSQL database and **erase everything in it**. Point them at the test database only:

```
export DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/concierge_test
npm test
npm run typecheck
```

Results and what each test proves: `tests/results-summary.md`.

## Source layout

| Path | Contents |
|---|---|
| `src/interfaces-or-ports/` | Interfaces the core depends on (ADR-002) |
| `src/core/` | Errand Workflow rules: `errand-workflow-service.ts`, `notification-dispatcher.ts` |
| `src/adapters/` | PostgreSQL store, administration data, mock identity, clock, notification gateway |
| `src/web/` | HTTP routes and error mapping |
| `src/main.ts` | The only file that names concrete adapters |
| `migrations-or-schema/` | `001_init.sql` (tables and rules), `002_sample_data.sql` (synthetic data) |
| `tests/` | Automated tests |
| `docs/`, `models/`, `decisions/`, `design-record/` | Requirements, models and decisions |
| `submissions/` | Phase reports |

Stack (ADR-002, `docs/framework-decision.md`): TypeScript, Node.js, Express, PostgreSQL, wired by hand with no dependency-injection container.

## Design documents

Start with `docs/problem-and-scope.md`, then `docs/functional-requirements.md`, `docs/quality-scenarios.md`, `decisions/ADR-001-architecture.md` and `decisions/ADR-002.md`. The honest comparison between design and code is `docs/reconciliation-matrix.md`.
