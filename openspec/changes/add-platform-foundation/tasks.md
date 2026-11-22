# Tasks

## 1. Architecture records and project conventions

- [x] 1.1 Create `docs/adr/template.md` (MADR) and move ADR-001 to ADR-010 out of `docs/architecture.md` into `docs/adr/NNNN-<slug>.md`, keeping their content; verify every former ADR text exists in exactly one file
- [x] 1.2 Mark ADR-006 (Spring Modulith) as Rejected with the reason "plain packages by convention", and ADR-009 as Accepted, noting that the web session chain comes first and the JWT chain later; verify the status lines
- [x] 1.3 Add `docs/adr/0011-design-first-openapi-codegen.md` (contract written by hand; Spring interfaces and DTOs plus Angular client generated; springdoc and contract-test alternatives) and verify it follows the template
- [x] 1.4 Turn `docs/architecture.md` §10 into an index table (ID, title, status, link) and update §4, §8 and §9 to the decisions in design.md (Maven, JPA, no Modulith, codegen); verify all links resolve
- [x] 1.5 Update `openspec/config.yaml`: the design rule records ADRs as `docs/adr/NNNN-*.md` linked from the §10 index, the context lists the `PLT` requirement prefix and ADR-009 as accepted; verify with `openspec validate add-platform-foundation`

## 2. Local infrastructure

- [x] 2.1 Add `.env.example` (DB, Keycloak, client secret, test-user passwords, MinIO, Mailpit; local-only values, clearly marked) and verify `.env` stays gitignored
- [x] 2.2 Add `infra/postgres/init/01-roles-and-databases.sh` (`psql` with `ON_ERROR_STOP=1`, passwords from env) creating roles `kn_owner` and `kn_app` (login, `NOBYPASSRLS`, no ownership), the `kitchen_notebook` database owned by `kn_owner` with `CONNECT` for `kn_app`, and the `keycloak` database and user; verify after `docker compose down -v && docker compose up -d` with `psql` that `kn_app` has `rolbypassrls = false` and can connect
- [x] 2.3 Add `infra/keycloak/realm-kitchen-notebook.json`: client `kn-web` (confidential, redirect and post-logout URIs for `localhost:4200`), verify email on, SMTP → Mailpit, verified test users `anna@example.com` and `ben@example.com`, `${ENV}` placeholders for secrets; verify the realm imports on start
- [x] 2.4 Add `compose.yaml` with postgres 18, keycloak 26.x (`start-dev --import-realm`, port 8180), mailpit, minio, and a one-shot bucket `kn-media` creator; verify `docker compose up -d` gets all services healthy
- [x] 2.5 PLT-11 emails caught locally: trigger "forgot password" for Anna in Keycloak and verify the mail appears in Mailpit (localhost:8025)
- [x] 2.6 Write the `README.md` sections "Quick start" and "Local setup" (prerequisites: Docker, Java 25, Node LTS from `.nvmrc`; copy `.env.example`; `docker compose up -d`; service URLs and test users; init scripts run only on an empty volume, reset with `docker compose down -v`, which deletes local data) and verify by following them on a clean checkout

## 3. API contract

- [x] 3.1 Write `api/openapi.yaml` (OpenAPI 3.1, server `/api`): `Problem` schema (RFC 9457 with `errors[]`), `CurrentUser` schema, `GET /me` (`operationId: getCurrentUser`, `x-requirements: [PLT-03]`, responses 200 / 401); verify it passes an OpenAPI 3.1 linter (e.g. Redocly CLI) in CI

## 4. Backend shell

