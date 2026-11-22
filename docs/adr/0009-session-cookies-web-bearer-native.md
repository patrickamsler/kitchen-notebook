---
status: accepted
date: 2026-11-22
---

# ADR-009 Session cookies from the backend for the web; bearer tokens for a later native app (hybrid, no separate BFF)

## Context and Problem Statement

Token handling. The web PWA comes first; a second backend instance and a native mobile app are likely later.

## Considered Options

- A: Tokens everywhere
- B: Hybrid in the backend
- C: Separate BFF for the web

## Decision Outcome

Chosen option: "B: Hybrid in the backend". Accepted with `add-platform-foundation`: the **web session chain comes
first**; the JWT chain for the native app is built later, when the native app is.

- **Web:** the backend is a confidential OAuth2 client (`kn-web`, `oauth2Login()`). Tokens stay on the server; the
  browser gets an `HttpOnly`, `Secure`, `SameSite=Lax` session cookie. Login starts with a full-page redirect to
  `/oauth2/authorization/keycloak`; API calls answer 401 instead of redirecting.
- **Native app (later):** public client `kn-mobile`, Authorization Code + PKCE through the system browser (RFC 8252),
  bearer JWTs with audience `kn-api`.
- **Two `SecurityFilterChain`s on the same endpoints:** requests with `Authorization: Bearer` go to the JWT
  resource-server chain (stateless, no CSRF); all others go to the session chain (CSRF on).
- **`CurrentUser` abstraction:** resolves the Keycloak `sub` from an `OidcUser` or a `Jwt`, so membership checks and RLS
  don't depend on the sign-in path.
- **Sessions:** Spring Session JDBC in PostgreSQL, so 2+ instances work without sticky sessions. The session holds
  authentication only.
- **Same origin:** SPA and API behind one reverse proxy (`/api`), so cookies stay first-party.
- **Logout:** RP-initiated logout to Keycloak; "Sign out everywhere" via OIDC back-channel logout.

### Consequences

No tokens in browser JavaScript and no OIDC library in Angular. The backend becomes stateful for web requests and needs
a session store. Two sign-in paths to test (Testcontainers with Keycloak covers both).

## Pros and Cons of the Options

|                       | A: Tokens everywhere      | B: Hybrid in the backend        | C: Separate BFF for the web |
| --------------------- | ------------------------- | ------------------------------- | --------------------------- |
| Web PWA               | Tokens in the SPA (PKCE)  | Session cookie from the backend | Session cookie from the BFF |
| Native app            | Bearer tokens (PKCE)      | Bearer tokens (PKCE)            | Bearer tokens (PKCE)        |
| API                   | Stateless resource server | Session chain + JWT chain       | Stateless resource server   |
| With 2 instances      | Nothing extra             | Spring Session JDBC             | Session store in the BFF    |
| Deployables           | API                       | API                             | API + BFF                   |
| Tokens exposed to XSS | Yes                       | No                              | No                          |
| CSRF handling         | Not needed                | Session chain only              | In the BFF                  |
