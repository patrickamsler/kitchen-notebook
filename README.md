# The Kitchen Notebook

A personal recipe book with a shopping list. Built with Next.js 14 App Router, TypeScript, and styled-components.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app is seeded with five example recipes on first run. Data persists across restarts via `.data/store.json`.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Recipe list with search, filter chips, sort |
| `/recipes/new` | New recipe form |
| `/recipes/[id]` | Recipe detail with ingredients and method |
| `/recipes/[id]/edit` | Edit recipe form |
| `/shopping` | Shopping list grouped by recipe |