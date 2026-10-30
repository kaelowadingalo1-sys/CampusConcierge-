# Interface states: Campus Concierge

Each state is designed on purpose. Error codes are the ones in `docs/api-contracts/core-operation.md`. Screen IDs are in `prototype/wireframes.drawio`.

## 1. Post an errand (R1)

| State | When | What the user sees | What the user can do |
|---|---|---|---|
| Normal | Form open | Labelled fields, fixed price shown after a category is chosen | Fill in and post |
| Loading | After Post, waiting for the server | The Post button changes to "Posting..." and is disabled. Entered values stay on screen | Wait. The key is kept, so a second tap cannot create a second errand |
| Empty (categories) | Category list could not be loaded or is empty | "No categories are available right now." and a Try again button | Try again |
| Validation (400 VALIDATION_FAILED) | A field is missing, too long, or the deadline is in the past | A summary at the top ("2 fields need attention") and a message under each field naming what to fix. Focus moves to the summary | Fix and post again. Entered values are kept |
| Category rejected (422 CATEGORY_NOT_APPROVED) | The category was removed after the list was loaded | "This category is no longer available. Choose another." The list refreshes | Choose another category |
| Unauthorised (401 NOT_AUTHENTICATED) | Session ended | Sign in screen, then back to the form with values kept | Sign in |
| Unauthorised (403 ACCOUNT_NOT_CONFIRMED) | Email link not yet confirmed (FR-16) | "Confirm your university email to post. We sent a link to your address." | Resend the link |
| Unavailable (503 SERVICE_UNAVAILABLE) | Database not reachable | "We could not post your errand. Nothing was saved. Try again." Values kept | Try again with the same key |
| Offline | No connection on the device | "You are offline. Your errand has not been posted." Post is disabled | Reconnect, then post |

## 2. Errand status (R2, R2b, R3, R4)

| State | When | What the user sees | What the user can do |
|---|---|---|---|
| Loading | Opening the screen | "Loading errand..." in place of the status box | Wait |
| Waiting (R2) | AWAITING_ACCEPTANCE | "Waiting for a helper to accept", expiry time and minutes left | Cancel for free |
| Backlog (R2b) | POSTED with no helper free | "No helper free yet. We keep trying. Nothing for you to do." | Cancel for free |
| Offer passed on | Helper declined or timed out | The status text stays "Waiting for a helper" with the new expiry time. The previous helper is not named | None needed |
| Stale | The screen has not been able to refresh for over 1 minute | "Last updated 14:02. Refresh to see the latest." with a Refresh button | Refresh |
| Confirm (R3) | ACCEPTED, requester not yet confirmed | Terms listed, Confirm helper button | Confirm or cancel |
| Locked (R4) | Both confirmed | Terms, meeting point, helper contact | Report a problem |
| Unauthorised | Opening another user's errand | "This errand is not available to you." No details | Go to My errands |
| Empty (My errands) | The user has posted nothing | "You have not posted an errand yet." and a Post an errand button | Post |
| Unavailable | The server cannot be reached | "We cannot load your errand. Try again." | Try again |

## 3. Helper offer (H1 to H4)

| State | When | What the user sees | What the user can do |
|---|---|---|---|
| Loading | Opening the offer | "Loading offer..." | Wait |
| Normal (H1) | Window open | Category, price, deadline, task, response time and minutes left | Accept or Decline |
| Submitting | After Accept or Decline | Both buttons disabled, "Sending your answer..." | Wait |
| Expired (H3) | Window closed, or the offer went to another helper | "This offer expired at 14:10 and was passed on." | Back to My offers |
| Already answered | Reopened after an answer | "You accepted this errand." (or declined) with no buttons | Back |
| Waiting (H2) | Accepted, requester not confirmed | "Waiting for the requester to confirm" | None |
| Confirmed (H4) | Both confirmed | Terms and contact details | Report a problem |
| Empty (My offers) | No offer waiting | "No offers right now. We notify you when one arrives." | None |
| Unauthorised | A requester opens a helper page | "This page is for helpers." | Go to My errands |
| Unavailable / offline | Server or network down | "We cannot reach the service. If your offer expires while you are offline it is passed on." | Retry |
| Not a helper | An account that is not registered as a helper | "You are not registered as a helper." | None |

## 4. Rules that apply to every state

- Every message says what happened and what to do next, in words.
- State is never shown by colour or icon alone.
- Messages that appear without a page change (errors, expiry) are announced to screen readers through a live region.
- A failed action never discards what the user typed.
