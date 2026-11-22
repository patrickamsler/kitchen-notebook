# Design system

> The Kitchen Notebook ships with **one** look. This file describes it; the values in code live in
> `frontend/src/styles/kn-tokens.css`. Screens: `docs/design/screens/` (index: `screen-inventory.md`).
> Exploration happens in the Claude Design canvas "The Kitchen Notebook"; it is a reference, not the source of truth.

## 1. The look

| Setting | Value |
|---|---|
| Design system | Fluent 2-inspired |
| Colour seed | Blueberry `#4A5A9C` (tonal palette from Material colour utilities, TonalSpot) |
| Mode | Light and dark, following the device setting — no user switch |
| Contrast | Standard |
| Density | Compact on desktop; touch targets stay 48 px on phones |
| Corners | Rounded (Fluent radii) |
| Title scale | 100 % |

Users cannot change the appearance. There is no appearance section in Settings.

## 2. Rules for UI work

1. Use only tokens from `kn-tokens.css` (`--md-sys-color-*`, `--kn-*`). No hard-coded colours, radii, shadows or sizes in components.
2. Every colour pair must reach WCAG 2.1 AA: text ≥ 4.5:1, UI boundaries ≥ 3:1. Check light **and** dark.
3. Touch targets on mobile are at least 48 × 48 px (`--kn-touch-target`), even with compact density.
4. All user-facing text comes from translation files (English at launch, more languages later). No hard-coded strings.
5. A change that alters a screen lists the affected screen IDs in its OpenSpec `proposal.md` and puts updated screenshots in the change folder (`changes/<name>/ui/`). On archive they replace the files in `docs/design/screens/`.
6. A new token, or a change to one, goes through an OpenSpec change and updates this file and `kn-tokens.css` together.

## 3. Colour

### Accent roles (Blueberry)

| Role | Light | Dark |
|---|---|---|
| primary | `#4E5B92` | `#B8C4FF` |
| on-primary | `#FFFFFF` | `#1F2D61` |
| primary-container | `#DDE1FF` | `#364379` |
| on-primary-container | `#364379` | `#DDE1FF` |
| secondary-container | `#DEE1F9` | `#424659` |
| tertiary-container | `#FFD7F4` | `#5C3D56` |
| error | `#BA1A1A` | `#FFB4AB` |
| error-container | `#FFDAD6` | `#93000A` |
| inverse-surface (snackbar) | `#2F3036` | `#E3E1E9` |

The full role set is in `kn-tokens.css`.

### Neutrals (Fluent-style)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--kn-bg` | `#FAFAFA` | `#1F1F1F` | Page background |
| `--kn-rail` | `#F5F5F5` | `#141414` | Navigation rail |
| `--kn-topbar`, `--kn-card`, `--kn-dialog` | `#FFFFFF` | `#292929` / `#2E2E2E` | Surfaces |
| `--kn-sunk` | `#F0F0F0` | `#333333` | Inputs, skeletons, selected navigation |
| `--kn-ink` | `#242424` | `#FFFFFF` | Primary text |
| `--kn-ink2` | `#616161` | `#D6D6D6` | Secondary text (≥ 4.5:1) |
| `--kn-line` | `#8A8A8A` | `#8F8F8F` | Control borders (≥ 3:1) |
| `--kn-hair` | `#E0E0E0` | `#3D3D3D` | Dividers |

## 4. Typography

Font stack: `Segoe UI Variable` (Display for headlines, Text for body) → `Segoe UI` → `Inter` → `system-ui`.
Ship Inter as a web font so non-Windows devices look consistent. Headlines and titles use weight 600.

| Style | Size / line height (px) | Token |
|---|---|---|
| Display M (recipe title, desktop) | 45 / 52 | `--kn-type-display-m` |
| Headline L / M / S | 32/40 · 28/36 · 24/32 | `--kn-type-headline-*` |
| Title L / M / S | 22/28 · 16/24 · 14/20 | `--kn-type-title-*` |
| Body L / M / S | 16/24 · 14/20 · 12/16 | `--kn-type-body-*` |
| Label L / M / S | 14/20 · 12/16 · 11/16 | `--kn-type-label-*` |

## 5. Shape, elevation, density

- **Radii:** xs 2 · sm 4 · md 6 · lg 8 · xl 8 px. Buttons, chips, fields, search: 4 px. Cards, menus, dialogs: 8 px. Images: 6 px. Avatars: circle.
- **Elevation:** card, menu, FAB and dialog shadows as `--kn-*-shadow`. Focus ring: 2 px ink with an inner surface ring.
- **Compact density (desktop):** buttons 36 px, chips 28 px, list items 48 px, fields 48 px, top bar 56 px. Mobile keeps 48 px targets.

## 6. Layout

| Area | Desktop (≥ 1024 px) | Mobile (390 px reference) |
|---|---|---|
| Navigation | Left rail: Recipes, Shopping (badge), People, Settings | Bottom bar: Recipes, Shopping (badge), People |
| Top bar | Notebook name (plain text with 1 notebook, switcher with 2+); account avatar → menu (Settings, Sign out) | Same, compact |
| Content | Centred column, max 1192 px; shopping list 760 px; forms 840 px | Full width, 12–16 px padding |
| Primary action | Labelled "New recipe" button, bottom right | Round "+" button above the bottom bar |
| Dialogs | Centred dialog | Full-screen sheet |

## 7. Components

Buttons (filled, tonal, outlined, text, danger), icon buttons, filter chips with counts, segmented controls, search field,
text fields with error and help text, checkboxes, radio buttons, switches, menus, dialogs, bottom sheets (mobile),
snackbars with Undo, tooltips, banners, progress indicators, skeletons, initials avatars, recipe card, recipe row,
shopping row (72 px), illustration picker.

States: enabled, hover, focus, pressed, disabled, loading — see `screens/00-tokens-and-component-states.png`.
`reference/canvas-prototype.css` is the canvas's prototype CSS (it contains every design variant explored on the canvas);
use it only as a reference for component details, never import it.

Icons: Material Symbols Rounded (to confirm; alternative: Fluent System Icons).

## 8. Imagery

- Recipe photos are user uploads, 16:10 recommended.
- Generic illustrations users can pick when a recipe has no photo: `frontend/src/assets/illustrations/generic/`
  (soup, salad, pasta, bread, cake, stir-fry, tray bake, fruit bowl; SVG, 800 × 500).
- Sample-recipe illustrations for seed and demo data: `frontend/src/assets/illustrations/samples/`.
- The Google sign-in button follows Google's branding guidelines (fixed colours, official "G" asset).

## 9. Accessibility

WCAG 2.1 AA: contrast as in section 2, visible focus states, real buttons and inputs with labels, `aria-label` on
icon-only buttons, 48 px touch targets on mobile, live regions for snackbars and servings changes.

## 10. Copy

Tone: calm, short, kitchen-friendly. Key lines:

- Sign in: "Your recipes, all in one place."
- Sign up: "Start with one recipe. The rest will follow."
- Invitation: "A notebook full of recipes is waiting for you."

## Open questions

1. Fluent implementation in Angular (ADR-010) and whether to switch to Fluent System Icons.
2. Theme the Keycloak sign-in pages to this look (ADR-008)?
3. Wordmark / logo: currently a skillet icon in a rounded square plus "The Kitchen Notebook" — final logo needed?
