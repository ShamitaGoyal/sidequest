# Sidequest docs

How to use these docs with Cursor

1. Always attach `01_global_prd.md` and `02_design_system.md` to the chat.
2. Attach `03_data_model.md` whenever the task touches the database.
3. Attach ONE file from `features/` per task. Tell Cursor: "Build this feature. Stop when every acceptance box is checked and the listed tests exist."
4. Never ask Cursor to build two features in one prompt.
5. Package manager is pnpm only (`pnpm <script>`, `pnpm exec <tool>`, `pnpm dlx <one-off>`); never npm, npx, or yarn.
6. Hosted Supabase only for now: no Docker, no `supabase start`. Schema changes only through hand-written migration files; nothing is pushed to the hosted database without asking first.

Prompt template
"Read docs/01_global_prd.md, docs/02_design_system.md, and docs/features/XX_name.md. Build only that feature. Follow the global rules. Do not write anything marked AUTHOR WRITES. When done, list which acceptance items are complete."

AUTHOR WRITES (you write by hand to learn it; Cursor may review and explain afterward)
RLS policies, the reveal rule, `join_group`, `transfer_ownership`, `tick()`, and their pgTAP tests. Cursor builds everything else.

Doc map
| File | What it is |
|---|---|
| 01_global_prd.md | Vision, stack, architecture, global rules, decisions |
| 02_design_system.md | Colors, type, layout, component specs, copy voice |
| 03_data_model.md | Every table, enum, function, policy, migration order |
| 04_testing_strategy.md | Test layers, rules, IDs, commands |
| 05_ci_cd.md | Pipeline, secrets, deploy, rollback |
| features/01 to 15 | One buildable feature each |

Build order
| Step | Feature doc | Notes |
|---|---|---|
| 1 | 01_project_setup | Scaffold, tooling, CI skeleton |
| 2 | 02_auth_and_onboarding | Sign up, log in, profile card |
| 3 | 03_groups_and_invites | Create, join, invite code, QR |
| 4 | 04_app_shell | Rail, sidebar, routes |
| 5 | 05_daily_question_engine | `tick()` with fallback questions only |
| 6 | 06_answers_and_reveal | Private answers, timed reveal |
| 7 | 07_threads | Realtime thread |
| 8 | 08_pip_ai | Mock provider first, then real |
| 9 | 09_ask_the_group | Member-asked questions |
| 10 | 10_members_and_ownership | Leave, remove, transfer |
| 11 | 11_profile_and_settings | Profile, settings, group settings |
| 12 | 12_notifications | In-app bell, rail dots |
| 13 | 13_demo_mode_and_simulation | Fake friends, scenarios, demo |
| 14 | 14_landing_page | Public page |
| 15 | 15_launch_and_writeup | Deploy, real users, README |

Weekly plan
- Week 0 (2 days): read docs, sketch four screens, start `docs/decisions.md`.
- Week 1: steps 1 to 4. Done when two accounts create and join a group and the isolation tests pass in CI.
- Week 2: steps 5 to 7 plus simulation scenarios S1 to S3. Done when a full round plays between two browsers.
- Week 3: steps 8 to 13 and deploy. Keep 2-3 buffer days. Done when a stranger can open the URL, click "Try the demo group", and understand it in 30 seconds.
- Week 4: step 14 and 15. Real users, usability fixes, README, demo video.

Cut order if behind: usability study shrinks to 2 people, custom Pip name, Funny and Curious presets, email notifications, Playwright beyond the happy path.
Never cut: security tests, the simulation, demo mode, deployment.
