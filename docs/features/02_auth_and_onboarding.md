# Feature 02: Auth and onboarding

Depends on: 01. Database: migrations 0001 and 0002 (AUTHOR WRITES the migration and its trigger; Cursor builds the UI).

## Scope
Sign up, log in, password reset, log out, and the optional profile card step.

## Screens and flows

Sign up (`app/(auth)/signup/page.tsx`, action `app/actions/auth.ts: signUp`)
Fields: display name, email, password (8+). Errors appear under each field.
| Click | Flow |
|---|---|
| Create account | Button shows loading. Action calls `supabase.auth.signUp` with display name in metadata. A trigger creates the `profiles` row. Success: redirect to `/onboarding`. Email already used: "That email already has an account. Log in instead." |
| Log in link | Go to `/login`. |

Log in (`app/(auth)/login/page.tsx`, action `signIn`)
| Click | Flow |
|---|---|
| Log in | Success: if a `pending_join` cookie exists, run the join flow (feature 03); else go to the last group (cookie `last_group`) or `/home`. Failure: "Email or password is wrong." |
| Forgot password | Go to `/forgot-password`. |

Forgot password (`app/(auth)/forgot-password/page.tsx`): email field, "Send reset link". Shows the same confirmation whether or not the account exists. Reset page (`app/(auth)/reset-password/page.tsx`): new password, "Save password", then `/login`.

Onboarding (`app/onboarding/page.tsx`, action `app/actions/profile.ts: saveProfileCard`)
Title "Tell your friends a little." Fields, all optional: avatar color (8 swatches), city, "Something I'm into right now" (60), "Ask me about" (60).
| Click | Flow |
|---|---|
| Continue | Save to `profiles`, then pending join or `/home`. |
| Skip for now | Same without saving. |

Log out: rail avatar menu (feature 04) calls `signOut`, clears cookies, redirects to `/`.

## Files
`app/(auth)/*`, `app/onboarding/page.tsx`, `app/actions/auth.ts`, `app/actions/profile.ts`, `lib/validation.ts` (schemas), `supabase/migrations/0002_profiles.sql`.

## Acceptance criteria
- [ ] Sign up creates a profile row with the display name.
- [ ] Duplicate email shows the exact error text above.
- [ ] Wrong password shows the exact error text above without saying which field was wrong.
- [ ] Password reset flow works end to end locally (use Supabase's local inbox).
- [ ] Onboarding fields enforce their length limits and can be skipped.
- [ ] A `pending_join` cookie set before sign up survives sign up and onboarding.
- [ ] Logged-in users visiting `/login` are redirected away.

## Tests
- T-UNIT-02: zod schemas for sign up and profile card.
- T-E2E-01 (first half): sign up, onboarding, land on `/home`.
- T-E2E-06: logged-out user opening a private route is redirected to login.
- T-CON-01 (profile fields): length limits at the database level.
