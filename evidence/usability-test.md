# Usability test record: Campus Concierge

Screens tested: `prototype/wireframes.drawio` (paper or on-screen low fidelity). Tasks: T1 and T2 in `docs/user-profile-and-tasks.md`.

**How this record is used.** Section 1 is the plan, Section 2 is the walkthrough done before testing, Section 3 is filled in during the three-person test, and Section 4 records the revision. Entries in Section 3 must be what was actually seen.

## 1. Test plan

| Item | Detail |
|---|---|
| Participants | Three students who are not on the project team. Two act as requesters (T1) and one as a helper (T2), or all three do both if time allows |
| Method | Task-based. The participant gets the scenario, not instructions. They tap on the wireframes; the facilitator moves the screens. The participant is asked to think aloud |
| Facilitator rule | Do not help or explain. Note where they hesitate, go the wrong way, or ask a question |
| Time | About 10 minutes per participant |
| Measures | Completed without help (yes or no), time taken, wrong turns, questions asked, what they said the status or price was |

### Task prompts

- **T1.** "You need a parcel collected from the courier point before 17:00 on Friday. Use the app to ask someone to do it." After posting: "What is the state of your errand? What happens if nobody answers?"
- **T2.** "You get a notification that an errand has been offered to you. Decide whether to take it." After: "How long do you have to answer? Where would you find the meeting point?"

### Success criteria (from the task scenarios)

- T1 completed without help in 90 seconds or less.
- The participant states the price and the status correctly.
- T2 answered in two actions; the participant says the time left correctly.
- The participant does not expect to see a contact detail before both confirm.

## 2. Walkthrough before testing (team review of the wireframes)

The team stepped through each task as a first-time user and asked at each step: will the user know what to do, see the control, and understand the result.

| Step | Question | Finding | Predicted risk |
|---|---|---|---|
| R1 category | Will the user know the price is fixed? | The price line is shown below the category | Low |
| R1 meeting point | Will the user wonder who sees it? | The hint says it is shown only after both confirm | Low |
| R2 after posting | Will the user know what happens if nobody answers? | The text says the offer is passed on automatically | Medium: users may expect to do something |
| H1 deadline | Will the helper understand how long is left? | A bare countdown could be missed in a quick glance | Medium: the clock time and minutes left are given in words (change C-1) |
| H1 buttons | Could Accept and Decline be confused or mis-tapped? | They are stacked, full width, same size | Low |

These are predictions. The test below decides whether they matter.

## 3. Observations (fill in during the test)

| Participant | Task | Observation (what they did and said) | Result (completed, with help, failed) | Time | Revision needed |
|---|---|---|---|---|---|
| P1 | T1 | | | | |
| P2 | T1 | | | | |
| P3 | T2 | | | | |

## 4. Revisions

| ID | Difficulty observed | Participant | Change made | Screen | How verified after build |
|---|---|---|---|---|---|
| C-1 | The helper's time left is given as a clock time plus words instead of only a countdown | Walkthrough (section 2) | H1 shows "Respond by 14:10 (9 min left)" | H1, R2 | Open H1 with a screen reader and read the time; check A-6 and A-10 |
| C-2 | (from the test) | | | | |

C-1 comes from the team walkthrough. The marking requires at least one change that follows from observed user difficulty: record at least one real change as C-2 from Section 3, and name the participant.

## 5. Exit record

- **Most important usability problem observed:** (fill in from Section 3)
- **Interface change made:** (fill in; C-2)
- **How it will be verified after implementation:** repeat the same task with a new participant on the built interface and check the success criterion in Section 1; for time-left wording, check A-6 and A-10 in `docs/accessibility-checklist.md`.
