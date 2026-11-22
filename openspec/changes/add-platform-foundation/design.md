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
docs/development/           rules for developers and agents: backend, frontend, testing, tenancy
README.md                   developer entry point: quick start, setup, commands, repo map, workflow
AGENTS.md                   short agent entry point: links to README and docs/development, non-negotiables
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

**Inside a feature package** (example `recipes`):

```
recipes/
  api/            RecipeController implements generated RecipesApi; no logic beyond delegating
  service/        RecipeService (@Service, @Transactional) - the transaction boundary
                  RecipeMapper (@Component: entity -> generated DTO, DTO -> entity changes)
                  capability helpers needing collaborators (@Component, e.g. RecipeSoftDeletion)
  domain/         Recipe, Ingredient, Step (@Entity POJOs), value objects, domain exceptions
                  Recipes (final, static, pure helpers for Recipe, e.g. Recipes.scale(recipe, servings))
  persistence/    Spring Data repositories
```

**Entities and helpers:**

- **Entities are POJOs:** fields with JPA annotations, getters and setters, a protected no-arg constructor,
  `equals` / `hashCode` on the id. They contain no business logic.
- **Pure logic lives in a plural static helper** in `domain/`, named after the entity (`Notebook` → `Notebooks`,
  `Recipe` → `Recipes`). It is final with a private constructor, has only static methods, and does no I/O and no Spring
  (it is never a bean). It works only on entities and values passed in, so it is unit-testable without a context. A
  plural class name always means such a static helper, never a repository.
- **Logic that needs collaborators** (repositories, other services, clock, mail) is a `@Component` in `service/`, named
  for its capability (`NotebookOwnershipTransfer`, `InvitationTokenIssuer`). It runs inside the caller's transaction.
- **No `*Helper` / `*Utils` classes:** they tend to become dumping grounds.
- **Invariants** are changed only through helpers or services, not by calling setters directly from controllers or
  other features. With setter-based POJOs this is a review convention.

Generated API DTOs live in `app.kitchennotebook.api.model` (from `api/openapi.yaml`, see D7), and generated
interfaces in `app.kitchennotebook.api`.

**Layer rules:**

```
 HTTP --JSON--> controller --DTO--> service [@Transactional ...............] --> repository
                    ^                  |  entities live only in here        |
                    +------DTO---------+  service <-> service / helper:      |
                                          entities may be passed            |
                                       [.......................................]
```

- **Transaction boundary = public service methods.** Services carry `@Transactional` (class level, with
  `readOnly = true` on queries). Controllers, mappers called from controllers and the web layer never open
  transactions. `TenantContext` (D5) is set at the start of each service transaction.
- **Entities never cross the boundary.** Public service methods take and return generated API DTOs, IDs, primitives or
  `CurrentUser`, never entities. Inside the transaction, entities may be passed to other services, mappers and helpers
  (joining the same transaction). Mapping to DTOs happens inside the service, so lazy associations load within the
  transaction. `open-in-view=false` makes violations fail fast with `LazyInitializationException`.
- **Mappers** are hand-written `@Component`s in `service/`, so no new dependency is needed. MapStruct can be adopted
  later if mapping becomes repetitive.
- **The API works with DTOs.** The generated DTOs carry the Jackson annotations (`@JsonProperty`, nullability) and Jakarta
  validation annotations derived from the contract (`required`, `minLength`/`maxLength`, `pattern`,
  `minimum`/`maximum`). Field-level **input validation therefore happens on the DTOs**: the generated interfaces mark
  request bodies `@Valid`, and failures become 400 problem details (D8). Constraints are added in `api/openapi.yaml`,
  never by editing generated code.
- **Business rules stay in the service.** Rules needing data or state (e.g. type names unique per notebook, last
  owned notebook) are checked in the service and raised as domain exceptions, which the advice maps to problem details.
- **Repositories** are used only by services in the same feature.
- **Cross-feature calls** go through another feature's public service (DTOs or IDs at its public methods; entities only
  when called inside an ongoing transaction). Never call another feature's repository.

**Enforcement:** ArchUnit tests check that (1) `shared` does not depend on feature packages, (2) `api` packages do not
depend on `domain` or `persistence`, (3) repositories are accessed only from `service` packages of the same feature,
(4) public methods of `@Service` classes do not return `@Entity` types, and (5) `@Transactional` appears only in
`service` packages and `shared/tenancy`, (6) classes in `domain` packages carry no Spring stereotype annotations, and
(7) no class name ends in `Helper` or `Utils`.

*Alternatives:* Spring Modulith (ADR-006) was rejected in favour of plain packages by convention. Separate service-level
records mapped to API DTOs in the controller were rejected: a second model and double mapping without benefit while
the API is the only consumer.

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
- **Who creates what:** roles and databases are cluster-level objects, created by the init script in
  `infra/postgres/init/` (D10). Everything inside the database (schema, tables, policies, functions, and the
  `kn_app` grants via `ALTER DEFAULT PRIVILEGES`) is created by Flyway running as `kn_owner`. Testcontainers reuses
  the same init script, so Compose, the backend tests and CI share one definition of the roles. In production
  (managed PostgreSQL) the hosting setup (ADR-007) creates the same roles; the script documents what is required.
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

