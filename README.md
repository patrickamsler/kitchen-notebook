# The Kitchen Notebook

A personal recipe book with a shopping list. Built with Next.js 14 App Router, TypeScript, and styled-components.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app is seeded with five example recipes on first run. Data persists across restarts via `.data/store.json`.

## Supabase Setup (`.env.local`)

This app connects to Supabase from `src/lib/supabase/server.ts` and expects these env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Create a local env file at the project root:

```bash
cat > .env.local <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EOF
```

Where to get the values in Supabase:

- URL: **Project Settings -> API -> Project URL**
- Anon key: **Project Settings -> API -> Project API keys -> anon public**

After saving `.env.local`, restart the dev server:

```bash
npm run dev
```

Optional (new Supabase project): run `supabase/schema.sql` first, then `supabase/seed.sql` in the Supabase SQL Editor.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Recipe list with search, filter chips, sort |
| `/recipes/new` | New recipe form |
| `/recipes/[id]` | Recipe detail with ingredients and method |
| `/recipes/[id]/edit` | Edit recipe form |
| `/shopping` | Shopping list grouped by recipe |