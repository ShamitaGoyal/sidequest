# Feature 10: Members and ownership

Depends on: 03, 04. Database: migration 0012 functions (`leave_group`, `remove_member`, `transfer_ownership`, `delete_group`). AUTHOR WRITES the functions and their pgTAP tests first. Cursor builds UI.

## Scope
Members list, leave, remove, transfer ownership, delete group. One admin per group at all times (partial unique index).

## Rules
- Leaving or removal sets `left_at`; past answers and messages stay and keep the person's name.
- A departed or removed member cannot read anything new.
- Only the admin can remove members, transfer ownership, regenerate the code, and delete the group. The admin cannot remove themself.
- Transfer: admin picks an active member; in one transaction the old admin becomes `member` and the target becomes `admin`.
- If the admin wants to leave: allowed after transferring ownership. If the admin is the only active member, "Leave" deletes the group after a confirm dialog.
- A removed person can rejoin with the current invite code (`join_group` clears `left_at`).

## Screen (`app/(app)/g/[groupId]/members/page.tsx`, `components/members/MemberRow.tsx`, `RemoveMemberDialog.tsx`, `TransferOwnershipDialog.tsx`)
List: Pip first (AI tag and current preset), then members (avatar, name, city, "into" line, Admin tag).
| Click | Flow |
|---|---|
| Remove (admin only, other members) | Dialog "Remove Sam? Their past answers and messages stay." Confirm calls `remove_member`; Sam loses access immediately. |
| Make owner (admin only, other members) | Dialog "Make Sam the owner? You'll become a regular member." Confirm calls `transfer_ownership`; the page reloads with new roles. |
| Leave group (everyone, bottom of page) | Regular member: dialog "Leave the college crew? Your past answers stay." Confirm calls `leave_group`, then go to `/home` or the next group. Admin with others present: dialog explains "Make someone else the owner first" with a button that opens the transfer dialog. Admin alone: dialog "You're the only one here. Leaving deletes the group." |
| Delete group (admin, group settings) | Dialog: type the group name to confirm. Calls `delete_group`, go to `/home`. |

## Files
`app/(app)/g/[groupId]/members/page.tsx`, `components/members/*`, `app/actions/groups.ts` (leave, remove, transfer, delete), `lib/queries/members.ts`, migration 0012, `supabase/tests/05_join_leave_remove.sql` (part 2) and `09_ownership.sql`.

## Acceptance criteria
- [ ] Only the admin sees Remove, Make owner, and Delete; the database enforces it.
- [ ] After transfer the old admin loses admin powers immediately and the group always has exactly one admin.
- [ ] Former members keep their names on old answers and messages.
- [ ] Former members cannot read new content or subscribe to realtime.
- [ ] Admin cannot leave while others remain without transferring.
- [ ] Every destructive dialog names the person or group affected.

## Tests
pgTAP `05_join_leave_remove.sql` (part 2)
- T-MEM-04 After `leave_group`, the user cannot read new messages or questions.
- T-MEM-05 After leaving, the user's past answers are still visible to the group with their name.
- T-MEM-06 After `remove_member`, same as T-MEM-04 and `removed_by` is set.
pgTAP `04_admin_rules.sql`
- T-ADM-02 Non-admin cannot call `remove_member`, `regenerate_invite_code`, `delete_group`, or `transfer_ownership`.
- T-ADM-03 Admin can call them.
pgTAP `09_ownership.sql`
- T-OWN-01 Transfer swaps roles and leaves exactly one admin.
- T-OWN-02 Transfer to a non-member or a departed member fails.
- T-OWN-03 Old admin cannot perform admin actions after transfer.
- T-OWN-04 Admin cannot leave while others remain; can leave after transfer.
- T-OWN-05 Admin who is the only member leaving deletes the group.
- T-OWN-06 Removed member can rejoin with the current code and gets `left_at` cleared.
Simulation S5: Jay leaves, Alex is removed by Maya, Maya transfers ownership to Sarah and leaves; checks all of the above.
