# Design

## Context

Greenfield: `backend/` is empty, and `frontend/` contains only `src/styles/kn-tokens.css` and illustration SVGs. The stack,
tenancy model and sign-in approach are fixed in `docs/architecture.md` (ADR-001 to ADR-005, ADR-009). See proposal.md
for scope and motivation and `specs/platform-foundation/spec.md` (PLT-01 to PLT-11) for the required behaviour.

## Goals / Non-Goals

**Goals:**

- One way to do each cross-cutting concern (security, tenancy, errors, i18n, API contract) that feature changes reuse
  without redesign.
- Prove the risky parts end to end: OIDC session sign-in through the dev proxy, CSRF with Angular, RLS with pooled
  connections.
- A local setup a new developer, or a coding agent, can start with a few commands.

**Non-Goals:**

- Bearer-JWT security chain (native app): `CurrentUser` is shaped for it, but the chain is not built.
- Application tables (`users`, `notebooks`, `memberships`, ...), the notebook access guard and role checks.
- Production deployment, container images, Keycloak theme, Google identity provider, UI component library.

## Decisions

### D1 Repository layout

```
api/openapi.yaml            contract, source of truth (ADR-011)
backend/                    Maven project, single module
frontend/                   Angular workspace (existing src/styles, src/assets kept)
frontend/e2e/               Playwright
infra/postgres/init/        role + database bootstrap for local Compose
infra/keycloak/             realm import (kitchen-notebook)
compose.yaml                infrastructure only
.env.example                local settings; copied to .env (gitignored)
docs/adr/                   one MADR file per ADR
.github/workflows/          CI
```

*Alternative:* a Maven multi-module or Nx monorepo. Rejected: one backend and one SPA don't need it.

### D2 Backend package layout (ADR-006 rejected)

Root package `app.kitchennotebook`:

```
shared/security      SecurityFilterChain, CurrentUser, 401 entry point, logout
shared/tenancy       TenantContext (set_config per transaction), tenant SQL helpers
shared/web           problem-details advice, message source, /api prefix
shared/persistence   base entity (UUIDv7 id, version, timestamps), auditing
accounts/ notebooks/ invitations/ recipes/ shopping/ media/   feature packages (empty, package-info only)
```

Inside a feature package: `api` (controller implementing the generated interface), `domain` (entities, services),
`persistence` (repositories). Feature packages may depend on `shared`, never on each other's internals; this is a
convention reviewed in PRs. A lightweight ArchUnit test enforces "`shared` does not depend on features".
*Alternative:* Spring Modulith (ADR-006) was rejected in favour of plain packages by convention.

### D3 Web sign-in: session chain only (ADR-009 accepted)

- `oauth2Login()` with the Keycloak registration `keycloak` (client `kn-web`, confidential, Authorization Code).
  Sign-in starts with a full-page navigation to `/oauth2/authorization/keycloak`; success redirects to `/`.
- `/api/**` uses an `HttpStatusEntryPoint(401)` that writes a problem-details body, so it never redirects (PLT-01).
  `/actuator/health` is public, with details hidden.
- Session: Spring Session JDBC in PostgreSQL. Tables are created by a Flyway migration (no auto-init). Cookie
  `KN_SESSION`: `HttpOnly`, `SameSite=Lax`, `Secure` from configuration (off only for local http) (PLT-02, PLT-05).
  The session holds the authentication only. OAuth2 tokens live in the server-side authorized-client store.
- CSRF: Spring Security's SPA support (`CookieCsrfTokenRepository` with a JS-readable `XSRF-TOKEN` cookie). Angular's
  `HttpClient` XSRF support sends `X-XSRF-TOKEN` for same-origin relative URLs (PLT-06).
- Sign-out: `POST /logout` (CSRF-protected) with `OidcClientInitiatedLogoutSuccessHandler`, which redirects to
  Keycloak's end-session endpoint and back to `/`. The SPA submits a small form with the CSRF token as a full-page
  navigation, because the response is a cross-origin redirect (PLT-04).
- `CurrentUser` (record: subject, email, emailVerified, displayName) is resolved by an argument resolver from the
  `OidcUser`. A later `Jwt` source plugs in behind the same resolver.
- `GET /api/me` is the only API operation in this change (PLT-03).

*Alternatives:* tokens in the SPA (option A) or a separate BFF (option C). See ADR-009.

