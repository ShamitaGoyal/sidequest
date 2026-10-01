# sidequest

A private app for friends who live in different cities. Each day Pip, an AI friend, asks one question; everyone answers privately, the answers unlock together at 8:00 pm, and a thread opens so the group can talk.

## Local setup

Uses a hosted Supabase project. No Docker or local Supabase is needed.

1. Install Node.js 22.18 or newer and pnpm (version pinned in `package.json`):
   ```sh
   corepack enable pnpm
   ```
2. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard). Note its project ref (the part before `.supabase.co` in the project URL).
3. Copy the env template and fill it in from the dashboard (Project Settings, then API Keys). `.env.local` is gitignored; never commit it or share the keys.
   ```sh
   cp .env.example .env.local
   ```
   - `NEXT_PUBLIC_SUPABASE_URL`: the project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the anon key (called "publishable" in newer dashboards).
   - `SUPABASE_SERVICE_ROLE_KEY`: the service role key (called "secret" in newer dashboards). Used only by `scripts/` and Edge Functions, never in the browser.
4. Install dependencies:
   ```sh
   pnpm install
   ```
5. Link the Supabase CLI to your project (asks you to log in and for the database password):
   ```sh
   pnpm exec supabase link --project-ref <ref>
   ```
6. Start the app:
   ```sh
   pnpm dev
   ```
7. Open [http://localhost:3000/ui-kit](http://localhost:3000/ui-kit) and check that it says "Supabase is connected". Use `localhost`, not `127.0.0.1`: Next.js blocks its dev scripts on `127.0.0.1`, so the page won't respond to clicks.

## Commands

| Command | Does |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Route types plus `tsc --noEmit` |
| `pnpm test:unit` | Vitest with the 80% coverage gate on `lib/` |
| `pnpm build` | Production build |
| `pnpm test:db` | pgTAP against the linked project (`supabase test db --linked`). The CLI runs `pg_prove` in a Docker container even with `--linked`, so this runs in CI, not on a Docker-free laptop |
| `pnpm test:fn` | Deno tests for Edge Functions (not required yet) |
| `pnpm test:e2e` | Playwright (not required yet) |
| `pnpm db:types` | Regenerates `types/database.ts` from the linked project |

Database changes go only through hand-written files in `supabase/migrations`.
