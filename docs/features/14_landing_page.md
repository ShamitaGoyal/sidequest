# Feature 14: Landing page

Depends on: 01, 13 (demo button). Owner: Cursor. Use the design system exactly.

## Scope
The public page recruiters and friends see first. One job: explain the product in 30 seconds and get people into the demo.

## Sections (`app/(marketing)/page.tsx`)
1. Header: logo, "How it works", "Log in", "Sign up".
2. Hero: headline "Your friends moved. The group chat got quiet." Subhead: "Sidequest gives your group one question a day. Everyone answers, the answers unlock together, and the talking starts on its own." Buttons: "Try the demo group" (primary), "Sign up" (secondary). A phone-style mockup of today's card with Pip.
3. How a round works: Answer (privately), Reveal (together at 8 pm), Talk (in the thread).
4. Meet Pip: the four presets with one example line each.
5. Closing call to action: "Skip the sign-up. Play a round." with the demo button.
6. Footer: "Sidequest, a portfolio project", GitHub link, README link, "Built with Next.js and Supabase".

## Flows
| Click | Result |
|---|---|
| Try the demo group | Go to `/demo` (feature 13). |
| Sign up / Log in | `/signup` / `/login`. |
| How it works | Smooth-scroll to section 3. |
| GitHub / README | Open in a new tab. |

## Files
`app/(marketing)/page.tsx`, `components/marketing/{Hero,HowItWorks,MeetPip,PhoneMockup}.tsx`.

## Acceptance criteria
- [ ] Looks correct at 360px, 768px, and 1280px widths with no horizontal scroll.
- [ ] Light and dark mode both work.
- [ ] Lighthouse accessibility score at least 95.
- [ ] Demo button works from a logged-out browser.
- [ ] Uses brand fonts, colors, outlines, and hard shadows from the design system; no gradients or blur shadows.

## Tests
- T-E2E-05 (entry): landing demo button reaches the demo group.
- T-E2E-09: landing page loads, all section anchors exist, links resolve.
