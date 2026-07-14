# PicPic Design System

## 0. Research Log

- Embedded reference: shortlisted Notion, Wired, and Claude for paper-like editorial systems; picked `minimalist-skill` + Notion as the structural source, then adapted the reference image's red accent and Korean mobile receipt rhythm for PicPic.
- Provided reference: inspected `.omo/drafts/assets/picpic-multichannel-mobile-reference.png` at full resolution; it establishes the three states, 44px controls, centered mobile shell, channel drawer, provenance chips, and sticky NAVER action.
- Superseded draft: a generated extraction image was inspected, but it is not a product reference; the supplied neutral 3-screen reference remains authoritative because the product must stay coherent when channels beyond 또간집 are added.
- UI skills CLI: attempted `npx ui-skills categories`; unavailable because the package was not cached and network access was restricted.
- Skipped lazyweb and additional image lanes: the supplied reference and generated extraction are sufficient for this product surface; no external live site is being cloned.

## 1. Atmosphere & Identity

PicPic feels like a well-kept paper guide that happens to know where every filmed meal came from. The signature is a warm receipt-like canvas, charcoal editorial type, and one confident tomato-red action color that makes provenance feel trustworthy rather than promotional.

## 2. Color

| Role | Token | Light | Dark-independent usage |
| --- | --- | --- | --- |
| Paper canvas | `--surface-paper` | `#f7f4ee` | Page background |
| Card surface | `--surface-card` | `#fffdf9` | Rows, sheets, controls |
| Muted surface | `--surface-muted` | `#eee9df` | Empty states and soft fields |
| Primary ink | `--ink-primary` | `#272522` | Headings and body |
| Secondary ink | `--ink-secondary` | `#68635d` | Place metadata and hints |
| Tertiary ink | `--ink-tertiary` | `#908a82` | Disabled and quiet metadata |
| Accent red | `--accent-red` | `#b7352e` | Active tabs, primary CTA, verified emphasis |
| Accent red dark | `--accent-red-dark` | `#8f2823` | Pressed and hover states |
| Accent red soft | `--accent-red-soft` | `#f3dfd8` | Selection and subtle provenance background |
| Default line | `--line-default` | `#d8d0c5` | Dividers and control outlines |
| Strong line | `--line-strong` | `#b9afa2` | Focused and selected controls |
| Focus ring | `--focus-ring` | `#9c3029` | Keyboard focus |

Accent is semantic and sparse. Every channel uses the same neutral control treatment; red means the current selection or primary action, never a channel identity. No gradients, dark mode swap, channel logo, copied program branding, or channel-name conditional styling.

## 3. Typography

| Level | Size | Weight | Line height | Usage |
| --- | --- | --- | --- | --- |
| Display | `clamp(32px, 8vw, 44px)` | 700 | 1.05 | PicPic wordmark and restaurant title |
| H1 | 28px | 700 | 1.15 | Screen heading |
| H2 | 22px | 700 | 1.25 | Row and section title |
| Body | 16px | 400 | 1.55 | Description and address |
| Body small | 14px | 400 | 1.45 | Place metadata and source names |
| Caption | 12px | 600 | 1.35 | Chips, episode markers, counts |

The UI uses Geist Sans for controls and metadata, with a system Korean serif stack for editorial titles and the wordmark. Headings use `text-wrap: balance`; body copy uses `text-wrap: pretty`.

## 4. Spacing & Layout

Base unit is 4px. The mobile shell is `--shell-max-width: 560px`, centered on wide screens with `--page-gutter` side padding. Core spacing tokens are 4, 8, 12, 16, 20, 24, 32, and 40px. Interactive controls use `--control-height: 48px`; compact chips remain at least 44px tall when interactive. Main list rows use 16px vertical rhythm with 1px dividers.

Breakpoints: 320px stress, 375px primary mobile, 640px tablet transition, 768px tablet, and 1280px centered desktop observation. No horizontal scrolling is permitted on the page shell.

## 5. Components

### Masthead
- **Structure:** wordmark, short descriptor, menu button.
- **Variants:** discovery and detail back navigation.
- **States:** default, hover, active, focus.
- **Accessibility:** named menu/back buttons, visible focus.

### SourceChip
- **Structure:** compact label with source/channel and episode number.
- **Variants:** verified source, neutral source, unavailable source; all channels share the same visual family.
- **States:** default and unavailable.
- **Accessibility:** text remains meaningful without color.

### RestaurantRow
- **Structure:** image, title, location, one-line editorial note, source chips, chevron.
- **Variants:** result, loading skeleton, unavailable image fallback.
- **States:** default, hover, active, focus, loading, empty, error.
- **Accessibility:** entire row is a link; image has descriptive alt text; source chips are supplemental text.

### FilterBar
- **Structure:** neutral horizontal channel controls, labeled search input, region chips, result count.
- **Variants:** active channel, filtered, no results.
- **States:** default, focus, loading, empty, error.
- **Accessibility:** native buttons and input label; active state is text and `aria-pressed`.

### ChannelSheet
- **Structure:** modal dialog, search input, checkbox list, apply action.
- **Variants:** closed and open.
- **States:** open, focus-trapped, empty, error.
- **Accessibility:** `role=dialog`, labelled heading, Escape close, keyboard focus return.

### PrimaryMapAction
- **Structure:** sticky full-width button at the detail bottom.
- **Variants:** handoff and copy fallback.
- **States:** default, pressed, focus, blocked fallback.
- **Accessibility:** explicit action wording never claims a save; fallback copy remains available.

## 6. Motion & Interaction

Micro interactions use 120ms ease-out; sheets use 240ms ease-in-out; route-level emphasis uses 400ms cubic-bezier(0.16, 1, 0.3, 1). Animate only transform and opacity. Buttons use a subtle `scale(0.96)` pressed state. Reduced-motion users receive no non-essential movement.

## 7. Depth & Surface

The system uses mixed depth: paper and card tonal separation, thin warm dividers for list structure, and one low-opacity two-layer sheet shadow. No heavy card shadows, gradients, glass effects, or nested card stacks.

## 8. Accessibility Constraints & Accepted Debt

WCAG 2.2 AA target: 4.5:1 body contrast and 3:1 large-text contrast, visible keyboard focus, native keyboard interaction, 44px minimum interactive targets, meaningful alt text, Korean-friendly wrapping, and reduced motion. No accepted accessibility debt is carried for the MVP.
