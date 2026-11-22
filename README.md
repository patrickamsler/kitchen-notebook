# The Kitchen Notebook

A multi-tenant recipe app. A **notebook** is the tenant: it holds recipes, recipe types, members (Owner / Can edit /
Can view) and one shared shopping list. The web app is an Angular PWA; the backend is a Spring Boot modular monolith
with PostgreSQL (row-level security per notebook) and Keycloak for sign-in.

This file is the developer entry point: setup, commands, repository map and how work happens. Architecture and rules
are in [`docs/`](docs/).

## Quick start

Prerequisites: Docker (with Compose), Java 25, Node (version in [`frontend/.nvmrc`](frontend/.nvmrc)) with npm.

```bash
cp .env.example .env                       # local-only settings
docker compose up -d --wait                # PostgreSQL, Keycloak, Mailpit, MinIO

cd backend && ./mvnw spring-boot:run       # terminal 1: API on http://localhost:8080
cd frontend && npm ci && npm start         # terminal 2: web app on http://localhost:4200
```

Open http://localhost:4200, sign in as `anna@example.com` with the password `KN_TEST_USER_PASSWORD` from `.env`
(`local-test-pw` by default). The app shows "Signed in as anna@example.com".

## Local setup

`compose.yaml` runs the infrastructure only; the backend and the web app run natively. The Angular dev server proxies
`/api`, `/oauth2`, `/login/oauth2` and `/logout` to the backend ([`frontend/proxy.conf.json`](frontend/proxy.conf.json)),
so the browser sees one origin.

| Service | URL | Notes |
|---|---|---|
| Web app | http://localhost:4200 | `npm start` in `frontend/` |
| Backend API | http://localhost:8080/api | `./mvnw spring-boot:run` in `backend/`; health at `/actuator/health` |
| PostgreSQL 18 | `localhost:5432` | database `kitchen_notebook` (roles `kn_owner`, `kn_app`), database `keycloak` |
| Keycloak 26 | http://localhost:8180 | realm `kitchen-notebook`; admin console http://localhost:8180/admin with `KEYCLOAK_ADMIN_USER` / `KEYCLOAK_ADMIN_PASSWORD` |
| Mailpit | http://localhost:8025 | catches every email (SMTP `localhost:1025`); nothing is delivered |
| MinIO | http://localhost:9001 (console), http://localhost:9000 (S3 API) | bucket `kn-media`; `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`. Community build `pgsty/minio`, as upstream MinIO no longer publishes images |

**Test users** (verified, imported with the realm): `anna@example.com` and `ben@example.com`, both with the password
`KN_TEST_USER_PASSWORD`. Password-reset and verification emails appear in Mailpit.

**Settings.** `.env` (copied from [`.env.example`](.env.example), gitignored) holds local-only passwords and the
`kn-web` client secret. Compose reads it, and the backend imports it (`../.env`). Never put real secrets in it.

**Resetting.** The PostgreSQL init scripts ([`infra/postgres/init/`](infra/postgres/init/)) run only on the first
start with an empty volume, and the realm ([`infra/keycloak/`](infra/keycloak/)) is imported only if it does not exist.
After changing either, reset with:

```bash
docker compose down -v && docker compose up -d --wait   # deletes ALL local data (database, Keycloak, MinIO)
```

**Ports in use?** Stop whatever uses 4200, 8080, 5432, 8180, 8025, 1025, 9000 or 9001. The Keycloak client only
allows redirects to `http://localhost:4200`.

## Commands

| What | Where | Command |
|---|---|---|
| Start / stop infrastructure | root | `docker compose up -d --wait` / `docker compose down` |
| Run the backend | `backend/` | `./mvnw spring-boot:run` (plain-text logs: `KN_LOG_FORMAT= ./mvnw spring-boot:run`) |
| Run the web app | `frontend/` | `npm start` |
| Generate the API code | `backend/`, `frontend/` | `./mvnw generate-sources` / `npm run generate:api` (both also run automatically) |
| Backend unit tests (`*Test`) | `backend/` | `./mvnw test` |
| Backend unit + integration tests (`*IT`, Testcontainers) | `backend/` | `./mvnw verify` |
| Frontend unit tests (Vitest) | `frontend/` | `npm test` |
| End-to-end tests (Playwright) | `frontend/` | `npm run e2e` (needs infrastructure and backend running; first time: `npx playwright install chromium`) |
| Lint | `frontend/` | `npm run lint`; contract: `npx @redocly/cli@2.82.0 lint ../api/openapi.yaml` |
| i18n: update / check `messages.xlf` | `frontend/` | `npm run i18n:extract` / `npm run i18n:check` |
| Production build with service worker | `frontend/` | `npm run build && npm run serve:dist` (serves on :4200 with the proxy) |

CI (GitHub Actions, [`.github/workflows/`](.github/workflows/)) runs the `backend`, `frontend` and `e2e` jobs on every
pull request.

## Repository map

```text
api/openapi.yaml        API contract (OpenAPI 3.1), written by hand before the code; source of generated code
backend/                Spring Boot 4 / Java 25 Maven project (wrapper: ./mvnw)
frontend/               Angular 22 PWA (npm); e2e/ holds the Playwright tests
infra/                  local infrastructure: postgres/init/ (roles, databases), keycloak/ (realm import)
compose.yaml            local infrastructure (Compose)
.env.example            local settings, copied to .env
docs/                   architecture.md (arc42), domain-model.md, design/ (design system, screens)
docs/adr/               architecture decision records (MADR), indexed in docs/architecture.md section 10
docs/development/       rules: backend.md, frontend.md, testing.md, tenancy.md
openspec/               specs and changes (OpenSpec); config.yaml has the project context and rules
.github/workflows/      CI
```

## How work happens

- **One OpenSpec change = one branch = one pull request.** The branch is `change/<change-name>`; small fixes without
  a change use `fix/<topic>`. Never commit to `main`.
- **Flow:** propose the change (proposal, specs, design, tasks) → apply it on the branch → review with CI green and
  all tasks checked → `openspec archive <change-name>` as the last commit on the branch → **squash merge** into
  `main`.
- **Squash commit:** title `<type>: <summary> (<change-name>)` in Conventional Commits style, e.g.
  `feat: add platform foundation (add-platform-foundation)`; the body has the "Why" from the proposal and the
  requirement IDs.
- **Contract first:** an API change starts with `api/openapi.yaml` (with `x-requirements`), then the generated code
  is implemented. An operation without an implementation fails the build.
- **Requirement IDs everywhere:** specs, `x-requirements` in the contract and test names use the same IDs (e.g.
  `PLT-07`), see [`docs/development/testing.md`](docs/development/testing.md).

## Documentation

- [Architecture (arc42)](docs/architecture.md) and the [ADRs](docs/adr/)
- [Domain model](docs/domain-model.md)
- [Design system](docs/design/design-system.md) and [screen inventory](docs/design/screen-inventory.md)
- Rules: [backend](docs/development/backend.md), [frontend](docs/development/frontend.md),
  [testing](docs/development/testing.md), [tenancy](docs/development/tenancy.md)
- Agents: [AGENTS.md](AGENTS.md)
