# Proposal

## Why

The repository has specs and designs but no running code: `backend/` is empty and `frontend/` holds only tokens and
illustrations. Every v1 feature (ACC, NB, INV, REC, SHOP, SET) depends on the same plumbing: sign-in through Keycloak,
a session cookie, tenant isolation with PostgreSQL RLS, an OpenAPI contract with generated code, i18n, and a
reproducible local stack. Building that plumbing once, as a walking skeleton proven end to end, lets every following
change add only feature behaviour, and it tackles the riskiest parts of the architecture (risks §11) first.

## What Changes

- **Local development stack:** Docker Compose runs the infrastructure only. Backend and frontend run natively; the
  Angular dev-server proxy gives one origin for the SPA and API. `.env.example` and one-command start-up.
  - **PostgreSQL:** the app database, plus a separate database for Keycloak.
  - **Keycloak with an imported `kitchen-notebook` realm:** the identity provider that owns accounts, passwords, email
    verification and password reset. A realm is Keycloak's isolated space of users, clients and settings. Instead of
    clicking it together in the admin console, the realm is committed as a JSON file and imported on start-up. Every
    developer and CI run therefore gets the same setup: the `kn-web` client, the sign-in rules and verified test users.
  - **Mailpit:** a local mail catcher. Keycloak (and later the API, for invitations) send email to it instead of to
    real inboxes, and its web UI shows every message, so verification and reset links can be tested without an email
    provider.
  - **MinIO:** a local S3-compatible object store standing in for the production storage of recipe photos. Nothing
    uses it yet; it is in place so that media upload (REC-22) can be built later without changing the local setup.
- **Backend shell:** Spring Boot 4 on Java 25, built with Maven. Package layout: shared building blocks
  (`shared/security`, `shared/tenancy`, `shared/web`, `shared/persistence`) plus empty feature packages (`accounts`,
  `notebooks`, `invitations`, `recipes`, `shopping`, `media`). Flyway baseline, Actuator health, RFC 9457 problem
  details, structured JSON logs, API messages from `messages.properties`.
- **Web sign-in (ADR-009, session chain only):** the backend is the confidential OAuth2 client `kn-web`, issues an
  `HttpOnly` session cookie stored with Spring Session JDBC, and protects state-changing requests with CSRF. A
  `CurrentUser` abstraction resolves the Keycloak `sub`. `GET /api/me` returns the signed-in identity (no profile table).
- **Tenancy plumbing:** two database roles (migration owner vs. runtime role without `BYPASSRLS`), a tenant context that
  sets `SET LOCAL app.notebook_id` / `app.user_id` per transaction, and RLS tests on a test-only table.
- **API contract, design-first:** a hand-written `api/openapi.yaml` (OpenAPI 3.1) is the source of truth; Spring
  interfaces and DTOs are generated with the OpenAPI Generator Maven plugin, and the Angular client with
  `ng-openapi-gen`.
- **Frontend shell:** Angular 22 (standalone, zoneless, signals), PWA service worker for the app shell, `@angular/localize`
  with English translation files, `kn-tokens.css` wired globally, an empty app shell showing the signed-in email.
- **Quality gates:** Testcontainers (PostgreSQL, Keycloak) integration tests, Playwright scaffold with one sign-in test,
  GitHub Actions running backend and frontend builds and tests.
- **Documentation:** ADRs move to `docs/adr/` as MADR files with `architecture.md` §10 as the index; ADR-006 (Spring
  Modulith) rejected, ADR-009 accepted, new ADR-011 (design-first OpenAPI with code generation). `AGENTS.md` gets
  environment setup, commands and coding standards; the `config.yaml` design rule points to `docs/adr/`.
- **Out of scope:** every feature requirement, user profile and notebook tables, onboarding, the bearer-JWT chain for a
  native app, Keycloak theme (ADR-008), UI component library (ADR-010), hosting (ADR-007), media upload.

## Capabilities

### New Capabilities

- `platform-foundation`: cross-cutting platform behaviour every feature relies on: authenticated API access via the
  web session, the current-user endpoint, CSRF protection, tenant isolation through RLS, error format, translatable
  messages, health, and the reproducible local stack.

### Modified Capabilities

None.

## Impact

- **Requirement IDs:** none implemented. Prepares ACC-05 / ACC-07 (sign-in, sign-out plumbing) and NB-04 (role-based
  access via the tenant context) without delivering them.
- **Screen IDs:** none. The app shell is a placeholder; screens 01–06 and the navigation shell come with feature changes.
- **Tenancy, authorisation, sign-in:** yes, this change introduces them. RLS stays correct because the application
  connects as a role without `BYPASSRLS` that does not own the tables, settings are set with `SET LOCAL` inside each
  transaction (no leaking between pooled connections), and RLS tests prove that rows of another notebook are invisible
  and that no rows are visible without a tenant context. No role checks exist yet; the notebook access guard comes with
  the first notebook change. Sign-in uses standard OIDC Authorization Code with a confidential client; no tokens reach
  the browser.
- **New code:** `backend/` (Maven project), `frontend/` (Angular workspace), `api/openapi.yaml`, `compose.yaml`,
  `infra/keycloak/` realm export, `.github/workflows/`.
- **Dependencies:** Spring Boot starters (Web, Security, OAuth2 Client, Session JDBC, Data JPA, Validation, Actuator),
  Flyway, PostgreSQL driver, OpenAPI Generator, Testcontainers; Angular 22, `@angular/pwa`, `@angular/localize`,
  `ng-openapi-gen`, Vitest, ESLint, Prettier, Playwright.
- **Docs:** `docs/architecture.md`, new `docs/adr/`, `AGENTS.md`, `openspec/config.yaml` (rule wording only).
