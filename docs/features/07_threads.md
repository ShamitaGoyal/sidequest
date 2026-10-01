# Feature 07: Threads

Depends on: 06. Database: part of 0011 (messages policies), 0015 realtime for `messages`. AUTHOR WRITES the messages policies and `03_messages.sql` first. Cursor builds UI.

## Scope
A flat, text-only, realtime thread under each question. It opens at reveal. No typing indicators, read receipts, editing, or attachments.

## UI (`components/thread/ThreadView.tsx`, `MessageItem.tsx`, `MessageInput.tsx`)
- Flat list, oldest first: avatar, name, text, time. Pip messages use `PipBubble` with the AI tag.
- Time gap labels between messages more than 3 hours apart ("6 hours later").
- Input at the bottom (max 1000 chars, Enter sends, Shift+Enter adds a line). Before reveal the input is replaced by "The thread opens at 8:00 pm."
- The page scrolls to the newest message on open. New messages auto-scroll only when the user is already near the bottom; otherwise show a "New messages" button.

## Flows
| Click | Flow |
|---|---|
| Send (or Enter) | Empty does nothing. Action `app/actions/messages.ts: sendMessage` inserts `kind = chat`. The message appears immediately (optimistic) and is reconciled when realtime delivers it. On error the message shows "Couldn't send. Retry." |
| Retry | Re-sends the failed message. |
| Open the question page | Marks that question's notifications read (feature 12) and subscribes to `messages`. |
| Leave the page | Unsubscribe from realtime. |

## Data
`lib/queries/messages.ts: listMessages(questionId)`, `lib/realtime/useThread.ts` (subscribe to inserts on `messages` filtered by `question_id`; RLS applies to realtime). De-duplicate optimistic and realtime copies by id.

## Files
`components/thread/*`, `app/actions/messages.ts`, `lib/queries/messages.ts`, `lib/realtime/useThread.ts`, migration 0011 (messages part), `supabase/tests/03_messages.sql`.

## Acceptance criteria
- [ ] Two browsers in the same thread see each other's messages appear without refresh.
- [ ] Nobody can send a message before reveal (UI and database).
- [ ] A member cannot post as someone else or as Pip.
- [ ] Messages over 1000 characters are rejected with a clear error.
- [ ] A user who left the group cannot read or subscribe to new messages.
- [ ] No duplicated messages when optimistic and realtime copies both arrive.

## Tests (pgTAP `03_messages.sql`)
- T-MSG-01 Cannot insert a chat message before reveal.
- T-MSG-02 After reveal, an active member can insert `kind = chat` with their own author_id.
- T-MSG-03 A member cannot insert with another user's author_id.
- T-MSG-04 A member cannot insert `pip_*` kinds or a null author.
- T-MSG-05 Only one `pip_nudge` per question (a second service-role insert fails).
- T-E2E-04 After the simulation helper moves reveal to now, both browsers see answers and send messages that appear in realtime in the other.
- T-UNIT-04 (part): MessageItem renders Pip messages with the AI tag; gap labels appear after 3 hours.
