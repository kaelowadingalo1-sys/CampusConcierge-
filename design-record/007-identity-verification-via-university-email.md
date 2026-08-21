# D-007: Identity service is mocked for the prototype, not integrated with a real system

## Status
Approved

## Decision
Campus Concierge does not integrate with any real university identity system for the semester prototype. Instead, the Identity Service is a **mock**: a small seeded set of fake student accounts (student number, name, password) that the prototype's login screen checks against, behaving the same way a real login would from the rest of the system's point of view.

Two real options were considered and explicitly deferred, not ruled out for the future:
- Live SSO against UB's Microsoft 365 / Azure AD tenant (requires UB IT registration and approval, a dependency the team cannot guarantee within a semester)
- Signup verified via a confirmation link sent to the student's university email address (real verification, but real implementation cost: token generation, email delivery, password hashing/reset flow)

## Evidence that changed our mind
D-006 already commits the team to evaluating the whole system through controlled, synthetic scenarios rather than a real pilot. Since no real student will be authenticating against this system for real during the evaluated scenarios, building genuine identity verification provides no actual benefit at this stage. The cost (email delivery, token handling, credential storage/hashing) buys protection for a system nobody is really depending on yet.

## Consequence we accept
The prototype proves the *shape* of the workflow (a Requester and a Helper are distinct authenticated roles, and the system behaves correctly once identity is established) but proves nothing about whether real students could sign up and be verified. This must be stated plainly wherever the prototype's results are reported. A mocked identity layer is not evidence that a real signup flow would work.

The Identity Service box remains on the Level 0 context diagram as a required external entity (per R6), representing where a real identity system would sit if this became more than a semester project, even though the prototype behind it is mocked.

## Next uncertainty to investigate
Which of the two deferred real options (Microsoft 365 SSO vs. university-email confirmation) the team would pursue if the project continued past this semester, and what would trigger that decision (e.g. a real pilot actually being approved).