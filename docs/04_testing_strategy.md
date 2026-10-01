# 04 Testing Strategy (top priority)

Tests are the main proof this project works. Privacy and reveal rules are the showpiece.

## Principles
1. Security and database rules: write the test first, watch it fail, then write the policy or function until it passes.
2. Every test has an ID (for example T-REV-03). Use it in test names and commit messages. The README ends with a table of all IDs.
3. Tests run against a real Supabase database, not mocks, for anything touching RLS or functions. On the laptop that is the linked hosted project (`--linked`); in CI it may be a throwaway local Supabase inside the GitHub runner.
4. CI blocks merging if any test fails.
5. The simulation plays the whole product with fake friends and runs on every pull request.

## Layers
| Layer | Tool | Location | Runs |
|---|---|---|---|
| Database rules | pgTAP via `supabase test db --linked` | `supabase/tests/*.sql` | every PR |
| Edge Function logic | Deno test | `supabase/functions/_shared/*.test.ts` | every PR |
| Unit and component | Vitest (+ Testing Library) | `tests/unit/*.test.ts(x)` | every PR |
| Full simulation | TypeScript script | `scripts/simulate.ts` | every PR |
| End-to-end UI | Playwright | `tests/e2e/*.spec.ts` | happy paths every PR, full set nightly |

## pgTAP files and where their tests are defined
| File | Covers | Defined in |
|---|---|---|
| 01_groups_isolation.sql | T-RLS-01 to 04 | features/03 |
| 02_answers_reveal.sql | T-REV-01 to 10 | features/06 |
| 03_messages.sql | T-MSG-01 to 05 | features/07 |
| 04_admin_rules.sql | T-ADM-01 to 03 | features/08 and 10 |
| 05_join_leave_remove.sql | T-MEM-01 to 07 | features/03 and 10 |
| 06_tick.sql | T-TICK-01 to 08 | features/05 |
| 07_suggestions.sql | T-SUG-01 to 03 | features/09 |
| 08_constraints.sql | T-CON-01 to 03 | features/03 and 11 |
| 09_ownership.sql | T-OWN-01 to 06 | features/10 |
| 10_demo.sql | T-DEMO-01 to 03 | features/13 |
| 11_notifications.sql | T-NOT-01 to 03 | features/12 |

Each pgTAP file starts with `begin;`, creates two or three users and a group, and ends with `select * from finish(); rollback;`. Because the tests run against the hosted project, every file must end in `rollback` so nothing it creates is kept. Use `set local role authenticated` with `request.jwt.claims` to act as a user, and the default role to act as the service role.

## Simulation and e2e users
Fake friends play the real product against the real RLS rules. Fixtures, scripts, scenarios S1 to S10, and the clock approach are in `features/13_demo_mode_and_simulation.md`.

Simulation and Playwright users are created by scripts with the service role admin API (`auth.admin.createUser`), never through the dashboard. They use a clear naming pattern so they can be found and cleaned up:
- Email: `sim+<run-id>-<name>@sidequest.test` for the simulation and `e2e+<run-id>-<name>@sidequest.test` for Playwright (`<run-id>` is a timestamp or CI run number).
- Display names keep the fixture names (Maya, Alex, Sarah, Jay, Sam).
- Each run deletes its own users at the end with `auth.admin.deleteUser`.
The demo friends (`*@demo.sidequest.test`) are separate and long-lived; see feature 13.

## Coverage gates
- Vitest coverage on `lib/` at least 80%.
- Every RLS rule R1 to R10 in `03_data_model.md` maps to at least one test ID (keep a table in `docs/decisions.md`).

## Commands (define in package.json)
| Command | Does |
|---|---|
| pnpm test:unit | Vitest |
| pnpm test:db | `supabase test db --linked` |
| pnpm test:fn | `deno test supabase/functions` |
| pnpm seed:demo | Seeds Demo Crew from fixtures |
| pnpm simulate | All scenarios (`pnpm simulate S3` runs one) |
| pnpm test:e2e | Playwright happy paths |
| pnpm test:all | Everything above in order |

## Rules for writing tests
- One behavior per test; name says the rule ("member cannot read another member's answer before reveal").
- Test the boundary (one second before and after reveal_at).
- Test the attack path (direct table call, RPC call, realtime subscription), not only the UI.
- Never disable a failing test; fix it or delete it with a reason in the commit.
