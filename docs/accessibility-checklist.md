# Accessibility checklist: Campus Concierge

Applies to the screens in `prototype/wireframes.drawio`. Status is Designed (in the wireframe) or To verify (needs the built interface). Checks are based on WCAG 2.2 level AA.

## 1. Checklist

| ID | Requirement | Where designed | Status | How it is verified after build |
|---|---|---|---|---|
| A-1 | Everything can be done with the keyboard, in a sensible order (top to bottom, left to right) | All screens | To verify | Tab through R1, H1 and each state without a mouse |
| A-2 | Focus is always visible | All screens | To verify | Tab through and check that the focused control is outlined in every state |
| A-3 | Each field has a persistent visible label, not only a placeholder | R1 (note 1) | Designed | Inspect: every input has a linked label |
| A-4 | Status is given in words, never by colour or icon alone | R2, R2b, H1 to H4 (note 3) | Designed | Check the interface in greyscale |
| A-5 | Errors are shown in a summary and next to the field, state what to fix, and focus moves to the summary | R1, ui-states section 1 | Designed | Submit an empty form and check with a screen reader |
| A-6 | Changing messages (expiry, errors, status) are announced through a live region, at most once per minute for the countdown | R2, H1 (note 4) | To verify | Run with a screen reader and listen |
| A-7 | Text contrast is at least 4.5 to 1, and large text 3 to 1 | All screens | To verify | Check with a contrast tool |
| A-8 | Layout works at 360 px width and when text is enlarged to 200 percent, with no sideways scrolling | All screens | To verify | Resize the browser and zoom |
| A-9 | Touch targets are at least 44 by 44 px, with space between Accept and Decline | H1 (note 2) | To verify | Measure in the browser tools |
| A-10 | No time limit is stricter than needed. The 10-minute window is a business rule (D-003); its remaining time is visible so the user can plan | H1, R2 | Designed | Check the minutes-left text is present |
| A-11 | Cancel and Decline are never hidden or reduced to a small link | R2, H1 | Designed | Inspect |
| A-12 | Pages have headings and a title that match the screen name | All screens | To verify | Check with a screen reader |

## 2. Rationale and alternative

- **Time shown as a clock time plus minutes left, updated once a minute.** The alternative was a ticking countdown every second. It was rejected because it is hard to read for some users and, in a live region, it would be announced constantly. The consequence accepted: the displayed time can be up to a minute behind, so the clock time of expiry is shown as well.
- **Status as a word in a box.** The alternative was a coloured chip or icon. It was rejected because it fails for colour-blind users and screen readers, and it needs a legend.

## 3. Traceability

| Item | Quality concern |
|---|---|
| A-6, A-10 | QS-1 (the window must be understandable) |
| A-4, A-5 | Usable errors for FR-13 and the API error codes |
| A-1 to A-3, A-7 to A-9, A-11, A-12 | General usability; no QS exists yet. A new scenario QS-6 for usability can be added if the team wants one |
