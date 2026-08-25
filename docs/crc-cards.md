# CRC cards: Campus Concierge

Class - Responsibilities - Collaborators

## Errand
**Responsibilities**
- Know its own task details, category, price, deadline and status
- Validate that a requested status transition is legal
- Lock its price to the category's standard price at posting time (BR-D2)

**Collaborators**
ErrandCategory, Assignment, Dispute, Requester

## Assignment
**Responsibilities**
- Know which helper it was offered to, and when
- Record its own outcome once decided: accepted, declined, or timed out
- Know whether its acceptance window has expired

**Collaborators**
Errand, Helper

## ErrandCategory
**Responsibilities**
- Know its own approved status and standard price
- Refuse to let a new Errand reference it while not approved (BR-D1)

**Collaborators**
Errand, Administrator

## Administrator
**Responsibilities**
- Vet and register a Helper
- Set an ErrandCategory's approved flag and standard price
- Review a Dispute's evidence and resolve it

**Collaborators**
Helper, ErrandCategory, Dispute

## Dispute
**Responsibilities**
- Know its reason, the Errand it concerns, and when it was opened
- Record its resolution and when it was resolved
- Refuse a resolution set by anyone other than an Administrator (BR-D7)

**Collaborators**
Errand, Administrator
