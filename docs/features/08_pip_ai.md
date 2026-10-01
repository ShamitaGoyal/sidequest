# Feature 08: Pip, the AI friend

Depends on: 05, 06, 07. Database: `ai_usage` tables (0009), nudge step inside `tick()` (0013). Edge Functions are built by Cursor (mock provider first). `tick()` changes are AUTHOR WRITES.

## Scope
Pip's identity and presets, the two Edge Functions (question and nudge), safeguards, and the admin Pip settings UI.

## Identity
- Pip is a named member of every group: listed first in Members ("6 friends + Pip"), messages use `PipBubble` with a fixed AI tag.
- Default name "Pip"; the admin can rename it (max 20). The AI tag and the no-pretending rule cannot be edited.

Pip does only these: post the question (or the member-asked one, attributed), one count-only reminder, one reveal message, at most one nudge per quiet thread.
Pip never: joins member back-and-forth, claims to be human or to have feelings ("I missed you"), teases or pressures anyone, names who has not answered. It may use a first name only to invite a story.

## Presets (admin picks; default Chill). Tone and style only.
| Preset | Style | Example |
|---|---|---|
| Hype | Loud, encouraging | "Okay WAIT, Alex is learning guitar?! What's the first song you're trying to learn?" |
| Chill | Low-key, short | "Quiet in here. No rush, but Alex, what's the first song you learned?" |
| Funny | Dry, teases the situation never the person | "Alex has a guitar now and the neighbors have opinions. What was the first song?" |
| Curious | Thoughtful "why", likes stories | "Alex, what made you pick up guitar now?" |
Safety rules live in a fixed system prompt that presets cannot change.

## Edge Functions
`supabase/functions/generate-question/index.ts`
- Input: preset, Pip name, last 7 question texts, up to 10 recent answer snippets with first names only, profile card fields of active members.
- Output JSON: `{ "question": string (max 140), "reason": string (max 100) }`. Validate, retry once, then fall back to `question_bank`.

`supabase/functions/generate-nudge/index.ts`
- Input: preset, the question, last 10 thread messages (first names), profile card fields.
- Output: one message, max 200 chars, ending with a question or invitation. Validate, retry once, then use a generic nudge per preset.

Shared code in `supabase/functions/_shared/`: `llm.ts` (provider call plus mock), `prompt.ts` (builds prompts; user text goes inside delimiters as data), `presets.ts`, `validate.ts`, `cap.ts` (usage caps), `fallback.ts`.
- `LLM_PROVIDER=mock` returns deterministic output; `real` calls the provider. Tests and the simulation always use mock.
- Safeguards: per-group daily cap and a global daily cap (from `ai_usage`), 10-second timeout, length caps on every input.

## Nudge rule inside `tick()`
Request a nudge for a question when all are true: `now >= reveal_at + 6 hours`, fewer than 3 human messages (`kind = chat`), no `pip_nudge` exists, group local time between 8 am and 10 pm. The partial unique index guarantees max one even if `tick()` runs twice. `tick()` calls the function through pg_net with the service key from Vault and inserts the result as a `pip_nudge` message with a null author.

## Pip settings UI (group settings page, feature 11 lays out the page)
`components/groups/PresetPicker.tsx` (from feature 03) plus a name field. Shows "Last changed by Maya on Oct 2". Non-admins see it read-only. Action `app/actions/pip.ts: updatePip`. Notice under the section: "Pip uses recent answers and profile cards to write questions. They are sent to an AI provider."

## Acceptance criteria
- [ ] With the mock provider, `tick()` creates AI questions and nudges end to end.
- [ ] Invalid model output falls back without crashing; the day always has a question.
- [ ] Caps stop calls and fall back.
- [ ] Prompts contain only first names and profile text, never emails or ids.
- [ ] All four presets produce different style instructions; safety rules are identical in all four.
- [ ] Only the admin can change Pip's name and preset.
- [ ] No API key in client code or git.

## Tests
Deno (`supabase/functions/_shared/*.test.ts`)
- T-AI-01 Valid JSON passes validation.
- T-AI-02 Malformed JSON retries once, then falls back to the bank.
- T-AI-03 Question over 140 chars is rejected and retried.
- T-AI-04 Daily per-group and global caps stop calls and use the fallback.
- T-AI-05 Injection strings in answers, profile cards, and Pip names do not appear as instructions in the built prompt; output validation still holds.
- T-AI-06 Each preset builds a different style block; safety rules identical across all four.
- T-AI-07 Nudge over 200 chars or without a question or invitation is rejected.
- T-AI-08 Inputs to the model contain first names only, no emails or ids.
pgTAP
- T-TICK-07 A thread with 3+ human messages gets no nudge; 2 messages, 6+ hours after reveal, between 8 am and 10 pm local, gets exactly one request; outside those hours none.
- T-ADM-01 Non-admin cannot update `pip_settings`.
Simulation: S3 (quiet thread) and S10 (AI failure).
