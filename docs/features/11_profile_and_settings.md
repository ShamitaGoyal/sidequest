# Feature 11: Profile and settings

Depends on: 02, 04, and feature 08 for the Pip settings block. Owner: Cursor.

## Scope
Profile page, account settings, and the group settings page.

## Screens

Profile (`app/(app)/profile/page.tsx`, action `profile.ts: updateProfile`)
Avatar color, display name, email (read-only), city, "Something I'm into right now", "Ask me about", list of my groups. "Save changes" updates `profiles` and shows a toast "Saved".

Account settings (`app/(app)/settings/page.tsx`)
- Password: change password form.
- Notifications: toggles for "Email me when answers are revealed" (default on) and "Email me when a new question is live" (default off). In-app notifications are always on. (Email delivery is a stretch; the toggles save regardless.)
- Appearance: light, dark, system. Saves to `profiles.theme` and sets `data-theme` immediately.
- Delete account: dialog, type DELETE to confirm. If the user is an admin of a group with other members: blocked with "Make someone else the owner in each group first." Otherwise removes the profile (past content stays in groups shown as "Former member") and logs out.

Group settings (`app/(app)/g/[groupId]/settings/page.tsx`)
| Who | What |
|---|---|
| Everyone | Group name, timezone (read-only), Pip name and preset (read-only for non-admins), "Leave group" (link to members page flow) |
| Admin only | Rename group, regenerate invite code (feature 03), change Pip name and preset (feature 08), delete group (feature 10) |

## Flows
| Click | Flow |
|---|---|
| Save changes (profile) | Validate, update, toast. |
| Theme option | Update immediately, save in the background. |
| Change password | Validate 8+ chars, call Supabase update, toast. |
| Delete account | Confirm dialog with the typed word; checks admin rule; deletes profile; redirects to `/`. |
| Rename group (admin) | Updates `groups.name`; RLS rejects non-admins. |

## Files
`app/(app)/profile/page.tsx`, `app/(app)/settings/page.tsx`, `app/(app)/g/[groupId]/settings/page.tsx`, `app/actions/profile.ts`, `app/actions/groups.ts` (rename), `lib/validation.ts`.

## Acceptance criteria
- [ ] Profile edits persist and show on the Members page.
- [ ] Theme choice persists across reloads and devices.
- [ ] Non-admins cannot edit group settings (hidden in UI, rejected by the database).
- [ ] Deleting an account never deletes group content; names become "Former member".
- [ ] An admin with other members cannot delete their account.

## Tests
- T-CON-01 (part): length limits on profile fields and group name at the database level.
- T-ADM-01: non-admin cannot update group or Pip settings.
- T-E2E-07: admin changes the Pip preset; a non-admin sees read-only controls.
- T-UNIT-02 (part): profile and settings schemas.
