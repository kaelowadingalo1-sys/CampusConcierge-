# D-005: No payment processing or payment information

## Status
Approved (lecturer condition)

## Decision
Campus Concierge does not process, transfer, hold, or verify payments of any kind. The system records the category's fixed **standard price** as data, as part of the agreed deal, but that price is never processed as a transaction.

The system must not store:
- Bank account details
- Card details
- Mobile-money account or payment credentials
- Payment transaction credentials
- Any other financial account information

Authentication is delegated to the student's existing university login rather than a system Campus Concierge builds itself.

Example:
```
Category: Parcel Collection
Standard price: P20
Payment handling: outside Campus Concierge (cash or mobile money, arranged directly between requester and helper)
```

## Evidence that changed our mind
An early design considered in-app mobile money integration so the system could confirm payment automatically. This would require compliance, security and integration work far beyond what a semester project can deliver, and lecturer feedback made the exclusion explicit and non-negotiable rather than a scope trade-off the team could revisit.

## Consequence we accept
The system cannot enforce that payment was actually transferred, so trust ultimately rests on the deal record and the dispute-resolution process (D-005), not on an automatic payment confirmation. Using a fixed standard price per category instead of per-errand negotiation removes one source of disagreement (what was the price) but not this one (was it actually paid). Any identity-spoofing risk is inherited from whatever the university login already tolerates, since Campus Concierge does not build its own identity system.

## Next uncertainty to investigate
How reliably the existing university login can be treated as sufficient proof that a user is a real, currently enrolled student, and whether the team needs an additional lightweight trust signal before a helper is vetted and registered.
