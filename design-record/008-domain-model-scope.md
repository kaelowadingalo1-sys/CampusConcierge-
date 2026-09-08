# D-008: Domain model scope decisions

## Status
Proposed

## Decision

Two modelling choices made while building the domain model (`models/domain-model.drawio`):

**1. Requester, Helper and Administrator are separate classes, not roles of one User class.**
A single User class with a role field would need Helper-only state (`available`) and Administrator-only behaviour (setting prices, resolving disputes) as optional fields that most users never populate, one bloated class hiding three distinct sets of knowledge and responsibility.

**2. Assignment is its own persistent class, not a field on Errand.**
An Errand does not just have one current helper, it can accumulate a history of assignment attempts (decline, timeout, reassignment, per D-003). A single `currentHelperId` field on Errand cannot represent that history, and D-004 needs the full history for dispute evidence.

## Evidence that changed our mind

Lab 4's own design trap warning: do not copy a database schema or a generated framework model and call it domain analysis. A single User-with-role-field class and a currentHelperId field are exactly that kind of implementation shortcut, not a model of what the problem domain actually distinguishes.

## Consequence we accept

More classes to maintain than the simplest possible model, but each class now answers only for what it actually knows, and Assignment's own history is directly queryable for a dispute, rather than needing to be reconstructed from an application log outside the domain model.

## Next uncertainty to investigate

Whether Requester and Helper will eventually need to become roles a single Student can hold simultaneously (a student who is sometimes a requester and sometimes a helper), which would revisit choice 1 above.
