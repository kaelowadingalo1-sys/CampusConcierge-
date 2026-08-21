# D-002: Prohibited errand categories and safety business rules

## Status
Approved (lecturer condition)

## Decision
Campus Concierge prohibits errands involving:

- Bank representation or transactions
- Identity representation or impersonation
- Submission of assessed academic work
- Confidential or sensitive documents
- Restricted or prohibited goods
- High-value purchases
- Unsafe off-campus travel
- Any task requiring the helper to impersonate the requester

These restrictions are enforced as explicit business rules, not just written policy:

- **BR-01:** Only enabled, admin-approved errand categories may be posted.
- **BR-02:** An errand belonging to a prohibited category must not be accepted by the system (rejected at creation, not caught later).
- **BR-03:** A helper must never be asked to perform financial, identity, academic-assessment, or impersonation representation, regardless of category.
- **BR-04:** The first vertical slice exposes only the two categories approved in D-002; no other category is selectable in the UI or accepted by the API.

## Evidence that changed our mind
Lecturer feedback required these restrictions explicitly, citing safety and scope-control concerns for a peer-to-peer errand system involving real students and real handoffs.

## Consequence we accept
The category list must be a closed, admin-managed set (not free text), and every errand-creation path must validate against it. This adds validation work but removes an entire class of safety and liability risk from the first slice.

## Next uncertainty to investigate
Where the "high-value purchase" threshold should sit in currency terms once a purchase-type category is ever considered, and who owns updating the prohibited list as new categories are proposed.
