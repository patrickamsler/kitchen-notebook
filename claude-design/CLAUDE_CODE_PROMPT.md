# Claude Code Prompt — The Kitchen Notebook (Next.js port)

Copy everything below the divider into Claude Code. Attach the design files (`The Kitchen Notebook.html`, `styles.css`, `app.jsx`, `components.jsx`, `lib/seed.js`, `tweaks-panel.jsx`) alongside the prompt so Claude Code has the full reference.

---

## Role & goal

You are a senior frontend engineer. Build a production-quality **Next.js 14 (App Router) + TypeScript** application called **The Kitchen Notebook** — a personal recipe book with a shopping list. I am attaching the complete reference design as static HTML/CSS/JSX files. **Match the design pixel-for-pixel.** The reference uses CSS custom properties and plain JSX; your job is to faithfully port it to the stack below while preserving every visual detail (typography, spacing, colors, hover states, animations, responsive breakpoints).

## Required stack

- **Next.js 14+** with the **App Router**, TypeScript (strict mode)
- **styled-components** for all styling, with the official Next.js SSR setup via `StyledComponentsRegistry`
- A **theme file** (`src/theme/theme.ts`) exposing every design token from the reference — colors, fonts, radii, shadows, transition durations, max-widths. Wire it through `<ThemeProvider>` and a `createGlobalStyle` block. Type the theme via `styled.d.ts` so `props.theme` is fully typed.
- **No external state libraries.** Use the platform:
  - **Routing** → Next App Router (file-based routes, `<Link>`, `useRouter`, `useParams`, `usePathname`)
  - **Server state** → React **Server Components** + **Server Actions** (`'use server'`) for reads and writes. Mutations call `revalidatePath('/')` / `revalidatePath('/recipes/[id]')` so the UI refreshes without client-side cache plumbing. Use `useFormStatus` / `useFormState` for pending/error UI.
  - **Client state** → plain `useState` / `useReducer` inside client components, lifted to a small React Context only where genuinely shared (accent + title-scale tweaks). Persist tweaks to `localStorage` with a `useEffect` sync.
  - **Optimistic updates** → React 19's `useOptimistic` where the wait would feel laggy (toggling shopping items, adding/removing ingredients from the list).
- **No real backend.** Mock the data layer with an in-memory store seeded from a `seed.ts` file (port `lib/seed.js` to TypeScript). Expose async functions from a server module: `getRecipes`, `getRecipe(id)`, `createRecipe`, `updateRecipe`, `deleteRecipe`, `getShopping`, `addShoppingItems`, `toggleShoppingItem`, `removeShoppingItem`, `clearChecked`, `clearAllShopping`. Persist to a JSON file on disk (e.g. `.data/store.json`) so refreshes survive in dev. Each function adds ~120ms artificial latency so Suspense fallbacks render.

## Routes (Next App Router)

- `/` — Recipe list (search, filter chips, sort dropdown, grid of cards, "New recipe" button). Search/filter/sort live in URL search params (`?q=...&type=main&sort=newest`) so they're shareable and survive reload.
- `/recipes/new` — New recipe form (Server Action on submit)
- `/recipes/[id]` — Recipe detail (ingredients sidebar with checkbox + add-to-shopping, method steps, notes)
- `/recipes/[id]/edit` — Edit recipe form
- `/shopping` — Shopping list, grouped by recipe

The masthead wordmark links to `/`. The shopping pill in the masthead links to `/shopping`. Use `<Link prefetch>` everywhere — the design feels instant.

Each route gets a `loading.tsx` (skeleton) and `error.tsx` (friendly empty state with retry).

## File / folder layout (suggested)

