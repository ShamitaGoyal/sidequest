# Feature 13: Demo mode and fake-friends simulation

Depends on: 03 to 10 (build S1 to S3 as soon as features 05 to 07 work; add the rest as features land). Database: migration 0014 (AUTHOR WRITES `join_demo`, `demo_skip_to_reveal`, `demo_reset`). Cursor writes fixtures, scripts, and UI.

## Scope
One set of fake friends and fake days used three ways: simulation (against the linked hosted project from the laptop, or a throwaway Supabase inside the CI runner), Playwright tests, and the production demo group recruiters open. No Docker on the laptop.

## Fixtures (`supabase/fixtures/`)
- `people.json`: five fake friends with pre-filled inputs.
  | Name | City | Into | Ask me about |
  |---|---|---|---|
  | Maya | Seattle | matcha | her move |
  | Alex | Austin | learning guitar | neighbors |
  | Sarah | Chicago | running | her first marathon |
  | Jay | New York | cooking | dumplings |
  | Sam | Denver | horror movies | winter films |
  Each has display name, avatar color, email `maya@demo.sidequest.test` (and so on), a known password for simulation and test use, and profile card text. Simulation and e2e runs create their own throwaway users with the service role admin API using the `sim+<run-id>-<name>@sidequest.test` / `e2e+<run-id>-<name>@sidequest.test` pattern (see `04_testing_strategy.md`) and delete them at the end. In production the seeded users get random unknown passwords and cannot be logged into.
- `days.json`: 14 days. Each day has a question (source ai, member, or fallback), each friend's answer (some days one friend skips), and thread messages (some busy, some quiet, one with a Pip nudge).

## Scripts (`scripts/`)
- `seed-demo.ts` (service role): creates the five users, group "Demo Crew" (`is_demo = true`, timezone `America/Los_Angeles`, Maya as admin), Pip settings (Chill), the 14 past days with backdated timestamps, and an open "today" question with four fake answers already in. Users are created with the service role admin API (`auth.admin.createUser`), never the dashboard. Command: `pnpm seed:demo`.
- `reset-demo.ts`: calls `demo_reset()`.
- `simulate.ts`: runs scenarios and prints a table (step, expected, actual, pass or fail); exits non-zero on any failure. `pnpm simulate` runs all; `pnpm simulate S3` runs one.

## How the clock works
- Visibility uses the real database clock inside RLS, so the simulation cannot fake time there.
- The script decides what `tick()` does by calling `tick(p_now := '<simulated moment>')`.
- After a question is created, the script (service role) moves that question's `post_at` and `reveal_at` to fit the real clock (for example `reveal_at = now() + 1 hour` so answers are accepted). To simulate the reveal it sets `reveal_at = now() - 1 second`. To simulate an aged thread it backdates message `created_at`.
- Each fake friend uses their own supabase-js client signed in with the fixture password, so the simulation exercises real RLS, never the service role.
- `LLM_PROVIDER=mock` always.

## Scenarios
| ID | Scenario | Key assertions |
|---|---|---|
| S1 | Happy path: Maya creates the group, four friends join with the code, `tick` posts the question, everyone answers, reveal, thread messages | Nobody reads others' answers before reveal; everyone does after; reveal message and notifications exist once |
| S2 | Missed answer: Sam skips | Sam can read after reveal, is listed as "didn't answer", and cannot insert late |
| S3 | Quiet thread: 2 messages, age the thread 7 hours, run `tick` twice | Exactly one nudge; none with 3 messages; none at 11 pm local |
| S4 | 14-day replay: replay `days.json` through `tick` and answers | One question per day; 14 reveal messages; answer counts match the fixture; no duplicates |
| S5 | Leave, remove, transfer: Jay leaves, Alex removed, Maya transfers ownership to Sarah and leaves | Old content visible with names; new content hidden from departed members; exactly one admin throughout |
| S6 | Member-asked priority: Sarah queues 2, a third is rejected | Next question is her oldest, attributed; queue drains in order |
| S7 | Idempotency: run `tick` ten times for the same moment | No duplicate questions, reminders, reveals, nudges, or notifications |
| S8 | Concurrency: four friends submit with `Promise.all` | All four succeed; `answered_count` = 4; a duplicate from one friend fails |
| S9 | Attacker: a user outside the group tries every read and write (direct tables, RPC, realtime subscription) | Everything denied; no rows or events received |
| S10 | AI failure: mock provider returns garbage, then times out | Fallback question used; nothing crashes; cap counted |

## Demo mode in the product
Route `app/demo/route.ts` and `components/shell/DemoBanner.tsx`.
| Click | Flow |
|---|---|
| Try the demo group (landing or home) | Route signs in an anonymous Supabase user (enable anonymous sign-ins), calls `join_demo()` (adds the caller to Demo Crew), redirects to `/g/[demoGroupId]`. Banner: "You're in demo mode." |
| Skip to 8 pm (demo only, on the open question card) | Calls `demo_skip_to_reveal(question_id)`, which sets `reveal_at` to now only if the group `is_demo`. The card flips to revealed; the thread opens. |
| Answer or post as guest | Allowed. |
| Create group, regenerate code, change Pip settings, remove members | Blocked for anonymous users (database check), hidden in the UI. |
| Nightly reset | pg_cron runs `demo_reset()` at 03:00 UTC: deletes guest members and their content and restores today's open question. |

## Files
`supabase/fixtures/*.json`, `scripts/{seed-demo,reset-demo,simulate}.ts`, `app/demo/route.ts`, `components/shell/DemoBanner.tsx`, migration 0014, `supabase/tests/10_demo.sql`, `tests/e2e/demo.spec.ts`.

## Acceptance criteria
- [ ] `pnpm seed:demo && pnpm simulate` passes against the linked hosted project and in CI.
- [ ] Fixtures contain the five friends and 14 days exactly as described.
- [ ] A visitor reaches a working Demo Crew in one click, with no sign-up.
- [ ] "Skip to 8 pm" shows the full reveal and thread in under 3 seconds.
- [ ] Guests cannot break the demo for others (admin actions blocked; nightly reset).
- [ ] Simulation output is readable: each scenario prints pass or fail per assertion.

## Tests
- T-DEMO-01 `demo_skip_to_reveal` works only for demo groups.
- T-DEMO-02 Anonymous users cannot create groups or call admin functions.
- T-DEMO-03 `demo_reset` removes guest content and restores today's open question.
- T-E2E-05 Demo button lands in Demo Crew; "Skip to 8 pm" reveals.
- Simulation S1 to S10 above.
