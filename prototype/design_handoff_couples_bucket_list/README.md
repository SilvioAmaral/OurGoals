# Handoff: Couples Bucket List App

## Overview
A mobile app for couples to build a shared "bucket list" of things they want to do together. Items are organized into categories; each partner rates each item 1–5 independently, and the app surfaces a match score / overlap between partners. Includes account/auth screens, partner invite, and a theme picker.

## About the Design Files
The files in this bundle (`Couple Bucket List.dc.html`, `ios-frame.jsx`) are **design references built in HTML/React** — interactive prototypes showing intended look, flow, and behavior. They are not production code to copy directly. The task is to **recreate these designs in the target codebase's environment** (React Native, SwiftUI, Kotlin/Compose, Flutter, or plain React for a web app — whatever the project uses) using that platform's own component and state-management patterns. If no mobile app codebase exists yet, choose the framework best suited to the project (React Native or Flutter are reasonable defaults for cross-platform).

`ios-frame.jsx` and `support.js` are prototype-only scaffolding (device bezel chrome and a template runtime) — they exist to render the mockup in a browser and have no equivalent in the real app.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy are intentional and should be reproduced closely. Layout uses CSS flexbox with explicit pixel values throughout (design canvas is 402×874, matching an iPhone 14/15-class screen).

## Screens / Views

### 1. Auth (Welcome / Sign in)
- **Purpose**: Entry point. User signs in or signs up via OAuth or email/password.
- **Layout**: Full-screen, vertical flex, centered content, padding `88px 28px 40px`.
- **Components**:
  - App mark: 64×64px rounded-square (`border-radius:20px`), accent-colored background, white teardrop glyph.
  - Title "Welcome" — Lora serif, 600 weight, 28px, color `oklch(22% 0.02 40)`.
  - Subtitle: "Sign in to start building your shared bucket list." — Work Sans, 15px, `oklch(48% 0.02 40)`.
  - "Continue with Google" button: white bg, 1px border `oklch(88% 0.01 50)`, 14px radius, 14px padding, gradient dot icon (conic-gradient placeholder — replace with real Google "G" logo).
  - "Continue with Apple" button: black bg, white text, 14px radius, teardrop/apple placeholder icon (replace with real Apple logo).
  - Divider row with "or sign in with email" / "or sign up with email" label (dynamic based on mode).
  - Email input (text) + Password input (type=password), each with a 12px/600-weight uppercase label above (EMAIL / PASSWORD), 12px border-radius, 13px/14px padding.
  - Primary "Continue" button pinned to bottom: full width, accent background, 16px radius, white text, 16px/600.
  - Text link below: toggles between "Don't have an account? Sign up" and "Already have an account? Sign in".
- **Behavior**: Any of the three sign-in actions (Google, Apple, Continue) navigates to Setup. No real validation in the prototype — wire up real auth here.

### 2. Setup (Names, Partner Invite, Sexuality toggle)
- **Purpose**: First screen after auth. Collects display names, invites the partner, and lets the user opt in to a sensitive "Sexuality" category.
- **Layout**: Same vertical centered flex as Auth.
- **Components**:
  - Same app mark, title "Our Bucket List" (Lora 600 30px), descriptive subtitle.
  - "Your Name" text input (defaults to "Silvio" in prototype — replace with real user name from auth).
  - "Partner's Name" text input (defaults to "Sheyla").
  - "Add Partner by Email or Phone" — text input + accent "Invite" button side by side; on submit, shows a confirmation line "Invite sent to {contact}" in accent color. **This needs a real invite flow** (send email/SMS with an accept link, create a pending-partner record).
  - "Sexuality entries" row: label + description ("Show an intimate category with sensitive topics") on the left, a toggle switch on the right (44×26px pill, 22px white knob sliding between `left:2px` off and `left:20px` on, track color accent when on / `oklch(88% 0.01 50)` when off).
  - Primary "Start rating together" button pinned to bottom.
- **Behavior**: Toggling "Sexuality entries" on adds a "Sexuality" category (id `sexuality`, 3 example items) to the categories list; toggling off removes it. This exact toggle also appears on the Account screen (same state).

