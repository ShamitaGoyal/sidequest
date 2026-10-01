# Feature 03: Groups and invites

Depends on: 02. Database: migrations 0003, 0004, 0010, part of 0011 (groups and member policies), and 0012 (`create_group`, `preview_group`, `join_group`, `regenerate_invite_code`). AUTHOR WRITES the policies and functions and their tests first. Cursor builds the UI and server actions.

## Scope
Create a group, see its invite code, join by code or link, regenerate the code. Includes `PresetPicker` (used again in feature 08 and 11).

## Screens and flows

Home with no groups (`app/(app)/home/page.tsx`): two large cards, "Create a group" and "Join with a code", plus "Try the demo".

Create group (`app/(app)/groups/new/page.tsx`, `components/groups/CreateGroupForm.tsx`, `PresetPicker.tsx`, action `app/actions/groups.ts: createGroup`)
Fields: group name (max 40), timezone (select, defaults to browser timezone), Pip name (default "Pip", max 20), preset (four cards with an example line each; Chill preselected).
| Click | Flow |
|---|---|
| Preset card | Selects it and shows its example line. |
| Create group | Calls `create_group(name, tz, pip_name, preset)` (one transaction: group, unique invite code, caller as admin, pip_settings). Redirect to `/g/[groupId]/invite`. Errors: empty name, invalid timezone. |

Invite (`app/(app)/g/[groupId]/invite/page.tsx`, `components/groups/InviteCard.tsx`)
Shows the 6-character code large, the link `/join/CODE`, and a QR code of the link (`qrcode` package, client-side).
| Click | Flow |
|---|---|
| Copy code, Copy link | Clipboard write, toast "Copied". |
| Regenerate code (admin only) | Dialog "The old code will stop working." Confirm calls `regenerate_invite_code(group_id)`; the page shows the new code. |
| Done | Go to `/g/[groupId]`. |

Join (`app/(app)/groups/join/page.tsx`, `app/join/[code]/page.tsx`, `components/groups/JoinCodeForm.tsx`, actions `previewGroup`, `joinGroup`)
Input: 6 characters, uppercase, alphabet without 0, O, 1, I.
| Click | Flow |
|---|---|
| Continue | Calls `preview_group(code)`. Shows "The college crew, 5 friends. Join?" Invalid: "That code didn't work. Check it and try again." |
| Join | Calls `join_group(code)`: checks code, cap of 8, duplicates; adds member. Redirect to `/g/[groupId]`. Full: "This group is full." Already a member: go straight to the group. |
| Open `/join/CODE` logged out | Store code in the `pending_join` cookie, redirect to `/signup` (link to log in). After auth and onboarding the join runs automatically. |

## Files
`app/(app)/home/page.tsx`, `app/(app)/groups/new/page.tsx`, `app/(app)/groups/join/page.tsx`, `app/join/[code]/page.tsx`, `app/(app)/g/[groupId]/invite/page.tsx`, `components/groups/*`, `app/actions/groups.ts`, `lib/queries/groups.ts`, `lib/validation.ts`, `lib/invite.ts` (code format helper), migrations and tests listed above.

## Acceptance criteria
- [ ] Creating a group makes the creator the only admin and creates `pip_settings`.
- [ ] Invite codes are 6 characters from the allowed alphabet and unique.
- [ ] Invalid and valid codes behave as above; the error never reveals whether a code ever existed.
- [ ] The 9th person cannot join.
- [ ] Regenerating the code makes the old one fail.
- [ ] A non-member cannot select the `groups` table to discover codes.
- [ ] The QR code scans to the invite link.
- [ ] Logged-out invite link flow returns the user into the group after sign up.

## Tests
pgTAP `01_groups_isolation.sql`
- T-RLS-01 User A cannot select group B, its members, questions, messages, or pip_settings.
- T-RLS-02 Outsider cannot insert answers or messages in group B.
- T-RLS-03 Outsider cannot read `question_progress` of group B.
- T-RLS-04 Invite code cannot be found by selecting `groups` as a non-member.

pgTAP `05_join_leave_remove.sql` (part 1)
- T-MEM-01 `join_group` with a valid code adds the member; an invalid code fails without revealing more.
- T-MEM-02 The 9th member is rejected.
- T-MEM-03 Joining twice does nothing.
- T-MEM-07 A regenerated code invalidates the old one.

pgTAP `08_constraints.sql` (part 1)
- T-CON-02 Invalid timezone rejected on group creation.
- T-CON-03 Invite code format (6 chars, allowed alphabet).

Unit and e2e
- T-UNIT-03 Invite code generator uses only the allowed alphabet and is 6 characters.
- T-E2E-01 Sign up, create group, see the invite code.
- T-E2E-02 A second browser context joins via `/join/CODE`.
