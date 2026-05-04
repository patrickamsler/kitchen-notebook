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

All styles use **styled-components** with a typed theme (`src/theme/styled.d.ts` augments `DefaultTheme`). Theme tokens live in `src/theme/theme.ts` — `buildTheme(accent, fontVars)` is called inside `ThemedApp` (a client component) so the theme updates live when the user changes accent in the Settings menu.

**Critical rule:** styled-components components that use `theme.*` must be in client components (`'use client'`). Server Components cannot access React Context, so theme-dependent styled-components will throw if placed in a Server Component. The pattern used here is: Server Component fetches data → passes props to a `*Shell` or `*Client` client component that does the styled-components rendering (see `Masthead.tsx` → `MastheadShell.tsx`).

The SSR style injection uses `src/providers/StyledComponentsRegistry.tsx` (the standard Next.js pattern). This must remain the outermost wrapper in `Providers.tsx`.

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

### Theme / accent switching

`TweaksProvider` holds `{ accent, titleScale }` in `useState`, hydrated from `localStorage` after mount. `ThemedApp` reads from this context and calls `buildTheme(accent, fontVars)` to rebuild the theme object on every accent change, which flows through `ThemeProvider` to all styled-components. The three accent variants (`terracotta`, `sage`, `plum`) are defined in `src/theme/theme.ts` as `accentTokens`.