### 3. Categories (main list / home)
- **Purpose**: Shows all bucket-list categories with per-category progress.
- **Layout**: Header (`padding:58px 20px 14px`) with title "Our Bucket List" (Lora 600 26px) and subtitle "{You} & {Partner}" (14px, muted). Scrollable list below, `padding:0 20px 12px`, cards in a `flex-direction:column; gap:12px` stack.
- **Category card**: white bg, 18px radius, 16px padding, flex row, `gap:14px`:
  - 44×44px colored square (13px radius) with the category's first-letter initial, Lora 600 18px, white text. Color rotates through a fixed hue set (25, 210, 150, 300, 70, plus 330 for Sexuality) at `oklch(58% 0.13 hue)`.
  - Name (16px/600) + "{n} of {total} rated" or "No entries yet" (13px, muted) stacked.
  - Right side: if category has 0 items, an "×" delete affordance (34px circle) instead of the ring; otherwise a 34px circular progress ring (`conic-gradient` accent-over-track) with percentage text in the center (10px/700).
- **Behavior**: Tap a card → Items screen for that category. Tap the delete "×" (only shown when the category is empty) removes it.
- A floating circular "+" button (54px, accent bg, white plus glyph, drop shadow) sits bottom-right, 20px from the right edge and just above the tab bar — tapping opens the Add modal in "new group" mode.

### 4. Progress
- **Purpose**: Overall completion summary.
- **Layout**: Same header treatment (title "Progress"). Content: a centered summary card (18px radius, 20px padding) with a large 104px circular progress ring (conic-gradient), percentage in the middle (Lora 24px) + "rated" caption, and "{n} of {total} items rated by {You}" beneath. Below, one row per category: name + "{rated}/{total}" and a thin (8px) rounded progress bar filled proportionally in the category's color.

### 5. Match (Results)
- **Purpose**: Shows compatibility between partners.
- **Layout**: Header title "Your Match". A full-width accent-colored card (18px radius, 22px padding) shows the overall match percentage (Lora 40px/700, white) and "match on {n} shared answers" caption. Below: "THINGS YOU BOTH CAN'T WAIT FOR" section listing up to 6 items both partners rated ≥4 (small colored dot + name + category name), or a muted empty-state card if none. Then "MATCH BY CATEGORY": one row per category with a percentage label and colored progress bar (based on average rating-difference score across items both have rated).

### 6. Account
- **Purpose**: Profile, partner info, theme, sensitive-content toggle, delete account.
- **Layout**: Header title "Account". Content: 
  - Profile card (white, 18px radius, centered column): 64px circular avatar with initial, name (17px/600), and "Rating with {Partner}" caption.
  - "Display Name" input, "Partner's Name" input.
  - "Theme" row: 4 circular swatches (36px) for Purple / Rose / Teal / Sunset, label below each; active swatch gets a white-ring + colored outer ring (`box-shadow: 0 0 0 2px #fff, 0 0 0 4px <hue color>`).
  - "Sexuality entries" toggle (same component/state as on Setup).
  - "Delete Account" button: full width, white bg, 1px red-ish border (`oklch(70% 0.18 25)`), red text (`oklch(55% 0.2 25)`), 14px radius.
- **Behavior**: Delete Account opens a bottom-sheet confirm ("Delete your account?" / Cancel / Delete). Confirming resets the app back to the Auth screen.

### 7. Items (inside a category)
- **Purpose**: List entries within a category; rate each 1–5.
- **Layout**: Header with back-chevron (34px circle, white bg) + category name (Lora 600 22px). List below, cards (white, 16px radius, 14px padding): item name (15px/500) + a small "×" delete icon on the same row, then a row of 5 equal-width rating pills (34px tall, 9px radius) labeled 1–5; the selected value is filled with a color from a 5-step intensity ramp (`RATING_BG`: light → dark warm tones) and white/dark text depending on contrast. If both partners rated the item ≥4, a green/accent match note appears below ("You both want this — {Partner} rated it {n}").
- A floating "+" button (54px) bottom-right opens the Add modal in "new entry" mode, pre-scoped to the open category.

