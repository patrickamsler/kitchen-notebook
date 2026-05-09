# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Important:** This project uses Next.js 16, which has breaking changes from earlier versions. Read `node_modules/next/dist/docs/` before writing code if unsure about an API.

## Commands

```bash
npm run dev       # start dev server at localhost:3000
npm run build     # production build (also runs TypeScript check)
npm run lint      # ESLint
node node_modules/typescript/lib/_tsc.js --noEmit  # TypeScript-only check (npx tsc is broken in this env)
```

No test suite exists yet.

## Architecture

### Data flow

All data lives in `.data/store.json` (gitignored), seeded from `src/lib/seed.ts` on first run. `src/data/store.ts` is the **only** file that touches the filesystem — it is `server-only` and keeps an in-memory singleton to avoid redundant disk reads within a request.

Pages and Server Actions call `store.ts` directly. Client components never import `store.ts`; they receive data as props from Server Components or trigger mutations via Server Actions in `src/app/actions/`.

After every mutation, Server Actions call `revalidatePath()` to invalidate the Next.js page cache so the next render sees fresh data.

### Styling

All styles use **CSS Modules (SCSS)**. Each component has a co-located `.module.scss` file; classes are imported as a JS object and applied via `className`.

Global design tokens are CSS custom properties defined in `src/app/globals.scss` (colors, fonts, radii, shadows, transitions). Layout/breakpoint constants live in `src/styles/_tokens.scss`; media-query mixins (`up`, `down`) live in `src/styles/_mq.scss`.

The three accent variants (`terracotta`, `sage`, `plum`) are defined in `globals.scss` as `[data-accent="…"]` selectors. Component styles reference them via `var(--color-accent)` etc.

`src/theme/theme.ts` still defines `accentTokens` and `buildTheme()` (used for type definitions), but styling at runtime is driven entirely by CSS custom properties — no JS theme object flows through React context.

### Client vs Server split

| File | Type | Why |
|------|------|-----|
| `app/page.tsx` | Server | Reads search params, fetches + filters recipes |
| `app/recipes/[id]/page.tsx` | Server | Fetches recipe + shopping items |
| `features/masthead/Masthead.tsx` | Server | Fetches recipe count + shopping count |
| `features/masthead/MastheadShell.tsx` | Client | Renders themed masthead HTML |
| `features/recipes/RecipeList.tsx` | Client | Uses `useSearchParams` indirectly via children |
| `features/recipes/RecipeDetailClient.tsx` | Client | Ingredient check-off, step done, optimistic shopping toggle, `useTweaks()` |
| `features/recipes/RecipeForm.tsx` | Client | Controlled form state, calls Server Actions |
| `features/shopping/ShoppingItemRow.tsx` | Client | `useOptimistic` toggle/remove |
| `providers/TweaksProvider.tsx` | Client | Accent + titleScale context, localStorage sync |

### URL-driven state

Search, filter, and sort on the recipe list are stored in URL search params (`?q=`, `?type=`, `?sort=`). The server page reads them and passes pre-filtered data down — no client-side filtering. `FilterBar` and `SearchBar` update the URL via `router.replace()`.