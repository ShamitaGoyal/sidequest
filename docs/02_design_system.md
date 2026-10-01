# 02 Design System

Direction: playful and sturdy, like stickers. Thick outlines, hard offset shadows, friendly colors. Not a Discord clone: the main pane is a feed of day cards, not a chat stream.

## Tokens (put in `app/globals.css` as CSS variables and map in `tailwind.config.ts`)

Light
| Token | Value | Use |
|---|---|---|
| --paper | #F4F2FF | page background |
| --card | #FFFFFF | cards, panels |
| --ink | #1B1740 | text, borders, shadows |
| --soft | #5A5680 | secondary text |
| --yellow | #FFC93C | primary actions, Pip |
| --pink | #FF7AB6 | accent |
| --mint | #5EE0B0 | success |
| --lilac | #8B7CFF | focus, question cards |
| --danger | #E5484D | errors, destructive |

Dark (`[data-theme="dark"]` and `prefers-color-scheme: dark` unless `[data-theme="light"]`)
--paper #14112E, --card #221E45, --ink #F2EFFF, --soft #A9A5D0. Accent colors stay the same. Text on yellow, pink, mint, lilac is always #1B1740.

Avatar colors: 8 swatches chosen from yellow, pink, mint, lilac and four tints of them. Stored as a token name in `profiles.avatar_color`.

## Typography
- Headings: Bricolage Grotesque, weight 800, letter-spacing -0.03em, line-height 1.05.
- Body: DM Sans 400, 500, 700. Base 16px, line-height 1.6.
- Scale: 12, 14, 16, 18, 24, 32, 44, 64. Max line length 70 characters.
- Sentence case everywhere. No all caps labels.
- Load fonts with `next/font/google` and give system fallbacks.

## Shape and depth
- Border: 2px solid var(--ink) on cards, inputs, buttons, dialogs.
- Radius: 12px inputs and buttons, 16px cards, 24px dialogs, full for avatars and pills.
- Shadow: hard offset `4px 4px 0 var(--ink)` for cards and buttons, `2px 2px 0` on button hover (button moves 2px), none on inputs. No blur shadows, no gradients.

## Layout
- Breakpoints: mobile under 640px, tablet 640 to 1023px, desktop 1024px and up.
- Desktop shell: rail 72px, group sidebar 260px, main pane fluid. Feed content max width 680px, centered in the main pane. Thread opens in the main pane; on screens 1280px and wider it may open as a right panel of 420px.
- Tablet: rail plus main; sidebar becomes a drawer.
- Mobile: single column, top bar with menu button, bottom tab bar (Today, Past, Ask, Members). Bottom bar respects `env(safe-area-inset-bottom)`.
- Page padding: 16px mobile, 24px tablet, 32px desktop. Spacing scale: 4, 8, 12, 16, 24, 32, 48.

## Components (`components/ui`)
| Component | Spec |
|---|---|
| Button | Variants: primary (yellow), secondary (card), danger (danger fill, white text), ghost. 44px min height. Loading state shows a spinner and disables clicks. Hover moves 2px and shrinks the shadow. |
| Input / Textarea | 2px ink border, 12px radius, label above, helper text below, error text in danger with an icon. Character counter at the bottom right for capped fields. Focus ring: 3px lilac outline with 2px offset. |
| Card | Card background, 2px border, 16px radius, hard shadow, 16 to 20px padding. |
| Badge / Tag | Pill, 12px text, weight 700. "AI" tag: yellow fill, ink text. "Admin" tag: lilac fill. |
| Avatar | Circle with initials, 2px border, avatar color fill. Sizes 24, 32, 44, 64. Pip avatar: yellow with a four-point spark icon. |
| Dialog | Centered card with 24px radius, dimmed backdrop, focus trapped, Escape closes. Destructive dialogs name the thing being affected and use a danger button. |
| Toast | Bottom center (mobile) or bottom right (desktop), auto-dismiss 4 seconds, success and error variants. |
| Skeleton | Flat paper-tinted block with a subtle pulse; no shimmer gradient. |
| PipBubble | Yellow background, ink text, 4px top-left radius and 14px elsewhere, AI tag beside the name. Always used for Pip messages, everywhere. |
| MessageBubble | Card background, 2px border, same shape as PipBubble. |
| ProgressDots | One dot per active member: filled ink circle means answered, empty outlined circle means not yet. No names. |
| Countdown | Text like "Reveals 8:00 pm, in 5h 12m"; updates every 30 seconds. |

## States every screen must have
Loading (skeletons), empty (an invitation, not an apology), error (what happened plus a retry), unauthorized (redirect to login).

## Motion
Only motion that responds to a user action: button press, dialog open, message appearing. Respect `prefers-reduced-motion`.

## Accessibility
Visible focus on everything interactive. Color is never the only signal (answered dots also have text "4 of 6 answered"). Contrast at least 4.5:1 for body text. Every icon-only button has an aria-label. Forms announce errors to screen readers.

## Copy voice
Plain, warm, a little silly. Verb-first buttons, sentence case, no exclamation marks in system text, no guilt.
- Good: "Your turn. Answer today's question." / "Locked in. Reveal at 8:00 pm."
- Avoid: "You have not engaged with the group in 8 days." / "Submit" on its own.
Errors: say what happened and what to do, in one sentence. "That code didn't work. Check it and try again."

## Brand
Wordmark: lowercase "sidequest" in Bricolage Grotesque 800. Logo: a four-point spark inside a yellow rounded square with a 2.5px ink outline. Favicon: the spark on yellow.
