---
status: accepted
date: 2026-11-22
---

# ADR-003 Keycloak as self-hosted IdP (Google + email/password, no magic link)

## Context and Problem Statement

Users sign in with Google or with email and password, need email verification and password reset. Who owns credentials?

## Decision Outcome

Chosen option: "Keycloak 26.x, self-hosted", realm `kitchen-notebook`, with a Google identity provider and email and
password. Verify email is required; password reset runs through Keycloak. No magic-link sign-in. The app stores no
passwords and keys its data by the Keycloak `sub`.

### Consequences

- Good, because there are no passwords in the app (quality goal 2, security) and standard OIDC is used.
- Bad, because Keycloak is one more service to operate, and its pages need a theme to match the design (ADR-008).
