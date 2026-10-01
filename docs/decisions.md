# Decisions

One heading per decision. Newest at the bottom. Product decisions come from `01_global_prd.md`.

## Name: Sidequest
The app is called Sidequest. The wordmark is lowercase "sidequest".

## Fixed-time reveal with an about 11-hour window
Pip posts at 9:00 am group time and answers unlock at 8:00 pm. There is no "reveal when everyone answers" mode, and no answers after reveal. Visibility is decided by `now() >= reveal_at` in the database, never by a status flag.

## Threads per question, no global chat
Chat exists only inside a thread under each question, and only after reveal.

## Four Pip presets, default Chill
Hype, Chill, Funny, Curious. No free-text personalities.

## Member-asked questions are in the MVP; group streak is removed
Members can queue questions for the group. Streaks were cut because they create pressure.

## Single admin with ownership transfer
One admin per group (the creator). The admin can hand ownership to another active member.

## Single environment: hosted Supabase only for now
No staging and no Docker on the laptop. Development uses the hosted project through `pnpm exec supabase link`. CI may run a throwaway local Supabase inside the GitHub runner. Only merges to `main` deploy. Local Supabase with Docker may be added later.

## Package manager: pnpm
pnpm only, pinned through `packageManager` in `package.json`. No `package-lock.json` or `yarn.lock`. pnpm blocks dependency install scripts by default: `pnpm.onlyBuiltDependencies` allows `supabase` (its install script downloads the CLI binary), and `pnpm.ignoredBuiltDependencies` silences `unrs-resolver` (its script is only a fallback when the prebuilt native binary is missing).

## `test:db` uses `--linked`, which still needs Docker
`pnpm test:db` runs `supabase test db --linked` (flag confirmed in Supabase CLI 2.119.0). The CLI docs say it runs `pg_prove` in a container even for a linked project, so it can't run on the Docker-free laptop. Open question: run pgTAP only in CI (`supabase test db --local` in the runner), or run `pg_prove` without Docker against the hosted database.

## Schema changes only through migration files
Tables, policies, and functions change only through hand-written files in `supabase/migrations`. Never through the dashboard or a script. Nothing is pushed to the hosted database (`supabase db push` and similar) without the author's explicit go-ahead.

## Guess-who game is out of v1
Listed under non-goals.

## Next.js 16 `proxy.ts` instead of `middleware.ts`
Feature 01 asks for a root `middleware.ts`. Next.js 16 deprecated that name and renamed it to `proxy.ts` (same behavior, Node runtime). The route protection lives in `proxy.ts`; the Supabase session helper keeps the name `lib/supabase/middleware.ts`.

## Tailwind v4 with a `tailwind.config.ts`
`create-next-app` installs Tailwind v4, which is configured in CSS. To keep the `tailwind.config.ts` the design system asks for, `app/globals.css` loads it with `@config`. Tokens are CSS variables in `globals.css`; the config only maps them to class names, so themes swap without `dark:` classes.

## Dark mode via CSS variables
Dark applies with `[data-theme="dark"]`, or with `prefers-color-scheme: dark` unless `[data-theme="light"]` is set. Any element can set `data-theme`, which is how `/ui-kit` shows both themes side by side.

## Native `<dialog>` for the Dialog component
`showModal()` gives a real modal: the rest of the page is inert (focus is trapped) and the backdrop comes free. Escape is handled explicitly because Chrome can skip the `cancel` event.

## Route protection: everything is private unless listed
`lib/routes.ts` lists public routes (`/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/demo`, `/join/*`, `/auth/*`, `/ui-kit`). Everything else redirects logged-out visitors to `/login?next=...`. Logged-in visitors on `/login` or `/signup` go to `/home`. This is a convenience only; privacy is enforced by RLS.

## Service role key stays out of browser code
`lib/supabase/admin.ts` is the only place that reads `SUPABASE_SERVICE_ROLE_KEY`. ESLint blocks importing it from `app/` and `components/`, and test T-SETUP-02 fails if either folder mentions the key.

## Coverage gate excludes the Supabase client wrappers
The 80% coverage gate covers `lib/`, except `lib/supabase/{client,server,middleware,admin}.ts`. Those are thin wrappers around `@supabase/ssr` and `next/headers` and are exercised against a real Supabase database by later tests (pgTAP, simulation, Playwright).

## RLS rule to test ID map
Every RLS rule in `03_data_model.md` must map to at least one test ID. Fill this in as the pgTAP tests are written.

| Rule | Test IDs |
|---|---|
| R1 member-only select | not written yet |
| R2 answers select and reveal | not written yet |
| R3 answers insert and update | not written yet |
| R4 messages insert | not written yet |
| R5 admin-only changes | not written yet |
| R6 profiles visibility | not written yet |
| R7 invite codes not listable | not written yet |
| R8 question suggestions | not written yet |
| R9 notifications | not written yet |
| R10 no client access to bank and usage | not written yet |
