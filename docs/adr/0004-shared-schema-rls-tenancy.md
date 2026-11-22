---
status: accepted
date: 2026-11-22
---

# ADR-004 Shared schema + PostgreSQL RLS for tenancy

## Context and Problem Statement

A notebook is the tenant. How are notebooks isolated from each other in the database?

## Decision Outcome

Chosen option: "Shared schema with PostgreSQL row-level security": `notebook_id` on every tenant table, RLS policies
restricting rows to the notebook set with `SET LOCAL app.notebook_id` (and `app.user_id`) per transaction. The app
connects as a non-owner role without `BYPASSRLS`. RLS is the second safety net behind service-level authorisation.

### Consequences

- Good, because a bug in a query cannot leak another notebook's rows (quality goal 1, tenant isolation).
- Bad, because settings must be transaction-local to avoid leaking between pooled connections, and every tenant table
  needs a policy and RLS tests. See `docs/development/tenancy.md`.