```
src/
  app/
    layout.tsx                       # html/body, fonts, providers, masthead
    page.tsx                         # recipe list (Server Component)
    loading.tsx
    error.tsx
    recipes/
      new/page.tsx                   # form
      [id]/page.tsx                  # detail
      [id]/edit/page.tsx             # edit form
      [id]/loading.tsx
    shopping/
      page.tsx
    actions/
      recipes.ts                     # 'use server' — create/update/delete
      shopping.ts                    # 'use server' — add/toggle/remove/clear
  theme/
    theme.ts                         # design tokens
    GlobalStyle.ts                   # body, paper grain, ::selection, resets
    styled.d.ts                      # DefaultTheme augmentation
  providers/
    Providers.tsx                    # ThemeProvider + GlobalStyle + TweaksProvider
    StyledComponentsRegistry.tsx     # Next SSR setup for styled-components
    TweaksProvider.tsx               # Context: accent + titleScale, persisted
  data/
    store.ts                         # in-memory + JSON-file persistence
    queries.ts                       # getRecipes, getRecipe, getShopping (server-only)
  features/
    recipes/
      RecipeList.tsx                 # Server Component
      RecipeCard.tsx
      FilterBar.tsx                  # Client — pushes to searchParams
      SearchBar.tsx                  # Client — debounced router.replace
      RecipeDetail.tsx               # Server Component shell
      RecipeDetailClient.tsx         # ingredient checks + step done (useState)
      RecipeForm.tsx                 # Client — uses Server Action
      DeleteRecipeButton.tsx         # Client — inline confirm bar + action
    shopping/
      ShoppingList.tsx               # Server Component
      ShoppingItemRow.tsx            # Client — useOptimistic toggle/remove
      ShoppingPill.tsx               # masthead pill (Server, reads count)
    masthead/
      Masthead.tsx
      SettingsMenu.tsx               # accent picker + title scale
  components/
    ui/                              # Button, Chip, IconButton, ConfirmBar, EmptyState
    icons/                           # Icon.tsx — port every SVG from components.jsx
  lib/
    seed.ts
    types.ts                         # Recipe, Ingredient, Step, ShoppingItem
    uid.ts
```

Default to **Server Components**. Add `'use client'` only when a component needs interactivity (form inputs, hover-driven state, optimistic toggles, the settings menu).

## Theme tokens (port these exactly)

From the reference `:root` block:

```ts
export const lightTheme = {
  colors: {
    bg: '#FAF6F0',
    bgElev: '#FFFDF8',
    bgSunk: '#F2EBDD',
    ink: '#2A2622',
    inkSoft: '#5C5249',
    muted: '#8A7E72',
    hair: '#E8DFD2',
    hairStrong: '#D8CDB8',
    accent: 'oklch(0.62 0.13 38)',
    accentSoft: 'oklch(0.94 0.04 38)',
    accentInk: 'oklch(0.45 0.13 38)',
    danger: 'oklch(0.55 0.14 28)',
  },
  fonts: {
    serif: `'Fraunces', 'Cormorant Garamond', Georgia, serif`,
    sans: `'Inter', system-ui, sans-serif`,
    mono: `'JetBrains Mono', ui-monospace, monospace`,
  },
  radii: { sm: '4px', md: '8px', lg: '14px' },
  shadows: {
    sm: '0 1px 2px rgba(50, 35, 20, 0.04)',
    md: '0 4px 18px -8px rgba(50, 35, 20, 0.10), 0 1px 2px rgba(50, 35, 20, 0.04)',
    lg: '0 18px 40px -20px rgba(50, 35, 20, 0.18), 0 2px 6px rgba(50, 35, 20, 0.05)',
  },
  layout: { maxWidth: '1180px' },
  transitions: { fast: '160ms', med: '240ms' },
} as const;
```

Also expose `accentSage` and `accentPlum` variants matching the `body[data-accent="sage"]` and `body[data-accent="plum"]` overrides in `styles.css`. The `TweaksProvider` switches the active accent triplet at runtime — implement this by reading `accent` from context inside `<ThemeProvider>` and merging the override into the theme object (NOT by toggling a body data-attribute).

Load Google Fonts (Fraunces, Inter, JetBrains Mono) via `next/font/google` in `app/layout.tsx` and feed the resulting CSS variables into the theme's `fonts` strings.

## Data model (TypeScript)

```ts
export type RecipeType = 'starter' | 'main' | 'dessert' | 'italian' | 'asian';

export interface Ingredient { id: string; amount: string; name: string; }
export interface Step { id: string; order: number; description: string; }

export interface Recipe {
  id: string;
  title: string;
  types: RecipeType[];
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  notes: string;
  createdAt: string; // ISO
}

export interface ShoppingItem {
  id: string;
  recipeId: string;
  recipeTitle: string;
  ingredientId: string;
  name: string;
  amount: string;
  checked: boolean;
  addedAt: string;
}
```

