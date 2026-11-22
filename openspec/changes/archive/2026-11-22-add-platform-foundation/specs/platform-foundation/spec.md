# Spec Delta

## Purpose

Cross-cutting platform behaviour that every Kitchen Notebook feature relies on: authenticated API access through the
web session, the current-user endpoint, CSRF protection, tenant isolation, a uniform error format, translatable text,
health reporting and a reproducible local environment.

## ADDED Requirements

### Requirement: PLT-01 Unauthenticated API requests are rejected
Every API endpoint except health SHALL require an authenticated session. Unauthenticated API requests SHALL receive
HTTP 401 with a problem-details body and SHALL NOT be redirected to the sign-in page.

#### Scenario: API call without a session
- **GIVEN** a browser without a session cookie
- **WHEN** it calls `GET /api/me`
- **THEN** the response is 401 with content type `application/problem+json`
- **AND** the response is not a redirect

#### Scenario: Health stays public
- **GIVEN** a client without a session
- **WHEN** it calls the health endpoint
- **THEN** the response is 200 and reveals no component details

### Requirement: PLT-02 Web sign-in through the backend
The web app SHALL start sign-in with a full-page navigation to the backend, which runs the OIDC Authorization Code flow
with Keycloak as a confidential client. After success the browser SHALL hold only an `HttpOnly`, `SameSite=Lax` session
cookie (`Secure` outside local development); no access, refresh or ID token SHALL reach browser JavaScript.

#### Scenario: Successful sign-in
- **GIVEN** a verified Keycloak user
- **WHEN** they start sign-in from the web app and enter valid credentials at Keycloak
- **THEN** they return to the web app with a session cookie
- **AND** `GET /api/me` returns their identity

#### Scenario: No tokens in the browser
- **GIVEN** a signed-in user
- **WHEN** the browser's cookies, storage and API responses are inspected
- **THEN** none of them contains an OAuth2 access, refresh or ID token

### Requirement: PLT-03 Current user endpoint
`GET /api/me` SHALL return the signed-in user's Keycloak subject, email, email-verified flag and display name, as
described in the API contract.

#### Scenario: Signed-in user asks who they are
- **GIVEN** a user signed in as `anna@example.com`
- **WHEN** the web app calls `GET /api/me`
- **THEN** the response is 200 with `email` = `anna@example.com` and her Keycloak subject

### Requirement: PLT-04 Sign-out ends the session
Sign-out SHALL invalidate the backend session and end the Keycloak session (RP-initiated logout), then return the user
to the web app signed out.

#### Scenario: Sign out
- **GIVEN** a signed-in user
- **WHEN** they sign out
- **THEN** a later `GET /api/me` with the old cookie returns 401
- **AND** starting sign-in again asks for credentials at Keycloak

### Requirement: PLT-05 Sessions survive restarts and multiple instances
Sessions SHALL be stored in the database so that a session created on one backend instance is valid on another and
after a restart.

#### Scenario: Restart keeps the session
- **GIVEN** a signed-in user
- **WHEN** the backend restarts
- **THEN** `GET /api/me` with the same cookie still returns 200

### Requirement: PLT-06 CSRF protection for state-changing requests
Session-authenticated `POST`, `PUT`, `PATCH` and `DELETE` requests SHALL carry a valid CSRF token taken from the
`XSRF-TOKEN` cookie; requests without a valid token SHALL be rejected with 403.

#### Scenario: Missing CSRF token
- **GIVEN** a signed-in user
- **WHEN** a state-changing request is sent without the CSRF header
- **THEN** the response is 403 with a problem-details body

#### Scenario: Web app sends the token
- **GIVEN** a signed-in user in the web app
- **WHEN** the app sends a state-changing request (sign-out)
- **THEN** the request carries the CSRF header automatically and is not rejected for CSRF

### Requirement: PLT-07 Tenant rows are isolated by the database
Every tenant table SHALL be protected by PostgreSQL row-level security keyed on `notebook_id`. The application SHALL
access the database as a role that cannot bypass RLS, and the active notebook SHALL be scoped to a single transaction.

#### Scenario: Rows of another notebook are invisible
- **GIVEN** tenant rows in notebooks A and B
- **WHEN** a transaction runs with notebook A as its tenant context and selects all rows without a filter
- **THEN** only rows of notebook A are returned

#### Scenario: No tenant context means no rows
- **GIVEN** tenant rows in notebook A
- **WHEN** a transaction runs without a tenant context
- **THEN** no tenant rows are returned and inserts are rejected

#### Scenario: Writing into another notebook is rejected
- **GIVEN** a transaction with notebook A as its tenant context
- **WHEN** it inserts or updates a row with `notebook_id` of notebook B
- **THEN** the database rejects the statement

#### Scenario: Tenant context does not leak between transactions
- **GIVEN** a pooled connection that ran a transaction for notebook A
- **WHEN** the same connection is reused for a transaction without a tenant context
- **THEN** no rows of notebook A are visible

### Requirement: PLT-08 Uniform error format
API errors SHALL be returned as RFC 9457 problem details with a stable `type`, the HTTP `status` and a human-readable
`title` and `detail`; validation errors SHALL list the offending fields. Stack traces SHALL NOT be exposed.

#### Scenario: Validation error
- **GIVEN** a request body that violates the API contract's constraints
- **WHEN** it is sent to the API
- **THEN** the response is 400 `application/problem+json` listing each invalid field

#### Scenario: Unexpected failure
- **GIVEN** an unexpected server error
- **WHEN** the API handles the request
- **THEN** the response is 500 problem details without a stack trace or internal class names

### Requirement: PLT-09 API matches the published contract
The HTTP API SHALL conform to `api/openapi.yaml` (OpenAPI 3.1), which is written before the implementation; the web app
SHALL use a client generated from the same file.

#### Scenario: Contract change without implementation fails the build
- **GIVEN** an operation added to or changed in `api/openapi.yaml`
- **WHEN** the backend is built without implementing it
- **THEN** the build fails

#### Scenario: Web app uses the generated client
- **GIVEN** the web app calls the API
- **WHEN** its source is inspected
- **THEN** API calls go through the client generated from `api/openapi.yaml`

### Requirement: PLT-10 User-facing text comes from translation files
All user-facing text in the web app and in API messages SHALL come from translation resources with English as the only
shipped locale; adding a locale SHALL NOT require code changes.

#### Scenario: Text is not hard-coded
- **GIVEN** the web app source
- **WHEN** the translation extraction runs
- **THEN** every user-visible string in templates is marked for translation and present in the English source file

#### Scenario: API message is translated
- **GIVEN** an API error with a message key
- **WHEN** the error is returned
- **THEN** its `title` and `detail` come from the English message bundle

### Requirement: PLT-11 Reproducible local environment
A developer SHALL be able to start the full local stack (database, identity provider with a preconfigured realm and test
users, mail catcher, object storage) with documented commands, sign in with a test user and see their email in the web
app.

#### Scenario: Fresh clone to signed-in user
- **GIVEN** a fresh clone with Docker, Java 25 and Node installed
- **WHEN** the developer follows the documented setup commands
- **THEN** they can sign in as the documented test user and the web app shows that user's email

#### Scenario: Emails are caught locally
- **GIVEN** the local stack is running
- **WHEN** Keycloak sends a verification or reset email
- **THEN** it appears in the local mail catcher and is not delivered externally
