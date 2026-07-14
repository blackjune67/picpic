# PicPic Design System

## 0. Research Log

- Existing-surface audit: the previous mint card system was functional but visually even; the hero, list, and detail screens had the same visual weight.
- `frontend-design` direction: food discovery should feel like a contact sheet from a late-night food walk — tactile paper, ink-black utility surfaces, warm photo frames, and short evidence labels.
- UI skills CLI: categories were available, but the installed registry did not expose the requested `visual` or `craft` slugs; the existing product contract and this system remain authoritative.
- Chosen direction: night-market editorial. The single risk is an ink-black filter slab that behaves like a physical index card and gives the calm food photography a strong frame.

## 1. Atmosphere & Identity

PicPic is a visual field guide for restaurants discovered in videos. It should feel collected, not algorithmic: the restaurant image is the hook, the note is the reason to care, and the source chip is the proof. The interface is intentionally asymmetric: a large editorial hero, a dark index filter, and a split preview on wide screens.

## 2. Color

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Paper | `--surface-paper` | `#f3efe7` | page canvas |
| Reading card | `--surface-card` | `#fffdf8` | selected rows, preview |
| Ink slab | `--surface-ink` | `#191b24` | filter panel, wordmark contrast |
| Raised neutral | `--surface-raised` | `#ebe5d9` | chips and controls |
| Note yellow | `--surface-note` | `#f7c56b` | editorial note and count stamp |
| Primary ink | `--ink-primary` | `#191b24` | headings and copy |
| Secondary ink | `--ink-secondary` | `#686873` | supporting copy |
| Tertiary ink | `--ink-tertiary` | `#62636d` | small metadata with readable contrast |
| Tomato action | `--accent-red` | `#b74337` | active state and CTA |
| Tomato pressed | `--accent-red-dark` | `#8f2e2b` | hover/pressed action |
| Tomato wash | `--accent-red-soft` | `#f2d0c5` | selection support |
| Default line | `--line-default` | `#d8d1c4` | list structure |
| Focus | `--focus-ring` | `#226b59` | keyboard focus |

Do not introduce channel-specific colors. Tomato means action or selection, never channel identity.

## 3. Typography

The UI uses a Korean-friendly system sans for controls and metadata. Editorial titles use `--font-display` with heavy weight and tight tracking. The display scale is 42–86px for hero/detail titles, 21–32px for item titles, 13–15px for body, and 9–11px for evidence labels. Uppercase labels use `.eyebrow` with 0.14em tracking.

## 4. Spacing & Layout

The spacing base is 4px. Mobile gutters are 16px, standard shell gutters are 20px, and wide layouts use a max width of 1220px. Touch targets are at least 44px. Discovery is a 1-column feed below 760px and a list/preview split above it. Detail is a single reading column on mobile and a media/copy split on wide screens.

## 5. Components

- `SiteHeader`: compact wordmark, one-line context, menu action.
- `DiscoveryHero`: editorial thesis, count stamp, and single paragraph of orientation.
- `FilterPanel`: dark index slab; channel pills, search field, and region pills.
- `RestaurantRow`: image-led contact-sheet row, district label, editorial note, source chips, detail link.
- `PreviewCard`: sticky wide-screen reading card with large image and provenance count.
- `ChannelSheet`: mobile bottom sheet with focus return, Escape close, counts, and apply action.
- `DetailHero`: image, location, address action, editorial note, and source metadata.
- `SourceList`: ordered provenance links using real episode data.
- `DetailAction`: mobile-safe sticky map action with address-copy recovery.

## 6. Motion & Interaction

Motion is limited to transform, opacity, and background-color. Rows nudge 4px on hover to reinforce that they are selectable. Buttons compress to 0.97 on press. The sheet is a single bottom-up interaction; no decorative looping animation is used. Reduced-motion users receive no non-essential movement.

## 7. Depth & Surface

Use paper gradients for atmosphere, a warm tinted shadow for raised cards, and a dark slab for the filter. Images receive a bottom readability gradient and a small frame label. Avoid equal-radius card grids and avoid adding a second saturated action color.

## 8. Accessibility Constraints & Accepted Debt

WCAG 2.2 AA target: native buttons/links/inputs, visible focus, 44px targets, meaningful alt text, keyboard-closeable sheet, Korean-friendly wrapping, reduced motion, and 4.5:1 body contrast. No accepted accessibility debt.
