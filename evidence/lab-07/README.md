# Lab 7 evidence: Architecture alternatives and component structure

Branch: `lab-07`

| Required evidence | File |
|---|---|
| Architecture-driver and design-obligation table | `docs/quality-to-architecture.md` (obligations), `docs/architecture-drivers.md` (drivers) |
| Comparison of at least two feasible alternatives | `docs/architecture-options.md` |
| Editable component model | `models/component-architecture.drawio` |
| Readable export of the component model | `models/component-architecture.svg` (export from the .drawio file) |
| ADR with context, alternatives, decision, consequences and risks | `decisions/ADR-001-architecture.md` |
| Traceability from quality scenarios to architecture elements | `docs/quality-to-architecture.md`, section 3 |

## Exit record

**Quality requirement that most influenced the architecture:** QS-5 (zero double assignment under concurrent posting), together with QS-2 and QS-4. QS-5 pushed assignment, confirmation and history into one module and one transaction.

**Highest architectural risk:** the expiry scheduler runs in the same process as the data, so a stopped application delays reassignment (QS-1). Mitigation: expiry times are stored and checked at startup and at a short interval.

**Evidence that would make us revise the decision:**
- A concurrent test of 50 errands against 20 helpers produces a double assignment that a database rule cannot prevent.
- The contact-detail test fails more than once.
- Missed expiries occur in testing even with stored-time catch-up.

## Revision after review

| Field | Entry |
|---|---|
| Issue found in review | [fill in] |
| What was changed | [fill in] |
| Revision commit | [fill in commit hash and message] |