- [x] 4.1 Create the Maven project in `backend/` (wrapper, Java 25, Spring Boot 4.x: Web, Security, OAuth2 Client, Session JDBC, Data JPA, Validation, Actuator, Flyway, PostgreSQL, Testcontainers, ArchUnit; Surefire for `*Test`, Failsafe for `*IT`) and verify `./mvnw -B verify` succeeds and runs both test kinds
- [x] 4.2 Configure the OpenAPI Generator Maven plugin (`spring`, `interfaceOnly`, `useTags`, `skipDefaultInterface`, Jakarta validation, output in `target/`) against `../api/openapi.yaml`; verify PLT-09 by a build that fails while `MeApi` is unimplemented
- [x] 4.3 Create the package layout from design D2 (`shared/{security,tenancy,web,persistence}`, empty feature packages with `package-info.java`) and an `ArchitectureTest` with the seven ArchUnit rules from D2: `shared` is independent of features; `api` doesn't use `domain` / `persistence`; repositories only from the same feature's `service`; public `@Service` methods return no `@Entity`; `@Transactional` only in `service` and `shared/tenancy`; no Spring stereotypes in `domain`; no `*Helper` / `*Utils` classes. Verify each rule fails against a deliberately violating fixture class and passes on the real code
- [x] 4.4 Write `docs/development/backend.md` (D2 layering: transaction boundary, DTOs at the API, validation on DTOs, entities as POJOs, `<Entity>s` static helpers, capability-named `@Component` helpers, the ArchUnit rules; D6 queries: explicit `notebookId` filter, derived methods vs JPQL text blocks vs native SQL, projections, fetching, soft delete) and `docs/development/testing.md` (D11: JUnit `*Test` / `*IT`, `<REQID>_<behaviour>` with `@DisplayName("<REQ-ID> …")`, Vitest `it('<REQ-ID> …')`, Playwright `test('<REQ-ID> …', { tag: ['@<REQ-ID>'] })`, given/when/then, `*IT` per custom query, Testcontainers only); verify every PLT test in this change follows `testing.md`
- [x] 4.5 Configure `application.yaml` (env vars with local defaults, optional import of `../.env`, `ddl-auto=validate`, `open-in-view=false`, JSON logging, Actuator health only with details hidden, `server.forward-headers-strategy=framework`) and verify the app starts against Compose
- [x] 4.6 Add Flyway `V1__baseline.sql` (Spring Session JDBC tables, `kn_current_notebook_id()` / `kn_current_user_id()` helpers, default grants for `kn_app`). Flyway runs as `kn_owner`, the app as `kn_app`. Add the shared Testcontainers configuration (PostgreSQL 18 that copies `infra/postgres/init/` into `/docker-entrypoint-initdb.d`, with passwords as container env; Flyway as `kn_owner`, datasource as `kn_app`) and verify the migration on a fresh container
- [x] 4.7 Add the base entity in `shared/persistence` (UUIDv7 id, `@Version`, created/updated timestamps) and verify with a test-only entity that the id is generated and the version increments
- [x] 4.8 Implement problem-details handling (`ResponseEntityExceptionHandler` advice, `urn:kn:problem:<slug>` types, `title` / `detail` from `messages.properties`, `errors[]` for validation, generic 500 with correlation id); verify with tests `PLT08_validationErrorListsFields`, `PLT08_unexpectedErrorHidesInternals` and `PLT10_apiMessageFromBundle`

## 5. Web sign-in and session (ADR-009)

- [x] 5.1 Configure the session `SecurityFilterChain`: `oauth2Login` with Keycloak registration `kn-web`, success redirect `/`, 401 problem-details entry point for `/api/**`, public `/actuator/health`; verify with tests `PLT01_apiWithoutSessionReturns401` and `PLT01_healthIsPublic`
- [x] 5.2 Configure Spring Session JDBC (`KN_SESSION` cookie: `HttpOnly`, `SameSite=Lax`, `Secure` via property, absolute timeout) and verify with test `PLT05_sessionValidAfterRestart` (two application contexts sharing one database)
- [x] 5.3 Enable SPA CSRF (`XSRF-TOKEN` cookie, `X-XSRF-TOKEN` header) and verify with tests `PLT06_postWithoutCsrfReturns403` and `PLT06_postWithCsrfAccepted`
- [x] 5.4 Implement `CurrentUser` and an injectable `CurrentUserProvider` (from `OidcUser`, shaped for a later `Jwt` source; no argument resolver, generated interfaces take no extra parameters) and `MeController implements MeApi`; verify with test `PLT03_meReturnsSignedInIdentity`
- [x] 5.5 Implement sign-out (`POST /logout`, invalidate the session, `OidcClientInitiatedLogoutSuccessHandler` to `/`) and verify with test `PLT04_signOutInvalidatesSession`
- [x] 5.6 Add a Testcontainers Keycloak integration test that signs in through the real Authorization Code flow, calls `/api/me` and asserts no token appears in cookies or the response; verify `PLT02_signInIssuesSessionCookieOnly` passes

## 6. Tenancy plumbing (ADR-004)

- [x] 6.1 Implement `TenantContext` in `shared/tenancy` (`set_config(..., true)` for `app.notebook_id` and `app.user_id`; fails fast outside a transaction) and verify with a unit test for the no-transaction case
- [x] 6.2 Add a test-only migration location with table `rls_probe(id, notebook_id, label)`, `ENABLE` + `FORCE ROW LEVEL SECURITY` and the standard policy from design D5; verify the migration runs only in tests
- [x] 6.3 Write RLS tests running as `kn_app` on the shared Testcontainers configuration from 4.6: `PLT07_rowsOfOtherNotebookInvisible`, `PLT07_noTenantContextNoRows`, `PLT07_writeIntoOtherNotebookRejected`, `PLT07_contextDoesNotLeakAcrossPooledConnections` (pool size 1); verify all pass and that Flyway ran as `kn_owner`
- [x] 6.4 Write `docs/development/tenancy.md` (roles and who creates what, `TenantContext` usage, the tenant-table recipe: columns, policy template, `FORCE`, grants, required RLS tests) and verify it matches the `rls_probe` migration

## 7. Frontend shell

