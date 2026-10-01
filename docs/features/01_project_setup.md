# Feature 01: Project setup

Depends on: nothing. Owner: Cursor builds all of it.

## Scope
Create the repo skeleton, tooling, design tokens, Supabase clients, route protection, and a CI skeleton so every later feature plugs into something working. Uses the hosted Supabase project only; no Docker or local Supabase on the laptop. Package manager is pnpm.

## Steps
1. `pnpm create next-app` with TypeScript, Tailwind, App Router, ESLint. Enable `strict` in `tsconfig.json`. Add `"packageManager": "pnpm@<version>"` to `package.json`.
2. Create the folders listed in `01_global_prd.md` (empty files with a one-line comment are fine).
3. Add design tokens from `02_design_system.md` to `app/globals.css` and `tailwind.config.ts`; load fonts in `app/layout.tsx` with `next/font/google`.
4. Build `components/ui`: Button, Input, Textarea, Card, Badge, Avatar, Dialog, Toast, Skeleton (specs in the design system). Add a hidden `/ui-kit` route (dev only) that shows every component and state.
5. Supabase: `pnpm add -D supabase` (allow its build script in `pnpm.onlyBuiltDependencies`), `pnpm exec supabase init`, `pnpm exec supabase link --project-ref <ref>`; `lib/supabase/client.ts` (browser), `server.ts` (server components and actions), `admin.ts` (service role, scripts only), `middleware.ts` helper for session refresh.
6. Root `proxy.ts` (Next.js 16's name for `middleware.ts`): redirect logged-out users from private routes to `/login`; redirect logged-in users away from `/login` and `/signup`.
7. `lib/validation.ts` (zod) and `lib/time.ts` stubs with their unit tests.
8. Tooling: Vitest, Testing Library, Playwright config, Deno test task, scripts in package.json (commands in `04_testing_strategy.md`), `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (names only).
9. CI skeleton `.github/workflows/ci.yml` with pnpm (`pnpm/action-setup`, `cache: pnpm`, `pnpm install --frozen-lockfile`): lint, typecheck, unit tests, build. Later features add steps (see `05_ci_cd.md`).
10. Write `docs/decisions.md` with a heading per decision so far.

## Files
`app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`, `proxy.ts`, `components/ui/*`, `lib/supabase/*`, `lib/validation.ts`, `lib/time.ts`, `.env.example`, `.github/workflows/ci.yml`, `docs/decisions.md`, `package.json`, `pnpm-lock.yaml`.

## Acceptance criteria
- [ ] `pnpm dev` shows a placeholder landing page using the brand fonts and colors.
- [ ] `/ui-kit` shows every UI component in light and dark mode.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm build` pass locally and in CI.
- [ ] With `.env.local` filled in, `/ui-kit` says "Supabase is connected" (a harmless anon-key read against the hosted project). Without it, the page shows a setup message instead of crashing.
- [ ] Visiting a private route while logged out redirects to `/login`.
- [ ] No service role key appears in any file under `app/` or `components/`, or in any `NEXT_PUBLIC_` variable.

## Tests
- T-UNIT-00: a trivial test proves Vitest runs in CI.
- T-UNIT-02 (start): zod schema tests for display name, group name, answer length, message length, invite code format.
