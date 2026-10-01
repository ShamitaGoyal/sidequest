# Feature 15: Launch, real users, and writeup

Depends on: everything else. Owner: the author (Cursor can draft README sections).

## Scope
Production launch, one week of real use, a small usability study, and the portfolio writeup.

## Launch checklist
- [ ] `05_ci_cd.md` first-time setup checklist complete.
- [ ] Database backup taken in the Supabase dashboard before the first production migration.
- [ ] Production migrations applied through `deploy.yml` (not by hand).
- [ ] `LLM_PROVIDER=real` set in Supabase secrets; per-group and global caps set conservatively.
- [ ] `seed:demo` run against production; demo group works; nightly `demo_reset` scheduled.
- [ ] `pnpm smoke` passes against the production URL.
- [ ] Anonymous sign-ins enabled in Supabase Auth settings for demo mode.

## Real-user week
- 3 to 5 friends in 1 or 2 groups use it daily for at least 7 days.
- Track these numbers (simple SQL queries saved in `docs/metrics.sql`):
  groups, answers, threads; percent of days where at least half the group answered; percent of threads with 3 or more human messages; percent of nudged threads with a human reply within 3 hours.
- Ask friends about Pip's wording, especially the 4:30 pm reminder. Decide whether to keep it.

## Usability study
- Watch 3 people use the app cold over screen share. Give them only the URL and "try it".
- Write down where they hesitate or misclick.
- Fix the top 3 issues. Record before and after (screenshots or short notes) in the README.

## README contents
1. One-paragraph pitch and a demo link.
2. Screenshot or GIF of the loop (answer, reveal, thread, Pip nudge).
3. Architecture diagram (from `01_global_prd.md`).
4. The hard problem: how privacy and reveal are enforced in the database; list RLS rules R1 to R10 with the test IDs that prove them.
5. The fake-friends simulation: what it is, how to run it, scenario table.
6. CI/CD: pipeline diagram and what each step protects.
7. Usability findings: before and after.
8. Real-user numbers.
9. Decisions and tradeoffs (link to `docs/decisions.md`): why Supabase, why no global chat, why fixed-time reveal, why presets instead of free text.
10. What I'd do next: the non-goals list.
11. Test table: every test ID, layer, and what it proves.
12. How to run locally.

## Demo video (60 to 90 seconds)
Open the landing page, click Try the demo, answer the open question, click Skip to 8 pm, show the reveal and thread, show a Pip nudge, end on the test results or CI badge.

## Interview notes (write in `docs/decisions.md`)
- The reveal rule lives in RLS using the database clock; the frontend is not trusted.
- Why a scheduler with an injectable `p_now`: it made time-dependent logic testable.
- What broke in production and how the tests or smoke checks caught it.

## Acceptance criteria
- [ ] Production URL works for a stranger with no sign-up.
- [ ] README has all twelve sections.
- [ ] Real-user numbers and three usability fixes are documented.
- [ ] Demo video is linked at the top of the README.
