# 05 CI/CD

Goal: learn a real pipeline without making it complex. One hosted Supabase environment; no Docker on the laptop. The package manager is pnpm (version from `packageManager` in `package.json`).

## Flow
```
feature branch -> pull request -> CI (all tests) -> merge to main -> deploy (migrations, functions, app) -> smoke test
```
- Pull requests run tests only. No preview deployments (they would point at production data).
- Only pushes to `main` deploy, and only after CI is green.

## Branching and protection
- `main` is always deployable. Work on feature branches named `feat/<feature-number>-<name>`.
- Branch protection on `main`: require pull request, require the CI check to pass, no direct pushes.
- Enable secret scanning. `.env*` is in `.gitignore`.

## `.github/workflows/ci.yml` (pull requests and pushes to main)
1. Checkout, then `pnpm/action-setup` (before `actions/setup-node`; it reads the pnpm version from `packageManager`), then `actions/setup-node` with `cache: pnpm`, then `pnpm install --frozen-lockfile`.
2. `pnpm lint` and `pnpm typecheck`.
3. `pnpm test:unit` (coverage gate 80% on `lib/`).
4. Start a throwaway local Supabase inside the GitHub runner: `pnpm exec supabase start`, `pnpm exec supabase db reset` (applies every migration from scratch; proves migrations work on an empty database). This never touches the hosted project or the laptop.
5. `pnpm exec supabase test db --local` (the `pnpm test:db` script uses `--linked`, which is for the laptop).
6. `pnpm test:fn` with `LLM_PROVIDER=mock`.
7. `pnpm seed:demo`, then `pnpm simulate`.
8. `pnpm exec playwright install --with-deps chromium`, then `pnpm test:e2e`.
9. `pnpm build`.
10. On failure, upload Playwright traces and the simulation report as artifacts.

Nightly (scheduled workflow, same file or `nightly.yml`): the full Playwright suite.

## `.github/workflows/deploy.yml` (push to main, after CI passes)
Starts with the same pnpm setup steps as CI.
1. Deploy the app to Vercel production (Git integration gated on the CI check, or `vercel deploy --prod` with a token).
2. `pnpm exec supabase link --project-ref $SUPABASE_PROJECT_REF`, then `pnpm exec supabase db push` (applies new migrations to production). Only after the author approves the migration in review; never run by hand without asking.
3. `pnpm exec supabase functions deploy generate-question generate-nudge`.
4. `pnpm smoke`: loads the production landing page and starts a demo session.
5. If the smoke test fails the workflow fails loudly.

Order matters: migrations before the app when a change adds columns the app needs; keep changes backward compatible so either order works.

## Secrets
GitHub secrets and Vercel env vars:
`SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `VERCEL_TOKEN` (if using the CLI).
Supabase secrets (set with `pnpm exec supabase secrets set`): `LLM_API_KEY`, `LLM_PROVIDER`.
`SUPABASE_SERVICE_ROLE_KEY` exists only for scripts and Edge Functions, never in browser env vars.
Local `.env.local` is gitignored; commit `.env.example` with placeholder names.

## Rollback
Migrations are forward-only. If a deploy breaks production, revert the commit and ship a corrective migration. Because production is the only environment:
- Read every migration diff before merging.
- Keep migrations small and backward compatible.
- Take a database backup (Supabase dashboard) before the first production migration and before any destructive migration.

## What you learn
Automated test gates, running migrations in a pipeline, secrets handling, smoke tests, protected branches, forward-only rollback.

## First-time setup checklist
- [ ] GitHub repo created, `main` protected.
- [ ] Supabase hosted project created; `pnpm exec supabase link --project-ref <ref>` works on the laptop.
- [ ] Vercel project connected to the repo.
- [ ] Secrets added to GitHub, Vercel, and Supabase.
- [ ] `ci.yml` green on an empty app.
- [ ] `deploy.yml` deploys a hello-world and the smoke test passes.
