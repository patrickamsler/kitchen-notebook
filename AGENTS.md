# AGENTS instructions

The Kitchen Notebook: a multi-tenant recipe app (Angular 22 PWA, Spring Boot 4 / Java 25, PostgreSQL with RLS,
Keycloak). A notebook is the tenant.

## Where to look

- [README.md](README.md): setup, local stack, commands, repository map and how work happens. Do not duplicate it here.
- Read before working in an area: [backend](docs/development/backend.md), [frontend](docs/development/frontend.md),
  [testing](docs/development/testing.md), [tenancy](docs/development/tenancy.md).
- Architecture and decisions: [docs/architecture.md](docs/architecture.md), [docs/adr/](docs/adr/). Look and layout:
  [docs/design/design-system.md](docs/design/design-system.md). Specs and changes: `openspec/`.

## Non-negotiables

- Tenant tables: queries filter on `notebookId` explicitly, and every tenant table has RLS (`ENABLE` + `FORCE`, the
  standard policy) plus RLS tests.
- Entities never cross the service boundary: public service methods take and return DTOs, IDs or primitives.
- Contract first: change `api/openapi.yaml` before the code; never edit or commit generated code.
- All user-facing text comes from translation files (`messages.xlf`, `messages.properties`).
- UI uses only tokens from `frontend/src/styles/kn-tokens.css`; 48 px touch targets on mobile; light and dark.
- Tests are named after requirement IDs (e.g. `PLT07_rowsOfOtherNotebookInvisible`, `it('REC-02 …')`).

## Branches and commits

- Never commit to `main`. Work on `change/<change-name>` (small fixes: `fix/<topic>`).
- Commit only when asked.

## Boundaries

* **Ask first**
  * Large refactors.
  * New dependencies with broad impact.
  * Destructive data or migration changes.
* **Never**
  * Commit secrets, credentials, or tokens.
  * Commit in the authors name unless explicitly told to do so.
  * Use destructive git operations unless explicitly requested.
