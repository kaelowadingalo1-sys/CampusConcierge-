# Phase 1 review: Campus Concierge

Marks: `[x]` met, `[ ]` not met, `[~]` partly met.

## 1. Approved problem, evidence, stakeholders and scope

| Check | Mark | Evidence |
|---|---|---|
| Approved title and decision date are recorded | [x] | Title and "Approved with minor conditions" are in docs/lecturer-feedback.md and docs/project-proposal-and-approval.docx |
| Every lecturer approval condition has a stated response | [x] | R1-R6 each map to a design record or model in docs/lecturer-feedback.md. |
| Problem statement is 150-250 words, with dated evidence and an origin | [~] | 218 words in docs/problem-and-scope.md. The survey/interview evidence is in docs/stakeholders.md but has no exact dates. |
| One goal and three measurable objectives | [x] | docs/problem-and-scope.md: one goal, three objectives with percentages. |
| Stakeholders, boundary, scope, assumptions, constraints and data/ethics controls | [x] | docs/stakeholders.md, problem-and-scope.md, Level 0 context diagram, D-005, D-006. |

## 2. Functional requirements, actors, use cases and acceptance

| Check | Mark | Evidence |
|---|---|---|
| At least eight functional requirements with identifiers | [x] | FR-01 to FR-17. |
| Actors meaningful and shown in a use-case diagram | [x] | models/use-cases/campus-concierge-use-cases.drawio. |
| At least two use cases fully detailed, each with failure conditions | [x] | UC-Post-Errand-Request.md and UC-Decline-Assignment.md, each with an alternative-flows table. |
| Every requirement traces to a use case or states why not | [x] | traceability-matrix.md. FR-14 and FR-15 are marked as policy with no single use case. |
| Acceptance criteria exist for the main flows | [~] | AC-1 to AC-5 cover Post Errand Request only. AC-6 to AC-12 and AC-17 are named in the traceability matrix but not written. |

## 3. Quality requirements

| Check | Mark | Evidence |
|---|---|---|
| At least five project-specific quality scenarios | [x] | QS-1 to QS-5. |
| Each has stimulus, context, response and a measurable threshold | [x] | docs/quality-scenarios.md. |
| Test loads and time limits are bounded | [x] | QS-1: 10-minute window plus 1 minute, 11 total. QS-5: 50 errands, 20 helpers. |
| Each scenario states the design obligation it creates | [~] | The mapping to design records is listed, but the obligation is implied by the Response column, not named. |

## 4. Domain model, business rules and responsibilities

| Check | Mark | Evidence |
|---|---|---|
| Editable source and a readable export are both present | [x] | Check models/domain-modefel.drawio and .svg |
| Concepts, attributes, associations and multiplicities | [x] | models/domain-model.drawio. |
| Multiplicities agree with the business rules | [x] | Dispute shown 0..1 per BR-D5 after the Lab 5 fix. |
| At least six business rules or invariants | [x] | BR-D1 to BR-D7. |
| At least four CRC cards | [x] | Five cards in docs/crc-cards.md. The Assignment card still needs a line for the two confirmation flags. |

## 5. Interaction and lifecycle

| Check | Mark | Evidence |
|---|---|---|
| Editable sequence source and readable export | [x] | Source and export exist. |
| Validation or rule handling is shown | [x] | Messages 2-3 (isApproved) and the opt frame 3a-3b. |
| Important alternatives shown, including rejection and no-resource paths | [x] | opt frame for rejected category; alt frame for no eligible helper; decline/timeout branch. |
| Editable state-machine source and readable export | [x] | errand-lifecycle.drawio and .svg exist. |
| Every state has a way in and, unless terminal, a way out | [x] | models/state/errand-lifecycle.drawio. |
| Transitions have guards; exceptional outcomes present | [x] | Cancel, decline/timeout and dispute edges have labels and guards. |

## 6. Traceability, consistency and rationale

| Check | Mark | Evidence |
|---|---|---|
| Every requirement appears in the traceability matrix | [x] | FR-01 to FR-17. |
| No verification cell is blank or "pending" without a plan | [x] | Each cell names a check, but several name criteria that are not written yet (see section 2). |
| Consistency record links steps, messages, responsibilities and states | [x] | docs/consistency-matrix.md. |
| Names agree across all artefacts | [~] | FR-16/AC-5 conflict with D-007 (see finding 1). |
| Quality scenarios and rules do not contradict the sequence or lifecycle | [x] | QS-2 and the sequence now both require both-party confirmation. |
| At least two modelling choices explained with alternative and consequence | [x] | D-008 (separate roles, persistent Assignment), D-001 to D-007. |

## 7. Architecture drivers

| Check | Mark | Evidence |
|---|---|---|
| Three drivers, each linked to a quality scenario or constraint | [x] | docs/architecture-drivers.md, AD-1 to AD-3. |
| Drivers come from the project, not a framework name | [x] | No framework named. |
| At least two genuinely different, feasible alternatives | [x] | Single application with modules versus separate services with a queue. |
| Each alternative has preliminary consequences | [x] | Per-driver table and accepted consequences. |

## 8. The three highest-risk findings

| # | Finding | Where | Why it is high risk | Suggested fix |
|---|---|---|---|---|
| 1 | FR-16 and AC-5 require email-link account confirmation, but D-007 says identity is mocked. | FR-16, AC-5, D-007 | Requirements contradict a design decision. | Reword FR-16 and AC-5 to say the prototype uses a mocked identity service. |
| 2 | Traceability points at checks that do not exist: AC-6 to AC-12, AC-17, and scenarios for QS-2 and QS-4. | traceability-matrix.md, acceptance-criteria.md | Claimed verification is not backed by written tests. | Write the criteria and scenarios, or state the gap. |
| 3 | Backlog (QS-3) has no state on the lifecycle diagram, so a backlogged errand looks identical to an actively matched one. | errand-lifecycle.drawio, QS-3 | The backlog and its free-cancellation rule are visible only in the sequence. | Add a BACKLOG state or document it as a known limit. |

## 9. Correction made

| Field | Entry |
|---|---|
| Finding corrected | Highest-risk consistency issue found in Lab 5: QS-2 requires confirmation by both parties, but the sequence revealed contact details after the helper's confirmation alone. |
| What was changed | Added requester confirmation (messages 9b-9d) before lockTerms and the contact reveal; added helperConfirmed and requesterConfirmed to Assignment in the domain model. |
| Files updated | models/sequence-core-use-case.drawio, models/domain-model.drawio, docs/consistency-matrix.md, docs/traceability-matrix.md, docs/quality-scenarios.md |

## 10. Remaining open issues

| Issue | Owner | Plan |
|---|---|---|
| Findings 1 to 3 above (identity contradiction, unwritten acceptance criteria, submission artefacts) | [name] | Fix before tagging |
| Use-case step 6 (confirm errand ID and status) has no message on the sequence | [name] | Add an acknowledgement message after lockPrice |
| "Requester account not confirmed" and "duplicate submission" flows are not drawn | [name] | Draw, or state them as out of scope for Phase 1 |
| No rule for a helper withdrawing after confirming and before the requester confirms | [name] | Team decision: block or allow |