- [x] 7.1 Create the Angular 22 workspace in `frontend/` (standalone, zoneless, strict, npm, `.nvmrc`), keeping `src/styles/kn-tokens.css` and `src/assets/illustrations/`; verify `npm run build` succeeds and the assets are in the build output
- [x] 7.2 Add angular-eslint, Prettier and Vitest; verify `npm run lint` and `npm test` pass
- [x] 7.3 Add `ng-openapi-gen` generating into `src/app/api/` (gitignored) from `../api/openapi.yaml` via `prestart` / `prebuild` / `pretest` scripts; verify a clean checkout builds without committed generated code
- [x] 7.4 Add `proxy.conf.json` (`/api`, `/oauth2`, `/login/oauth2`, `/logout` → `localhost:8080`, `X-Forwarded-Host` preserved) and verify `GET /api/me` through `:4200` returns 401 problem details while signed out
- [x] 7.5 Set up `@angular/localize` (source locale `en`, `src/locale/messages.xlf`) and an `i18n:check` script that fails when extraction changes the committed file; verify PLT-10 by adding an unmarked string and seeing the check fail
- [x] 7.6 Implement `core/auth` (`AuthService` with a `me` signal from the generated client, auth guard redirecting to `/oauth2/authorization/keycloak`, sign-out form POST with the XSRF token) with Vitest tests for guard and service; verify the tests pass
- [x] 7.7 Implement the placeholder app shell in `layout/`: translated "Signed in as {email}" and Sign out, styled only with `kn-tokens.css` tokens, 48 px touch targets on mobile, light and dark; verify by eye in both color schemes at 390 px and 1280 px
- [x] 7.8 Add `@angular/pwa` with app-shell-only caching and `navigationUrls` excluding `/api/**`, `/oauth2/**`, `/login/**` and `/logout`; verify that sign-in still works with a production build served through the proxy
- [x] 7.9 Write `docs/development/frontend.md` (folder structure `core/` `layout/` `shared/` `features/`, generated API client only and never hand-written HTTP calls, signals, i18n marking and `i18n:check`, only `kn-tokens.css` tokens, 48 px touch targets on mobile, light and dark, the PWA navigation exclusions) and verify it matches the shell built in 7.6–7.8

## 8. End-to-end and CI

- [x] 8.1 Scaffold Playwright in `frontend/e2e/` and write `PLT02_PLT04_signInShowsEmailAndSignOut` (sign in as Anna at Keycloak → shell shows her email → sign out → `/api/me` returns 401); verify it passes locally
- [ ] 8.2 Add GitHub Actions workflows: `backend` (Temurin 25, `./mvnw -B verify`), `frontend` (`npm ci`, lint, test, build, `i18n:check`, OpenAPI lint), `e2e` (compose up, backend, `ng serve`, Playwright); verify all three jobs are green on a PR
- [x] 8.3 Write the rest of `README.md` for developers: what the Kitchen Notebook is, "Commands" (start infra, run backend, run frontend, generate the client, unit and integration tests, e2e, lint, i18n check), repository map (`api/`, `backend/`, `frontend/`, `infra/`, `compose.yaml`, `docs/`, `docs/adr/`, `docs/development/`, `openspec/`), how work happens (one OpenSpec change = one branch `change/<change-name>` (small fixes `fix/<topic>`) = one pull request; propose → apply → review with CI green and tasks checked → `openspec archive` as the last commit on the branch → squash merge into `main` with the title `<type>: <summary> (<change-name>)` in Conventional Commits style and a body with the "Why" and the requirement IDs; contract-first API changes), and links to `docs/`; verify each command runs as written and all links resolve
- [x] 8.4 Rewrite `AGENTS.md` to be short (about 40 lines): one-line project summary; pointers to `README.md` for setup and commands and to `docs/development/{backend,frontend,testing,tenancy}.md` to read before working in that area; the non-negotiables (explicit `notebookId` + RLS for tenant tables, no entities across the service boundary, contract-first `api/openapi.yaml`, all text in translation files, only `kn-tokens.css` tokens, tests named after requirement IDs); the branch rule (never commit to `main`; work on `change/<change-name>`; commit only when asked); the existing Boundaries section. Remove the TODO sections. Verify it has no duplicated setup or command detail
- [ ] 8.5 Configure the GitHub repository: squash merge only (merge commits and rebase off), delete head branches after merge, branch protection on `main` (pull request required, `backend`, `frontend` and `e2e` checks required, no direct pushes); verify with `gh api repos/{owner}/{repo}` and `gh api repos/{owner}/{repo}/branches/main/protection`

## 9. Integration check

- [x] 9.1 PLT-11 fresh clone to signed-in user: on a clean clone, follow only the `README.md` quick start, sign in as the documented test user and verify the shell shows the email; fix any documentation gaps found

## Workflow follow-up

- After review and green CI, run `openspec archive add-platform-foundation` as the last commit on the branch
  `change/add-platform-foundation`; `platform-foundation` becomes the first main spec under `openspec/specs/`.
- Squash merge into `main` with the title `feat: add platform foundation (add-platform-foundation)` and a body with the
  "Why" and PLT-01 to PLT-11.