### D4 One origin locally via the Angular dev-server proxy

`ng serve` on `localhost:4200` proxies `/api`, `/oauth2`, `/login/oauth2` and `/logout` to the backend on
`localhost:8080`. The backend's OAuth2 redirect URI is built from forwarded headers
(`server.forward-headers-strategy=framework`, proxy sets `X-Forwarded-Host`), so Keycloak redirects back to `:4200`.
Keycloak runs at `localhost:8180`, the same hostname for the browser and the backend, which avoids issuer mismatches.
*Alternative:* a Caddy proxy in Compose. Deferred until hosting (ADR-007) defines the production proxy.

### D5 Tenancy plumbing (ADR-004)

- **Roles:** `kn_owner` owns the schema and is used only by Flyway. `kn_app` (runtime) has DML grants only, is not the
  table owner and has no `BYPASSRLS`. Tenant tables also get `FORCE ROW LEVEL SECURITY` as a second guard.
- **Context:** `TenantContext` runs `select set_config('app.notebook_id', ?, true), set_config('app.user_id', ?, true)`
  on the transaction's connection. `is_local = true` is the parameterisable form of `SET LOCAL`, so values end with
  the transaction and never leak through the pool. It fails fast if no transaction is active.
- **Policy helper:** after a `SET LOCAL` the setting reverts to `''`, not `NULL`, on that connection, and `''::uuid`
  would error. A SQL function `kn_current_notebook_id()` returns
  `NULLIF(current_setting('app.notebook_id', true), '')::uuid`, so "no context" yields no rows (PLT-07).
- **Policy template** (documented for feature changes):
  `USING (notebook_id = kn_current_notebook_id()) WITH CHECK (notebook_id = kn_current_notebook_id())`.
- **Proof:** a test-only migration location (`src/test/resources/db/test-migration`) creates `rls_probe` with the
  standard policy. Testcontainers tests cover the four PLT-07 scenarios, including pool reuse with a pool of size 1.

*Alternative:* Hibernate filters or a `@TenantId` discriminator. These guard only the ORM path, not native SQL, so RLS
stays the safety net; a discriminator may still be added later for convenience.

### D6 Persistence (JPA)

Spring Data JPA, `ddl-auto=validate`, `open-in-view=false`, Flyway migrations in `db/migration` (`V1__baseline.sql`:
Spring Session tables and the tenant helper function). UUIDv7 primary keys generated by Hibernate, `@Version` for
optimistic locking in the base entity. *Alternative:* jOOQ. Rejected for now: more build machinery, and
`@Version` / repositories come for free with JPA; native SQL remains available for search.

### D7 Design-first contract with code generation (ADR-011)

- `api/openapi.yaml` (OpenAPI 3.1) is written by hand; server URL `/api`; shared `Problem` schema (RFC 9457). Each
  operation has an `operationId` and an `x-requirements` list (e.g. `[PLT-03]`) for traceability.
- **Backend:** OpenAPI Generator Maven plugin, `spring` generator, `interfaceOnly`, `useTags`, `skipDefaultInterface`
  (unimplemented operations fail compilation, PLT-09), Jakarta validation annotations, output under `target/` (not
  committed). Controllers implement the generated interfaces.
- **Frontend:** `ng-openapi-gen` generates services and models into `src/app/api/` (gitignored), run by the `prestart`
  / `prebuild` / `pretest` npm scripts.
- Feature changes edit `api/openapi.yaml` as their first task, so the contract is reviewed with the specs.

*Alternatives:* code-first with springdoc (the contract follows the code, against spec-first), or hand-written
controllers with contract tests (drift found only at test time).

### D8 Errors and API messages

`@RestControllerAdvice` extending `ResponseEntityExceptionHandler`. Problem `type` URIs follow
`urn:kn:problem:<slug>` (stable and not resolvable, so no hosting dependency). `title` and `detail` are resolved through
`MessageSource` from `messages.properties` (English); validation errors add an `errors` array of `{ field, message }`.
Unhandled exceptions are logged with a correlation id and answered with a generic 500 (PLT-08, PLT-10).

### D9 Frontend shell

