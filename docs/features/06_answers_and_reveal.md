# Feature 06: Answers and reveal

Depends on: 04, 05. Database: part of 0011 (answers policies), 0008 triggers, 0015 realtime for `question_progress`. AUTHOR WRITES the answers policies and `02_answers_reveal.sql` first. Cursor builds UI and queries.

## Scope
The group feed of day cards, the private answer box, anonymous progress, and the reveal view.

## Day card states (`components/feed/DayCard.tsx`)
| State | What the user sees |
|---|---|
| Open, not answered | Question, countdown ("Reveals 8:00 pm, in 5h 12m"), ProgressDots ("4 of 6 answered"), answer box, "Submit answer", Pip bubbles (question, reminder), row "Thread opens at 8:00 pm" with a lock. |
| Open, answered | Your answer with "Edit answer" and "Waiting for the reveal". |
| Revealed | Question, first three answers with authors, "+N more", thread row ("Open thread, 14 messages, last message preview"). |
| Missed | Revealed card plus a small "You didn't answer" label. |

## Flows
| Click | Flow |
|---|---|
| Submit answer | Empty: "Write something first." Otherwise insert into `answers`; a trigger increments `question_progress.answered_count`; card switches to answered; toast "Locked in. Reveal at 8:00 pm." If RLS rejects because the reveal passed: reload the card as revealed with "The reveal already happened. You can still read everything." |
| Edit answer | Reopens the text area with current text. |
| Save edit | Updates own answer only while `now() < reveal_at`; else same message as above. |
| Thread row or "+N more" | Go to `/g/[groupId]/q/[questionId]`. |
| Load older | Fetch the next 30 days. |

Reveal view (`app/(app)/g/[groupId]/q/[questionId]/page.tsx`, `components/thread/AnswerList.tsx`)
Question at top ("Maya asks" or Pip), every answer as a card (avatar, name, text), and quietly at the bottom "Didn't answer: Sam, Jay". Answers from people who later left still show their name. The thread below is feature 07.

Past questions (`app/(app)/g/[groupId]/past/page.tsx`): a list of previous days (date, question, answer count, message count); each row opens the reveal view.

## Data
- `lib/queries/questions.ts: listDays(groupId, cursor)` returns questions with my own answer (RLS hides others before reveal), progress counts, and for revealed days the first three answers.
- `lib/realtime/useProgress.ts` subscribes to `question_progress` for open questions so dots update live.
- Answer triggers: insert increments and delete decrements `answered_count`.

## Files
`app/(app)/g/[groupId]/page.tsx`, `.../q/[questionId]/page.tsx`, `.../past/page.tsx`, `components/feed/{DayCard,AnswerBox,ProgressDots,Countdown,PipBubble}.tsx`, `components/thread/AnswerList.tsx`, `app/actions/answers.ts`, `lib/queries/{questions,answers}.ts`, `lib/realtime/useProgress.ts`, migrations and tests above.

## Acceptance criteria
- [ ] Before reveal, no other member's answer text appears in the page, in network responses, or over realtime.
- [ ] Progress shows counts and dots only, never names.
- [ ] One answer per person per question; editing works until reveal; nothing is accepted after.
- [ ] At reveal time the card flips to revealed without a manual refresh (countdown reaching zero triggers a refetch).
- [ ] Members who missed it can read all answers afterward and see the "didn't answer" label.
- [ ] Answers from members who left still show their name.
- [ ] Empty feed message: "Pip's first question arrives at 9:00 am."

## Tests (pgTAP `02_answers_reveal.sql`)
- T-REV-01 Before reveal, a member cannot select another member's answer (zero rows).
- T-REV-02 Before reveal, a member can select their own answer.
- T-REV-03 After reveal, an active member can select all answers of that question.
- T-REV-04 After reveal, an outsider still cannot.
- T-REV-05 Cannot insert an answer when `now() >= reveal_at`.
- T-REV-06 Cannot insert twice for the same question.
- T-REV-07 Cannot update an answer after reveal.
- T-REV-08 Boundary: reveal_at one second in the future blocks reads; one second in the past allows them.
- T-REV-09 `answered_count` increments on insert and never exposes who.
- T-REV-10 Two users inserting in parallel both succeed.
- T-E2E-03 Both answer; neither sees the other's answer in the page or in network responses before reveal.
- T-UNIT-04 (part): DayCard renders all four states; ProgressDots shows no names.
