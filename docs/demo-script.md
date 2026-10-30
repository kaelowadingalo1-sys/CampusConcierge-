# Demonstration script (five minutes)

Data: the synthetic sample data from `002_sample_data.sql`. Start fresh with `npm run db:setup -- --sample` and `npm start`. Commands are in the README.

| Minute | Show | Say |
|---|---|---|
| 0:00 | Post an errand as `requester-1` (README step 1) | The request crosses the API, the workflow rules and PostgreSQL in one transaction. Price 20 is locked from the category. A helper is assigned and the expiry is 10 minutes away |
| 1:00 | Run `psql` on the database: `SELECT status, price FROM errand;` `SELECT helper_id, expires_at, is_active FROM assignment;` `SELECT event_type FROM errand_event;` | The result is stored. History was written in the same transaction |
| 1:30 | Send the same post again | Same response with an `Idempotent-Replay` header. Still one errand |
| 2:00 | Post with `"categoryId":3` | 422 and nothing stored: the business rule BR-D1 |
| 2:30 | Ask for contact details as `requester-1` | Refused. Meeting point is hidden until both confirm (QS-2) |
| 3:00 | Helper accepts, requester confirms, contact is shown | The confirmation gate |
| 3:45 | Run `npm test` | 21 tests: validation, rule, timeout with a fake clock, Notification Service outage, 50 postings against 20 helpers |
| 4:30 | Open `docs/reconciliation-matrix.md` | What differs from the design, and what is not built |