- Angular 22 workspace in `frontend/`: standalone components, zoneless change detection, signals; strict TypeScript.
- Structure: `core/` (auth, HTTP setup), `layout/` (app shell), `shared/`, `features/` (empty).
- `AuthService` holds `me` as a signal loaded from `GET /api/me`. An auth guard sends unauthenticated users to
  `/oauth2/authorization/keycloak` with a full-page navigation. The shell shows a translated "Signed in as {email}" and a
  Sign out action. No product screens yet.
- `kn-tokens.css` is loaded globally; light/dark follow `prefers-color-scheme` as the tokens define. Plain components
  for now; ADR-010 (component library) stays open.
- PWA: `@angular/pwa` caches the app shell only. `ngsw-config.json` excludes `/api/**`, `/oauth2/**`, `/login/**` and
  `/logout` from navigation handling, so the service worker never answers the sign-in redirect with `index.html`.
- i18n: `@angular/localize`, source locale `en`, `ng extract-i18n` → `src/locale/messages.xlf`. CI fails if extraction
  changes the committed file (PLT-10). *Alternative:* runtime translation (Transloco). Not chosen: compile-time i18n is
  built in, and the language switch is not in v1.
- Tooling: npm, Vitest, angular-eslint, Prettier; Node version pinned in `.nvmrc`.

### D10 Local infrastructure

`compose.yaml` runs infrastructure only:

| Service | Port | Notes |
|---|---|---|
| postgres (18) | 5432 | init script creates `kitchen_notebook` (roles `kn_owner`, `kn_app`) and `keycloak` databases |
| keycloak (26.x) | 8180 | `start-dev --import-realm`, realm `kitchen-notebook`, Postgres-backed |
| mailpit | 1025 / 8025 | SMTP for Keycloak (and the API later) |
| minio | 9000 / 9001 | bucket `kn-media` created by a one-shot `mc` container |

Realm import: client `kn-web` (confidential, redirect `http://localhost:4200/login/oauth2/code/keycloak`, post-logout
`http://localhost:4200/`), verify email on, SMTP → Mailpit, two verified test users (`anna@example.com`,
`ben@example.com`). The client secret and test passwords use `${ENV}` placeholders filled from `.env`; values in
`.env.example` are local-only. The Google IdP is left out and comes with the ACC sign-in change. The backend reads
configuration from environment variables with local defaults (`application.yaml`) and optionally imports `../.env`.

### D11 Testing and CI

- Backend: JUnit 5, Testcontainers (PostgreSQL, Keycloak via `testcontainers-keycloak`) with `@ServiceConnection`
  where available. Tests are named after requirement IDs (`PLT07_rowsOfOtherNotebookInvisible`).
- Frontend: Vitest unit tests; Playwright `e2e/` with one test: sign in as Anna → shell shows her email → sign out.
- GitHub Actions: `backend` (Temurin 25, `mvn -B verify`), `frontend` (npm ci, generate client, lint, test, build,
  i18n check), `e2e` (compose up, start backend and `ng serve`, Playwright).

## Risks / Trade-offs

- [OpenAPI Generator or `ng-openapi-gen` lag behind Spring Boot 4 (Jackson 3, Jakarta) or Angular 22] → pin versions,
  verify with `GET /api/me` first; fall back to `typescript-angular` or adjusted generator options if needed.
- [`''` instead of `NULL` for a reset GUC breaks policies] → `kn_current_notebook_id()` helper plus the pool-reuse test.
- [Service worker intercepts OAuth navigations] → explicit `navigationUrls` exclusions, covered by the e2e test with a
  production build.
- [Redirect URI built for `:8080` instead of `:4200`] → forwarded headers from the dev proxy; e2e covers the round trip.
- [Shopping-list polling keeps sessions alive forever] → absolute session timeout set now; "Keep me signed in" mapping
  comes with ACC-05.
- [Committed dev credentials] → only placeholders in the realm file; local-only values in `.env.example`, clearly
  marked; no production secrets anywhere in the repo.
- [Convention-only module boundaries erode] → ArchUnit rule for `shared`, plus PR review; revisit ADR-006 if needed.

## Migration Plan

Greenfield, nothing to migrate. Rollback means reverting the change. The Flyway baseline (`V1`) is the first migration
that later changes build on.

## Open Questions

- Exact library versions (Spring Boot 4.x patch, Keycloak 26.x, Angular 22.x, generators) are pinned at
  implementation time to the latest stable releases.
