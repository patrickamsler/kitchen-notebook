---
status: accepted
date: 2026-11-22
---

# ADR-001 Spring Boot 4 on Java 25

## Context and Problem Statement

The Kitchen Notebook needs one backend for the web PWA and a later native app. Which runtime and framework?

## Decision Outcome

Chosen option: "Spring Boot 4 on Java 25", the current LTS Java with the latest stable Spring Boot line at project
start. Spring Boot has no LTS line (4.1 is current, 4.2 due end of 2026), so the project follows the latest minor.

### Consequences

- Good, because the Spring Security OAuth2 client, Spring Session JDBC, Data JPA and Testcontainers cover the
  sign-in, session and tenancy needs out of the box.
- Bad, because Spring Boot minors have to be followed actively.