**Queries** (rules for feature changes; this change has no application queries yet):

| Topic | Rule |
|---|---|
| Tenant filter | Every query on a tenant table takes `notebookId` explicitly and filters on it. Service-level authorisation comes first; RLS (D5) is the second safety net, not the only one |
| Simple lookups | Short derived query methods only: `findByIdAndNotebookId`, `existsByNotebookIdAndNameIgnoreCase` |
| Joins, fetches, more than ~2 conditions | `@Query` with JPQL in a text block and named parameters; no long derived method names |
| PostgreSQL-specific features | `@Query(nativeQuery = true)` for search (REC-03: ILIKE / `pg_trgm` over titles, descriptions, ingredients) and bulk purges |
| List and read views | Record projections (`select new ...RecipeCardRow(...)`) instead of loading entities; mapped to API DTOs in the service |
| Fetching | Associations `LAZY`, never `EAGER`; load what the mapper needs with `@EntityGraph` or `join fetch` (no N+1) |
| Bulk writes | `@Modifying(clearAutomatically = true)`, e.g. removing the shopping items of a deleted recipe (REC-32) |
| Soft delete | Filtered explicitly in queries (`deletedAt is null`), not with `@SQLRestriction`, because undo and purge must see deleted rows |
| Not used | Criteria API, Specifications, Querydsl; reconsider only if many dynamic filters appear |
| Tests | Every custom query has an `*IT` against real PostgreSQL (Testcontainers), never H2 |

*Alternative:* relying on RLS alone for tenant filtering. Rejected: a missing policy, a forgotten `FORCE` or a connection
running as the owner would leak data silently, which contradicts quality goal 1 (tenant isolation).

### D7 Design-first contract with code generation (ADR-011)

- `api/openapi.yaml` (OpenAPI 3.1) is written by hand; server URL `/api`; shared `Problem` schema (RFC 9457). Each
  operation has an `operationId` and an `x-requirements` list (e.g. `[PLT-03]`) for traceability.
- **Backend:** OpenAPI Generator Maven plugin, `spring` generator, `interfaceOnly`, `useTags`, `skipDefaultInterface`,
  `useBeanValidation`, packages `app.kitchennotebook.api` / `app.kitchennotebook.api.model`
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

**PostgreSQL init script.** Compose mounts `infra/postgres/init/` read-only at `/docker-entrypoint-initdb.d`. The
official image runs the files there in alphabetical order, as the superuser, **only on the first start with an empty
data volume**; later starts skip them. The scripts are `.sh` (e.g. `01-roles-and-databases.sh` running `psql` with
`ON_ERROR_STOP=1`), so passwords come from `.env` (`KN_OWNER_PASSWORD`, `KN_APP_PASSWORD`, `KEYCLOAK_DB_PASSWORD`)
and are never committed. They create:

- the roles `kn_owner` (login) and `kn_app` (login, `NOBYPASSRLS`, `NOSUPERUSER`),
- the database `kitchen_notebook` owned by `kn_owner`, with `CONNECT` for `kn_app`,
- the database `keycloak` with its own user.

Changing a script requires resetting the local database: `docker compose down -v && docker compose up -d`, which
deletes local data. Testcontainers copies the same directory into its container's `/docker-entrypoint-initdb.d`
with the passwords as container environment variables (D5, D11).

### D11 Testing and CI

- Backend: JUnit 5, Testcontainers (PostgreSQL, Keycloak via `testcontainers-keycloak`) with `@ServiceConnection`
  where available. Unit tests (`*Test`, no Spring context) run with Surefire; integration tests (`*IT`, Spring and
  Testcontainers) run with Failsafe, so `mvn test` stays fast and `mvn verify` runs both.
- Frontend: Vitest unit tests; Playwright `e2e/` with one test: sign in as Anna → shell shows her email → sign out.
- **Test naming** (full rules in `docs/development/testing.md`; requirement ID first, so searching for an ID finds
  spec, contract and tests):

  ```
  JUnit       class  <ClassUnderTest>Test | <Feature><Topic>IT   (RLS: <Table>RlsIT)
              method <REQID>_<behaviour>   PLT07_rowsOfOtherNotebookInvisible
              @DisplayName("PLT-07 rows of another notebook are invisible")
              without a requirement:  <behaviour>_when<Condition>
  Vitest      <name>.spec.ts next to the source; describe('<Unit>'); it('REC-02 shows the creator avatar')
  Playwright  e2e/<feature>.spec.ts; test('SHOP-03 ticking moves an item to In the basket', { tag: ['@SHOP-03'] })
  All         one scenario = one test; body structured // given // when // then
  ```
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
