# Problem and scope: Campus Concierge

## Problem statement (150-250 words)

Students at the University of Botswana regularly need small errands run: collecting a parcel from a courier point, standing in a long registration or bank queue, buying an item in town, printing and submitting a document before a deadline. Lectures, labs and part-time commitments often make it impossible for a student to do this themselves in time. When this happens, students currently ask around informally, usually in residence WhatsApp groups or by word of mouth, to find a classmate willing to help. This works unevenly: a request can sit unanswered for hours, a willing helper is not always someone the requester knows or trusts, and once someone agrees there is no shared record of what was actually agreed, including the task, the price and the deadline. When something goes wrong, such as a helper who does not show up, buys the wrong item, or a disagreement over whether payment was made, neither side has anything to point back to. This creates real cost for both requesters, who lose time and sometimes money, and helpers, who can be unfairly blamed with no record to defend themselves. Campus Concierge addresses this by giving students one shared place to post an errand, get automatically matched with a vetted, registered helper, and keep a traceable record of the deal as it happens.

## Goal

Enable students to find a trustworthy peer helper for a campus errand and keep a shared, traceable record of the agreed deal, so disputes and unresolved no-shows become rare rather than routine.

## Objectives

1. During a pilot with real errand requests, match at least 80% of posted errands with an accepting helper within 2 hours.
2. Ensure at least 90% of matched deals have an explicit, timestamped record of task category, standard price and deadline stored before the helper marks work as started.
3. Provide a dispute-report workflow that captures enough evidence to reconstruct at least 90% of test dispute scenarios without relying on external chat logs.

## In scope

- Posting an errand request under a defined category with its standard price
- Vetting and registering students as helpers, and auto-assigning a posted errand to an available registered helper
- Recording task details, category and deadline against the category's standard price
- Errand status lifecycle and dispute reporting

## Out of scope

- Real payment processing or holding funds
- Per-errand price negotiation between requester and helper
- Open self-signup as a helper without admin approval
- University disciplinary adjudication
- Background or criminal-record checks beyond the team's own vetting

## Assumptions

- Students authenticate with their existing university student number/email
- Cash or mobile money changes hands outside the app
- New helpers are recruited and approved by the admin team, not by open self-signup
- Each errand category has a fixed standard price set by admins, not negotiated per errand

## Constraints

- Must remain usable on limited campus data or wifi
- Must be deployable and supportable by a small student team
- Errand capacity is limited by how many vetted helpers are currently registered
- Delivered within one semester as a vertical slice, not a full product
