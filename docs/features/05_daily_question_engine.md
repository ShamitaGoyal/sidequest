# Feature 05: Daily question engine

Depends on: 03. Database: migrations 0005 (questions), 0006 (messages), 0008 (question_progress), 0009 (question_bank and seed), 0013 (`tick`). AUTHOR WRITES `tick()` and `06_tick.sql` tests first.

## Scope
The scheduler that creates the daily question, posts Pip's reminder and reveal message, and (in feature 08) nudges quiet threads. In this feature the question always comes from the fallback bank, so the engine works without AI. Feature 08 adds AI; feature 09 adds member-asked questions.

## Timing (group local time)
| When | What `tick()` does |
|---|---|
| 9:00 am or later, no question for today's local date | Create the question (fallback for now). Insert a `pip_question` message. Create `question_progress` with the active member count. |
| About 4:30 pm | Insert one `pip_reminder` with a count only ("4 of 6 are in"), no names. |
| 8:00 pm (`now >= reveal_at`) | Insert one `pip_reveal` message. Create reveal notifications (feature 12). |
| 6+ hours after reveal, quiet thread | Request a nudge (feature 08). |
After 9:15 am with no question and the AI unavailable, use a fallback question so every day has one.

## How `tick(p_now)` works
- pg_cron runs `select tick();` every 5 minutes.
- `p_now` (default `now()`) is the moment the function reasons about. Tests and the simulation pass a simulated moment.
- All steps are idempotent: unique constraints (`group_id, local_date`; one `pip_nudge` per question) plus `on conflict do nothing`. Running it ten times must not duplicate anything.
- `local_date`, `post_at`, `reveal_at` are computed with `AT TIME ZONE groups.timezone` so DST is handled by the database.
- The reveal itself is never done by `tick()`. Visibility is decided by `now() >= reveal_at` inside the RLS policy (feature 06). `tick()` only posts the message and notifications.

## Files
`supabase/migrations/0005`, `0006`, `0008`, `0009`, `0013`; `supabase/tests/06_tick.sql`; `lib/time.ts` (local date, countdown, used by UI); fixtures of 60+ questions in the bank seed.

## Acceptance criteria
- [ ] Every group gets exactly one question per local day.
- [ ] The question, reminder, and reveal messages appear once, in the right order, at the right local time.
- [ ] The reminder contains the count and no names.
- [ ] DST change days still post at 9:00 local and reveal at 20:00 local.
- [ ] Running `tick()` repeatedly creates no duplicates.
- [ ] Groups in different timezones are handled independently.
- [ ] Question body never exceeds 140 characters.

## Tests (pgTAP `06_tick.sql`; T-TICK-03 is completed in feature 09, T-TICK-07 in feature 08)
- T-TICK-01 At 09:00 local, `tick(p_now)` creates exactly one question per group.
- T-TICK-02 Running `tick` twice creates no duplicate question, reminder, reveal, or nudge.
- T-TICK-04 After 9:15 local with the AI unavailable, a fallback question is inserted.
- T-TICK-05 The reminder has the right count and no names.
- T-TICK-06 Reveal message is created once at reveal.
- T-TICK-08 Timezone and DST: `America/Los_Angeles` on the DST change day still posts at 9:00 local and reveals at 20:00 local.
- Unit T-UNIT-01: `lib/time.ts` local date, countdown string, DST boundary.
