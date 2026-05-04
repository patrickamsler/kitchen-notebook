# The Kitchen Notebook

A personal recipe book with a shopping list. Built with Next.js 14 App Router, TypeScript, and styled-components.

## Features

- **Recipe list** — searchable, filterable by type (starter, main, dessert, italian, asian), sortable
- **Recipe detail** — ingredient check-off during cooking, one-tap add to shopping list
- **Recipe form** — create and edit recipes with dynamic ingredient and step rows
- **Shopping list** — grouped by recipe, optimistic toggling, clear checked / empty all
- **Settings** — accent colour (Terracotta / Sage / Plum) and title scale, persisted to localStorage

## Stack

- **Next.js 16** with App Router and TypeScript strict mode
- **styled-components v6** with SSR registry and full ThemeProvider typing
- **Server Components** for data fetching; **Server Actions** for mutations
- **useOptimistic** for instant shopping list toggles
- **File-based persistence** — data stored in `.data/store.json`, seeded on first run
- **Google Fonts** — Fraunces (variable, serif), Inter (sans), JetBrains Mono

## Routes

| Route | Description |
|-------|-------------|
| `/` | Recipe list with search, filter chips, sort |
| `/recipes/new` | New recipe form |
| `/recipes/[id]` | Recipe detail with ingredients and method |
| `/recipes/[id]/edit` | Edit recipe form |
| `/shopping` | Shopping list grouped by recipe |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app is seeded with five example recipes on first run. Data persists across restarts via `.data/store.json`.

## Project Structure

```
src/
  app/                    # Next.js App Router pages + Server Actions
    actions/              # recipes.ts, shopping.ts ('use server')
    recipes/[id]/         # detail + edit pages
    shopping/             # shopping list page
  data/
    store.ts              # in-memory + JSON-file persistence (server-only)
  features/
    masthead/             # Masthead (server), MastheadShell (client), SettingsMenu
    recipes/              # RecipeList, RecipeCard, RecipeForm, RecipeDetailClient, FilterBar, SearchBar
    shopping/             # ShoppingList, ShoppingItemRow, ShoppingPill
  lib/
    types.ts              # Recipe, Ingredient, Step, ShoppingItem, Tweaks
    seed.ts               # Five example recipes
    uid.ts                # Random ID helper
  providers/
    Providers.tsx          # ThemeProvider + GlobalStyle + TweaksProvider
    StyledComponentsRegistry.tsx  # SSR style injection
    TweaksProvider.tsx     # Accent + title scale context
  theme/
    theme.ts              # Design tokens (colors, fonts, radii, shadows)
    GlobalStyle.ts        # Body resets, paper grain, fadeSlide keyframe
    styled.d.ts           # DefaultTheme augmentation
  components/
    icons/Icon.tsx        # All SVG icons as TSX components
    ui/                   # Button, IconButton, EmptyState
```

## Design Tokens

The design uses a warm, paper-like palette with three accent variants:

- **Terracotta** (default) — `oklch(0.62 0.13 38)`
- **Sage** — `oklch(0.55 0.09 150)`
- **Plum** — `oklch(0.48 0.12 340)`

Typography uses Fraunces (a variable serif with `opsz` and `SOFT` axes) for display text, Inter for UI, and JetBrains Mono for metadata and labels.
