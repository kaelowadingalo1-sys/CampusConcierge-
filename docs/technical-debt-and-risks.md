# Technical debt, residual risks and release recommendation

Position on 30 October 2026, after the vertical slice (`docs/reconciliation-matrix.md`).

## 1. Technical debt

| ID | Debt | Impact | Likelihood | Suggested action |
|---|---|---|---|---|
| TD-1 | No user interface. Only the API exists; wireframes are in `prototype/wireframes.drawio` | High: students cannot use the product | Certain | Build R1, R2, H1, H2 first |
| TD-2 | Work after acceptance is missing: no start, completion, cancel, no-show or dispute | High: an accepted errand never ends, so its helper stays busy forever (a capacity leak) | Certain | Add complete and cancel first; they free the helper |
| TD-3 | Identity is mocked with fixed tokens (D-007). FR-16 says email-link confirmation | High if used outside a demo: anyone with a token string is that user | Certain | Replace the adapter behind `IdentityCheck`; decide FR-16 against D-007 |
| TD-4 | Administrator functions (vetting, pricing, dispute resolution) are only SQL | Medium | Certain | Build after TD-2 |
| TD-5 | Notification retries have no back-off or attempt limit; `HttpNotificationGateway` has not run against a real service | Medium: a long outage means a retry every 30 seconds and possible duplicate sends if a reply is lost | Likely | Add next-retry time and a limit; test against the real service or a contract stub |
| TD-6 | The expiry and backlog timer runs inside the application. More than one instance has not been tested | Medium | Possible | Row locks help (`FOR UPDATE`, `SKIP LOCKED`), but test two instances before scaling |
| TD-7 | Helper choice is by lowest id, so the same helpers are always offered first; concurrent postings are not assigned in post-time order (QS-5 wording) | Medium: unfair load; a design promise is only partly kept | Certain | Decide the fairness rule; if post-time order is required, assign through a queue |
| TD-8 | Tests are one integration suite on a real database. No unit tests with fakes, no UI or accessibility tests, no load test above 50, no timer test | Medium | Certain | Add unit tests for the service with an in-memory store; test the timer |
| TD-9 | The category and price are read just before the transaction, not inside it (differs from the API contract) | Low: a category change in that gap could lock a stale price | Rare | Read inside the transaction, or accept and update the contract |
| TD-10 | Documents and code disagree in places: FR-16 and D-007; acceptance criteria AC-6 to AC-12 and AC-17 not written; requester table ownership unresolved; diagrams not updated for the deltas in the reconciliation matrix | Medium: marks and team confusion | Certain | Update after the team review; do not hide deltas |
| TD-11 | No rate limiting, no HTTPS or secrets management, request logging is minimal, no monitoring | High for any real use | Certain | Add before any real users |
| TD-12 | Passwords in connection strings are read from the environment; none are stored in the repository, but there is no secret handling beyond that | Low | Possible | Use the host's secret store |

## 2. Residual risks

| ID | Risk | Effect | Evidence or reason | Mitigation now |
|---|---|---|---|---|
| RR-1 | Contact details leak through a future interface or a new endpoint | QS-2 broken; the main privacy promise | Only `contactFor` reads them today and tests cover it; nothing prevents a new endpoint from reading `errand_contact` | Keep the rule that only the gate reads it; add a test for every new response shape |
| RR-2 | A helper who never completes holds capacity forever | Errands stay in backlog while helpers are idle | TD-2 | Do not run a real pilot until complete or cancel exists |
| RR-3 | Real students use the mock login | Impersonation | TD-3 | Demonstrate with synthetic data only |
| RR-4 | Notification outage longer than the acceptance window | Helpers miss offers; errands reassign, so requesters wait | Tested for one expiry cycle; not for long outages | Retry limit and admin alert (TD-5) |
| RR-5 | Behaviour under real load is unknown | QS-5 time measure unproven | Only 50 postings tested for correctness, not time | Measure the 10-second target before claiming it |
| RR-6 | Dispute evidence is incomplete for later transitions | QS-4 only partly met | History exists only for built transitions | Record events as each new transition is added |

## 3. Release recommendation

**Not ready for production or for real student use.**

**Recommended: a conditional release as a supervised demonstration or classroom pilot using synthetic data only**, on these conditions:

1. Mock identity stays; no real student data is entered (TD-3, RR-3).
2. TD-2 is closed (complete and cancel exist) before any test with more than one errand per helper (RR-2).
3. The user interface for the post and respond paths exists and has passed the accessibility checklist (TD-1).
4. The Notification Service retry limit and a real-service test are done (TD-5, RR-4).
5. HTTPS, secret handling and rate limiting are in place (TD-11).
6. The QS-5 10-second target is measured and the fairness rule is decided (RR-5, TD-7).

Evidence for what is claimed: 21 passing automated tests (`tests/results-summary.md`), the schema rules in `migrations-or-schema/001_init.sql`, and the matrix in `docs/reconciliation-matrix.md`. Nothing here claims production readiness.