## Server Actions (`src/app/actions/`)

Every mutation is a Server Action returning `void` or `{ ok: true } | { ok: false; error: string }`. Each one ends with the appropriate `revalidatePath` call so subsequent renders see fresh data.

```ts
// actions/recipes.ts
'use server';
export async function createRecipe(formData: FormData) { /* ... */ revalidatePath('/'); redirect(`/recipes/${id}`); }
export async function updateRecipe(id: string, formData: FormData) { /* ... */ revalidatePath('/'); revalidatePath(`/recipes/${id}`); }
export async function deleteRecipe(id: string) { /* ... */ revalidatePath('/'); redirect('/'); }

// actions/shopping.ts
'use server';
export async function addShoppingItems(recipeId: string, ingredientIds: string[]) { /* ... */ revalidatePath('/shopping'); revalidatePath(`/recipes/${recipeId}`); }
export async function toggleShoppingItem(itemId: string) { /* ... */ revalidatePath('/shopping'); }
export async function removeShoppingItem(itemId: string) { /* ... */ revalidatePath('/shopping'); }
export async function clearCheckedShopping() { /* ... */ revalidatePath('/shopping'); }
export async function clearAllShopping() { /* ... */ revalidatePath('/shopping'); }
```

Forms use the action directly: `<form action={createRecipe}>…</form>`. Use `useFormStatus` inside submit buttons for pending state and `useFormState` for inline error display.

## Client state (where really needed)

- **Recipe detail view** — ingredient check-off and step "done" toggles are ephemeral cooking aids. Keep them in `useState` inside `RecipeDetailClient.tsx`, scoped to the current recipe, optionally mirrored to `localStorage` keyed by recipe id.
- **TweaksProvider** — `accent` + `titleScale`. Hydrated from `localStorage` after mount; updates write back. Wraps `<ThemeProvider>` so theme switches are immediate.
- **Search/filter/sort** — URL search params (`useSearchParams` to read, `useRouter().replace` debounced to write). No client state library.
- **Shopping item toggle/remove** — wrap the Server Action in `useOptimistic` so the row updates instantly; on error, the optimistic state reverts on the next render.

## Components to build (1:1 with the reference)

Port every visual element from the reference. Each one is fully styled in `styles.css` — use it as your spec:

- **Masthead**: eyebrow ("Vol. 01 · Personal Edition"), serif wordmark with italic accent on "Kitchen", recipe count + last-edit date, **ShoppingPill** with badge count (states: default, has-items, is-active). Pill count is read server-side from `getShopping()`.
- **SearchBar** *(client)*: serif italic placeholder, search icon, live `count / total` badge, debounced URL update.
- **FilterBar** *(client)*: "All" + per-type chips with counts, sort dropdown — chips disable themselves when count is 0; chip-active uses ink background. Counts are passed in as props from the server.
- **RecipeCard**: numbered badge (`№ 01`), type badges, serif title, 2-line clamped description, footer with date + ingredient/step counts + animated arrow on hover.
- **RecipeDetail**: back link, **DeleteRecipeButton** with inline confirm bar (not a modal), edit link, hero with eyebrow/title/italic description, two-column body (sticky ingredients sidebar + method), ingredient row with check-off + quick-add to shopping (`+` icon → `✓` when on list, hover-to-remove), step list with click-to-mark-done, parsed notes (split on bullets/newlines, fall back to sentences).
- **RecipeForm** *(client)*: title input (large serif), multi-select type chips, description textarea (italic serif), dynamic ingredient rows (amount + name + remove), dynamic step rows (number + description + reorder up/down + remove), notes textarea, footer with Cancel + Save. Submits via Server Action; submit button reads `useFormStatus`.
- **ShoppingList**: hero with day-of-week date, large tally (X to buy · Y in the basket · Z recipes), grouped by recipe with title that links back to the recipe, per-item check / remove (optimistic), "Clear N checked" + "Empty list" actions.
- **EmptyStates**: list ("Your shelf is empty"), filtered ("Nothing matches those filters"), shopping ("Your basket is empty").
- **Icons**: port every icon from `components.jsx` (`Icon.Search`, `Icon.Plus`, `Icon.X`, `Icon.ArrowLeft`, `Icon.ArrowRight`, `Icon.Edit`, `Icon.Trash`, `Icon.Up`, `Icon.Down`, `Icon.Caret`, `Icon.Basket`, `Icon.Check`) as TSX components — keep the exact paths and stroke widths.

