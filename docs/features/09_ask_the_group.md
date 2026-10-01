# Feature 09: Ask the group (member-asked questions)

Depends on: 05, 06. Database: migration 0007 and the suggestion policies (R8); tick priority in 0013 (AUTHOR WRITES). Cursor builds UI.

## Scope
Any member can add a question to a queue. At 9:00 am `tick()` uses the oldest queued question instead of generating one and Pip posts it as "Maya asks:". This is the main personal touch.

## Rules
- 140 characters max. Max 2 queued questions per person.
- Oldest first across the group. If the queue is empty, Pip generates one (feature 08) or uses the fallback.
- When used: status becomes `used`, `used_on` is set, the question's `source` is `member` and `asked_by` is set.
- Owners can delete their own queued questions. Used ones stay in the list as history.

## Screen (`app/(app)/g/[groupId]/ask/page.tsx`, action `app/actions/suggestions.ts`)
Text box with counter, "Add to queue". Below: the group's queue (author, text, position) and a history of used questions ("Used on Oct 4").
| Click | Flow |
|---|---|
| Add to queue | Validates. Third queued item: "You already have 2 in line." Inserts into `question_suggestions`. Toast "Added. Pip will use it in about N days." (N is the queue position.) |
| Delete (own queued item) | Sets status to `deleted`; removed from the list. |

## Day card change
When `source = member`, the Pip bubble starts with "Maya asks:" followed by the question (`components/feed/PipBubble.tsx`, `DayCard.tsx`).

## Files
`app/(app)/g/[groupId]/ask/page.tsx`, `app/actions/suggestions.ts`, `lib/queries/suggestions.ts`, `components/feed/PipBubble.tsx`, migration 0007, policy R8, `tick()` step in 0013, `supabase/tests/07_suggestions.sql`.

## Acceptance criteria
- [ ] A member can queue up to 2 questions; the third is rejected in UI and database.
- [ ] The oldest queued question is used first and attributed to its author.
- [ ] Deleted questions are never used.
- [ ] Outsiders and former members cannot read the queue.
- [ ] Empty queue falls back to AI or the bank without errors.

## Tests
- T-SUG-01 Third queued suggestion from one member is rejected.
- T-SUG-02 A member can delete only their own.
- T-SUG-03 Outsiders cannot read the queue.
- T-TICK-03 A queued member question is used before AI, oldest first, and marked used.
- Simulation S6: Sarah queues 2 and a third is rejected; the next day's question is her oldest, attributed; the queue drains in order.
