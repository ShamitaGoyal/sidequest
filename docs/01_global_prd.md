# 01 Global PRD (source of truth)

Keep this high level. Screen details live in `features/`.

## Vision
Sidequest is a private app for friends who no longer live near each other. Each day an AI friend named Pip posts one question (or a question a member asked). Everyone answers privately. At a fixed time the answers unlock together, and a thread opens under that question so the group can talk. If a thread goes quiet, Pip sends one nudge.

Thesis: graduation removes the everyday moments that kept friendships going. Sidequest gives a group a small, regular reason to talk without anyone having to go first.
Principle: AI creates the spark, humans create the relationship.

## Who it is for
Friend groups of 4 to 8 people in different cities. Secondary audience: a recruiter opening the demo.

## Goals
- Deployed app; a stranger understands it in 30 seconds via demo mode.
- Privacy rules enforced in the database and proven with automated tests.
- One loop done well: question, private answers, timed reveal, thread, nudge.
- A fake-friends simulation that plays the whole product and runs in CI.
- 3 to 5 real friends use it for a week.

## Non-goals (put in README as "what I'd do next")
Global group chat, DMs, photos, memes, voice, typing indicators, read receipts, message editing, push notifications, guess-who and other games, group streaks, multiple admins, free-text Pip personalities, AI group memory, native apps, editable post and reveal times.

## Product rules (summary; details in feature docs)
- Times use the group timezone. Pip posts at 9:00 am, reminds once at about 4:30 pm (count only), reveal is at 8:00 pm.
- Reveal is fixed time only. No answers after reveal.
- Chat exists only inside per-question threads, and only after reveal.
- Pip does four things only: post the question, one reminder, a reveal message, one nudge per quiet thread. Pip always shows an AI tag and never claims to be human.
- One admin per group (the creator). The admin can transfer ownership. Leaving or removal keeps past content.
- Max 8 members per group.

## Tech stack
- Frontend: Next.js (App Router), TypeScript strict, Tailwind CSS.
- Backend: Supabase (Auth, Postgres with RLS, Realtime, Edge Functions, pg_cron, pg_net, Vault).
- LLM: any provider with reliable JSON output, called only from Edge Functions.
- Hosting: Vercel (frontend) and Supabase cloud.
- Tests: Vitest, Playwright, pgTAP (`supabase test db`), Deno test, a TypeScript simulation script.
- CI/CD: GitHub Actions.
- Package manager: pnpm only (version pinned in `package.json` `packageManager`). Never npm or yarn; no `package-lock.json` or `yarn.lock`. Use `pnpm <script>`, `pnpm exec` for installed tools (for example `pnpm exec supabase`), and `pnpm dlx` for one-off tools.

## Architecture
```
Browser (Next.js)
   |  supabase-js (anon key, user session, RLS applies)
   v
Supabase
   Auth ........ users, sessions
   Postgres .... tables + RLS + functions (join_group, tick, ...)
   Realtime .... messages, question_progress (RLS applies)
   pg_cron ..... runs tick() every 5 minutes
   pg_net ...... tick() calls Edge Functions
   Edge Fns .... generate-question, generate-nudge (service role)
                     |
                     v
                  LLM provider (API key in Supabase secrets)
```
Key idea: the browser never sees hidden answers, because the database refuses to return them. The frontend is not trusted.

## Environments
Hosted Supabase only for now; local Supabase with Docker may be added later. Development runs `pnpm dev` on the laptop against the hosted project (linked with `pnpm exec supabase link`); no Docker on the laptop. No staging. CI may start a throwaway local Supabase inside the GitHub runner for tests; only merges to `main` deploy. Schema changes go only through hand-written files in `supabase/migrations`, never the dashboard or scripts, and nothing is pushed to the hosted database without the author's explicit go-ahead.

## Repo structure
```
app/            routes (see feature docs for each route)
components/     ui/ shell/ feed/ thread/ groups/ members/
lib/            supabase/ queries/ realtime/ time.ts validation.ts presets.ts
types/          database.ts (generated)
supabase/       migrations/ functions/ tests/ fixtures/ config.toml
scripts/        seed-demo.ts simulate.ts reset-demo.ts
tests/          unit/ e2e/
docs/           these files, decisions.md, architecture.md
.github/workflows/  ci.yml deploy.yml
```

## Global rules (Cursor must follow)
Code
- TypeScript strict mode. No `any` without a comment explaining why.
- Functional components only. Small components; shared logic in `lib/`, not in pages.
- No third-party UI libraries. Use the components in `components/ui` and the tokens in `02_design_system.md`.
- Validate all inputs with zod schemas in `lib/validation.ts`, on the client and in server actions.
- Mutations go through server actions in `app/actions/` or Postgres functions. Reads go through `lib/queries/`.
- Generate DB types with `pnpm db:types` (`supabase gen types typescript --linked`) into `types/database.ts`; never hand-edit.

Security
- Never use the service role key in browser code. It exists only in scripts and Edge Functions.
- Never call the LLM from the browser.
- Never rely on frontend checks for privacy. Every privacy rule must exist as an RLS policy or Postgres function and have a pgTAP test.
- Secrets live in env vars or Supabase secrets, never in git.

AI
- Send the model the minimum data: first names, answer snippets, profile card text. Never emails or ids.
- User-written text is data inside delimiters, never instructions.

Testing
- Write the test before the security policy or database function. See `04_testing_strategy.md`.
- Every feature doc lists tests; a feature is not done until they exist and pass in CI.

Process
- Do not add anything listed under Non-goals without asking.
- Do not write anything marked AUTHOR WRITES.
- Small commits; commit messages include test IDs when relevant.

## Decisions log
- Name: Sidequest.
- Fixed-time reveal; about 11-hour window.
- Threads per question, no global chat.
- Four Pip presets: Hype, Chill, Funny, Curious. Default Chill.
- Member-asked questions are in MVP. Group streak is removed.
- Single admin with ownership transfer.
- Single environment: hosted Supabase only for now, no staging (local Supabase with Docker may come later).
- Package manager: pnpm.
- Guess-who game is out of v1.

## Risks
| Risk | Mitigation |
|---|---|
| Realtime threads take longer than planned | Text-only, flat, no extras |
| Scheduler is unfamiliar | Build `tick(p_now)` in SQL first; test with a short interval locally |
| Hidden answers leak through realtime or RPC | Tests cover direct select, RPC, and realtime |
| Empty app looks dead | Seeded demo plus "Skip to 8 pm" |
| LLM cost, failure, injection | Caps, timeouts, fallback, delimiters, validation, mock mode |
| Nudge feels like pressure | Count-only reminders, one nudge max, test wording with friends |
| Answers sent to an AI provider | Minimum data, notice in settings and README |
| Production is the only environment | Tests gate every deploy; forward-only migrations; careful manual checks before pushing migrations |

## Open questions
1. Is the 4:30 pm reminder useful or noise? Decide after testing with friends.