## Styling rules

- **Every styled component** must read from `theme.colors.*`, `theme.fonts.*`, etc. — no hex codes or magic numbers in component files.
- Reproduce the **paper-grain `body::before`** as part of `GlobalStyle`.
- Reproduce the **`fadeSlide` keyframe** and apply it to detail/form/shopping containers on mount.
- Preserve the **sticky ingredients sidebar** (`position: sticky; top: 32px;`) at ≥920px.
- Preserve every responsive breakpoint (`720px`, `920px`).
- Use `text-wrap: balance` on titles and `text-wrap: pretty` on body copy, just like the reference.
- Keep **`font-variation-settings`** on Fraunces (`'opsz'`, `'SOFT'`) — Fraunces is variable; the reference relies on this.
- Use real CSS hover states; do not gate them behind JS.

## Settings menu (replaces the in-design tweaks panel)

Skip the original tweaks panel — that was a design-environment affordance, not a product feature. Instead, add a small **Settings** dropdown in the masthead with:
- Accent picker: Terracotta / Sage / Plum
- Title scale slider (0.7 → 1.3)

Wire to `TweaksProvider`. Persist to `localStorage` after mount; render with the default values during SSR to avoid hydration mismatches, then sync once mounted.

## Mock data layer specifics

- `data/store.ts` is `'server-only'`. It keeps two arrays in module scope: `recipes` and `shopping`.
- On first call, hydrate from `.data/store.json` if present, else from `seed.ts`. Write back after every mutation.
- Wrap every read/write in `await new Promise(r => setTimeout(r, 120))` so Suspense fallbacks are visible in dev.
- Throw `Error('Recipe not found')` when an id doesn't resolve — let `error.tsx` handle it.
- Never import `data/store.ts` from a client component. The exposed surface is the Server Actions and the queries called from Server Components.

## Acceptance checklist

Before you finish, verify:

- [ ] Every screen in the reference renders identically in your build (compare side-by-side at 1280×800 and 375×800).
- [ ] Filter chips, search, and sort all interact correctly together — and survive a page reload via URL params.
- [ ] Adding an ingredient from the recipe detail to the shopping list updates the masthead pill count after revalidation; the in-row toggle uses `useOptimistic` so it feels instant.
- [ ] The shopping list groups items by recipe and links group titles back to the recipe.
- [ ] Editing a recipe pre-fills the form, and saving redirects back to the detail view.
- [ ] Deleting a recipe shows the inline confirm bar, then redirects to `/`.
- [ ] Refreshing the page preserves recipes, shopping list, accent, and title scale.
- [ ] No console errors or warnings (including the styled-components SSR mismatch warning — use the Next registry pattern).
- [ ] No "use client" on the root list/detail/shopping pages — they must remain Server Components.
- [ ] TypeScript: `tsc --noEmit` passes with `strict: true`.
- [ ] Lighthouse a11y ≥ 95.

## Build & run

```bash
npx create-next-app@latest kitchen-notebook --ts --app --no-tailwind --src-dir --import-alias "@/*"
cd kitchen-notebook
npm i styled-components
npm i -D @types/styled-components
```

Then build out the structure above. When done, `npm run dev` should boot a fully working app at `http://localhost:3000` that matches the attached design.

---

**Reference files attached:**
- `The Kitchen Notebook.html` — entry point
- `styles.css` — full token set + every component style (your styling spec)
- `app.jsx` — view orchestration, persistence, tweaks wiring
- `components.jsx` — every component's logic + icons
- `lib/seed.js` — seed recipe data
- `tweaks-panel.jsx` — tweaks panel (skip; replaced by Settings dropdown per the prompt)

Treat the CSS file as the source of truth for any visual question. If the CSS and the JSX disagree, follow the CSS.
