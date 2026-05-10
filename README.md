# The Kitchen Notebook

A personal recipe book with a shopping list. Built with Next.js 14 App Router, TypeScript, and styled-components.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app is seeded with five example recipes on first run. Data persists across restarts via `.data/store.json`.

### Supabase Setup

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

```bash
npm run dev
```

Optional (new Supabase project): run `supabase/schema.sql` first, then `supabase/seed.sql` in the Supabase SQL Editor.

### Authentication

Reads are open to anyone; mutations (create/edit/delete) are gated behind a Supabase login. There is no public sign-up — accounts are provisioned manually.

**Supabase dashboard steps:**

1. **Authentication → Providers → Email**: enable email + password. Disable "Enable new user signups" (so only manually-provisioned accounts can log in).
2. **Authentication → Users → Add user**: create your account(s) with email + password. (Use "Auto Confirm User" if email confirmation is off.)
3. **Authentication → URL Configuration**: set the Site URL to your prod domain and add `http://localhost:3000` under "Additional Redirect URLs" for dev.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Recipe list with search, filter chips, sort |
| `/login` | Email + password sign-in |
| `/recipes/new` | New recipe form (auth required) |
| `/recipes/[id]` | Recipe detail with ingredients and method |
| `/recipes/[id]/edit` | Edit recipe form (auth required) |
| `/shopping` | Shopping list grouped by recipe |