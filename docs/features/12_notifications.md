# Feature 12: Notifications

Depends on: 05, 06. Database: table in 0008, policy R9, creation inside `tick()` (AUTHOR WRITES). Cursor builds UI.

## Scope
In-app notifications only: a bell dropdown and unread dots on the group rail. Email is an optional stretch after everything else ships.

## Rules
- Types: `question_live` (at post time) and `reveal` (at reveal time). One per member per question per type.
- Created by `tick()` for active members only.
- A user reads and updates only their own notifications.
- Opening a question's page marks its notifications read.

## UI
- `components/shell/NotificationBell.tsx`: bell icon with a count; dropdown lists unread items ("New question in the college crew", "Answers are in").
- `GroupRail.tsx`: a dot on a group with unread notifications.
- `GroupSidebar.tsx`: a dot on Today when there are unread items.

## Flows
| Click | Flow |
|---|---|
| Bell | Opens the dropdown with the latest 10 items. |
| A notification | Navigates to the question page and marks it read. |
| "Mark all read" | Sets `read_at` on all own unread notifications. |
| Opening a question page directly | Marks that question's notifications read. |

## Files
`components/shell/NotificationBell.tsx`, `lib/queries/notifications.ts`, `app/actions/notifications.ts`, `lib/realtime/useNotifications.ts` (optional polling every 60 seconds is acceptable instead), migration 0008, `supabase/tests/11_notifications.sql`.

## Acceptance criteria
- [ ] Reveal and question-live notifications appear once per member.
- [ ] Former members receive nothing new.
- [ ] Unread dots clear when the question is opened.
- [ ] Nobody can read another user's notifications.

## Tests
- T-NOT-01 A user reads only their own notifications.
- T-NOT-02 Marking read updates only own rows.
- T-NOT-03 Running `tick()` twice creates each notification once.
- T-TICK-06 (shared with feature 05): reveal notifications created once at reveal.
