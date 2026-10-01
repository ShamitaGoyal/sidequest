# 03 Data Model

Single source for tables, enums, functions, RLS rules, and migration order. All ids are `uuid` default `gen_random_uuid()`. All tables have `created_at timestamptz default now()`. RLS is enabled on every table. Migrations and policies are AUTHOR WRITES.

## Relationships
```
auth.users 1--1 profiles
groups 1--* group_members *--1 profiles
groups 1--1 pip_settings
groups 1--* questions 1--* answers *--1 profiles
questions 1--1 question_progress
questions 1--* messages
groups 1--* question_suggestions
profiles 1--* notifications
groups 1--* ai_usage
question_bank (standalone)
```

## Enums
- member_role: admin, member
- pip_preset: hype, chill, funny, curious
- question_source: ai, member, fallback
- message_kind: chat, pip_question, pip_reminder, pip_reveal, pip_nudge
- suggestion_status: queued, used, deleted
- notification_type: question_live, reveal

## Tables

profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid pk | = auth.users.id, cascade delete |
| display_name | text not null | 1 to 30 chars |
| avatar_color | text | one of 8 tokens |
| city | text | max 40 |
| into_text | text | max 60 |
| ask_me_text | text | max 60 |
| email_on_reveal | bool default true | |
| email_on_question_live | bool default false | |
| theme | text default 'system' | system, light, dark |
A trigger on `auth.users` insert creates the row with display_name from sign-up metadata.

groups
| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| name | text not null | 1 to 40 |
| invite_code | text unique not null | 6 chars from ABCDEFGHJKLMNPQRSTUVWXYZ23456789 |
| created_by | uuid FK profiles | original creator (history only; the admin is whoever has role admin) |
| timezone | text not null | validated against pg_timezone_names |
| post_time | time default '09:00' | not editable in v1 |
| reveal_time | time default '20:00' | not editable in v1 |
| is_demo | bool default false | |

group_members
| Column | Type | Notes |
|---|---|---|
| group_id | uuid FK | |
| user_id | uuid FK profiles | |
| role | member_role default member | |
| joined_at | timestamptz | |
| left_at | timestamptz null | null = active |
| removed_by | uuid null | set when an admin removes |
PK (group_id, user_id). Partial unique index: one active admin per group (`where role = 'admin' and left_at is null`). Index on (user_id) where left_at is null. Rejoining clears left_at through `join_group`.

pip_settings: group_id pk FK, name text default 'Pip' (1 to 20), preset pip_preset default 'chill', updated_by uuid, updated_at timestamptz.

questions
| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| group_id | uuid FK | |
| local_date | date not null | the group's local day |
| body | text not null | max 140 |
| source | question_source | |
| asked_by | uuid null | member who asked when source = member |
| post_at | timestamptz | 9:00 local as UTC |
| reveal_at | timestamptz | 20:00 local as UTC |
Unique (group_id, local_date). Index (group_id, local_date desc).

answers: id, question_id FK, user_id FK, body (1 to 500), updated_at. Unique (question_id, user_id). Index (question_id).

question_progress: question_id pk FK, answered_count int default 0, active_member_count int (snapshot at question creation). Maintained by triggers on answers insert and delete. This is how counts are visible before reveal without exposing answers.

messages: id, question_id FK, author_id uuid null (null for Pip), kind message_kind, body (1 to 1000). Partial unique index: one row per question where kind = 'pip_nudge'. Index (question_id, created_at).

question_suggestions: id, group_id FK, author_id FK, body (1 to 140), status default queued, used_on date null. Index (group_id, status, created_at).

notifications: id, user_id FK, group_id FK, question_id FK, type, read_at null. Index (user_id, read_at).

question_bank: id, body. Seed at least 60 fallback questions.

ai_usage: group_id, day date, calls int. PK (group_id, day). A global row per day uses a fixed reserved group id or a separate `ai_usage_global(day pk, calls)` table.

## Postgres functions
| Function | Purpose | Security |
|---|---|---|
| create_group(name, tz, pip_name, preset) | Transaction: group with new invite code, caller as admin, pip_settings | definer, authenticated |
| preview_group(code) | Name, member count, Pip name for a valid code | definer, authenticated |
| join_group(code) | Validate code, cap 8, insert or reactivate member | definer |
| leave_group(group_id) | Sets left_at. Admin may leave only if alone (group is deleted) or after transferring | definer |
| remove_member(group_id, user_id) | Admin only, not self; sets left_at, removed_by | definer |
| transfer_ownership(group_id, new_admin_id) | Admin only; target must be an active member; swaps roles in one transaction | definer |
| regenerate_invite_code(group_id) | Admin only | definer |
| delete_group(group_id) | Admin only; cascades | definer |
| is_active_member(group_id), is_group_admin(group_id) | Helpers for policies | stable, definer |
| tick(p_now timestamptz default now()) | Scheduler | definer, service only |
| join_demo(), demo_skip_to_reveal(qid), demo_reset() | Demo helpers | definer; check is_demo and anonymous |

## RLS rules (write each test first)
R1. groups, questions, messages, question_progress, pip_settings, question_suggestions: select only if `is_active_member(group_id)` (through the question's group for messages and progress).
R2. answers select: own row always; others' rows only if `now() >= questions.reveal_at` and reader is an active member. Uses the database clock, never a status flag.
R3. answers insert: active member, question belongs to their group, `now() < reveal_at`, user_id = auth.uid(). Update own only while `now() < reveal_at`. No delete.
R4. messages insert: kind = chat, author_id = auth.uid(), active member, `now() >= reveal_at`. All pip_* kinds and null authors: service role only.
R5. Admin-only: updating group name, pip_settings, admin functions (checked through `is_group_admin`).
R6. profiles: select own, and select for users who share or used to share a group (so old content shows names); update own only.
R7. Invite codes are never listable. Joining goes through functions; direct select on groups requires membership.
R8. question_suggestions: insert own (max 2 queued each), update own status to deleted, select by active members.
R9. notifications: select and update read_at on own rows only.
R10. question_bank, ai_usage: no client access.

## Migration order (`supabase/migrations`)
1. 0001_extensions_enums.sql (pg_cron, pg_net, enums)
2. 0002_profiles.sql (table, signup trigger)
3. 0003_groups_members.sql
4. 0004_pip_settings.sql
5. 0005_questions_answers.sql
6. 0006_messages.sql
7. 0007_suggestions.sql
8. 0008_progress_notifications.sql (tables, answer triggers)
9. 0009_ai_usage_question_bank.sql (tables, bank seed)
10. 0010_helpers.sql
11. 0011_rls_policies.sql
12. 0012_group_functions.sql (create, preview, join, leave, remove, transfer, regenerate, delete)
13. 0013_tick.sql (`tick` and cron schedule)
14. 0014_demo.sql
15. 0015_realtime.sql (add messages and question_progress to the realtime publication)
Migrations are forward-only. Never edit an applied migration; add a new one.
