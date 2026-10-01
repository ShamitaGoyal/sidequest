# Feature 04: App shell and navigation

Depends on: 02, 03. Owner: Cursor (UI). Uses mock data for unread dots until feature 12.

## Scope
The private app layout: group rail, group sidebar, mobile drawer and tabs, route structure, and the "not a member" and empty states.

## Layout (desktop)
```
+------+-------------------+-----------------------------------+
| rail | group sidebar     | main pane                         |
| [G1] | The college crew  | feed of day cards (feature 06)    |
| [G2] | Today             | or thread / members / settings    |
| [+]  | Past questions    |                                   |
| [me] | Ask the group     |                                   |
|      | Members (6 + Pip) |                                   |
|      | Invite            |                                   |
|      | Group settings    |                                   |
+------+-------------------+-----------------------------------+
```
Sizes and breakpoints are in `02_design_system.md`.

## Components and behavior
- `components/shell/GroupRail.tsx`: one sticker avatar per group (group initials on a colored square), "+" button, user avatar at the bottom. The active group has a thick outline.
- `components/shell/GroupSidebar.tsx`: group name, member count with "+ Pip", links to Today, Past questions, Ask the group, Members, Invite, Group settings. Active link is highlighted.
- `components/shell/MobileDrawer.tsx`: opened by a menu button in the top bar; holds rail plus sidebar. Bottom tabs on mobile: Today, Past, Ask, Members.
- `components/shell/NotificationBell.tsx`: placeholder in this feature, wired in feature 12.

## Flows
| Click | Result |
|---|---|
| A group in the rail | Go to `/g/[groupId]` and set the `last_group` cookie. |
| "+" in the rail | Open a small menu: "Create a group" (`/groups/new`), "Join with a code" (`/groups/join`). |
| User avatar | Menu: Profile (`/profile`), Settings (`/settings`), Log out. |
| Sidebar link | Navigate to the matching route inside the group. |
| Menu button (mobile) | Open the drawer; tapping a link closes it. |

## Routes created (pages may be placeholders until their feature)
`app/(app)/layout.tsx`, `app/(app)/g/[groupId]/layout.tsx`, pages for `/g/[groupId]`, `/q/[questionId]`, `/past`, `/ask`, `/members`, `/invite`, `/settings`, plus `/profile` and `/settings`.

## Data
`lib/queries/groups.ts: listMyGroups()` returns groups where the user is an active member. The group layout loads the group and member count; if the user is not an active member it renders a "You're not in this group" page with a link home (no data from the group is fetched).

## Acceptance criteria
- [ ] Rail lists every group the user is in; the active one is visually clear.
- [ ] Sidebar links route correctly and show an active state.
- [ ] Mobile layout uses the drawer and bottom tabs; nothing overflows horizontally at 360px wide.
- [ ] Opening `/g/[id]` for a group you are not in shows the not-a-member page and no group data.
- [ ] Users with no groups land on `/home` (feature 03).
- [ ] Keyboard: every link and button is reachable with visible focus.

## Tests
- T-UNIT-04 (part): component tests for GroupRail (active state) and GroupSidebar links.
- T-E2E-08: logged-in user with two groups switches groups from the rail; `last_group` is remembered after reload.
- T-RLS-01 (UI side): not-a-member page shows no group name.