### 8. Item Detail
- **Purpose**: Rate a single item and see the partner's rating.
- **Layout**: Header with back chevron + category name (small caps label style). Below: item name (Lora 600 24px), "HOW MUCH DO YOU WANT THIS?" label, a row of 5 larger rating pills (52px tall, 12px radius, 18px/700 numerals), your current label text ("You: {label}" from a 1–5 word scale: Not for us / Curious about it / Okay with it / Really want it / Can't wait!!). Below, a card showing the partner's rating (38px circle with their number, colored by the same intensity ramp) and a match note (Perfect match! / Close match / Some overlap / "You see this differently — worth a chat", based on rating delta), or a muted "hasn't rated this yet" card if the partner has no rating.

### Add Modal (bottom sheet, shared by Categories/Items "+")
- **Purpose**: Combobox to add a new category ("group") or a new item, with type-ahead suggestions from a curated word list, but free text is always allowed.
- **Layout**: Bottom sheet, white bg, top corners 24px radius, 24px padding + 32px bottom padding. Title ("Add an entry" / "Add a new group"), a text input with a chevron toggle button (rotates 180° when open) on the right edge, and a dropdown panel (absolute-positioned below the input, white, 12px radius, shadow) listing up to 5 filtered suggestions — opens on focus or chevron click, closes on selection. Cancel / Add buttons side by side at the bottom.

## Interactions & Behavior Summary
- All navigation is client-side state (`screen` enum: auth, setup, categories, progress, results, account, items, detail) — no real routing/deep-linking in the prototype.
- Rating a 1–5 pill updates "your" rating immediately (no confirmation step).
- Deleting a category is only allowed when it has 0 items (UI enforces this by only showing the delete affordance then).
- The combobox add-modal filters suggestions by substring match against the typed text and excludes names already used in the current list.
- Theme changes apply instantly app-wide via a CSS custom-property pattern (`--accent`, `--accent-dark`, `--bg` set on the root container) — recreate this as a global theme/color token in the target app's design system, not per-component hardcoded colors.
- No animations beyond the toggle-switch knob slide and the chevron rotation (0.15s linear/ease transitions).

## State Management
Minimum state needed:
- `currentUser` (name, email) — from real auth.
- `partner` (name, contact, invite status: none/pending/accepted).
- `categories`: list of `{ id, name, colorHue, items: [{ id, name }] }`.
- `ratings`: per-user map of `itemId -> 1-5`. In a real multi-couple app this should be scoped per couple/relationship, not global.
- `theme`: one of purple/rose/teal/sunset (or open color picker).
- `sexualityEnabled`: boolean, gates the Sexuality category's existence.
- Navigation/selected state: `activeCategoryId`, `activeItemId`, current screen/tab.
- Modal state: add-modal open/closed + mode (new category vs. new item) + text input + dropdown open/closed.

## Design Tokens

**Colors** (theme is parametric on a single hue value; default Purple = hue 280):
- Accent: `oklch(58% 0.18 <hue>)` — Purple 280 / Rose 25 / Teal 190 / Sunset 50
- Accent dark (hover/pressed): `oklch(48% 0.18 <hue>)`
- App background: `oklch(95% 0.014 <hue>)` (very low chroma, tinted by theme)
- Card background: `#ffffff`
- Primary text: `oklch(22% 0.02 40)`
- Secondary/muted text: `oklch(48% 0.02 40)`
- Tertiary/inactive tab text: `oklch(65% 0.02 40)` / `oklch(60% 0.02 40)`
- Track/divider gray: `oklch(90–92% 0.01 50)`
- Danger (delete): border `oklch(70% 0.18 25)`, text `oklch(55% 0.2 25)`
- Rating intensity ramp (1→5): `oklch(90% 0.012 40)`, `oklch(85% 0.05 32)`, `oklch(76% 0.09 28)`, `oklch(66% 0.13 25)`, `oklch(56% 0.16 20)`
- Category swatch hues (decorative, independent of theme): 25, 210, 150, 300, 70, 330

**Typography**:
- Display/headings: "Lora", serif, weights 500/600/700 — e.g. screen titles 26px/600, match score 40px/700, item detail title 24px/600.
- Body/UI: "Work Sans", sans-serif, weights 400–700 — body 13–16px, labels 11–12px/600 with `letter-spacing:0.02em` (often uppercase).

**Spacing/radius**:
- Screen padding: `20–28px` horizontal.
- Card radius: 14–18px. Pills/buttons: 9–16px. Circular avatars/icons: 50%.
- Card gap in lists: 10–12px.

**Shadows**: Floating "+" button uses `0 8px 18px oklch(0% 0 0 / 0.25)`.

## Assets
No image/icon assets — all icons are simple inline SVGs (person, bucket, progress bar, heart for the 4 tab icons; plus/back/delete glyphs built from CSS divs). Replace with the target platform's icon system (SF Symbols, Material Icons, or a custom icon font/SVG set) at equivalent visual weight (~18px).

## Files
- `Couple Bucket List.dc.html` — the full design source (template + logic) for all 8 screens described above.
- `ios-frame.jsx` — prototype-only iPhone device bezel (not needed in the real app).
- `support.js` — prototype-only template runtime (not needed in the real app).
