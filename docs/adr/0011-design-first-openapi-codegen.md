---
status: accepted
date: 2026-11-22
---

# ADR-011 Design-first OpenAPI with code generation

## Context and Problem Statement

The API is contract-first (quality goal 5, maintainability): specs, the OpenAPI contract and tests are reviewed
together. How do the backend and the web app stay in line with the contract?

## Decision Drivers

- The contract is reviewed with the specs, before the implementation.
- Drift between contract, backend and web app must be found at build time, not in production.
- No hand-written HTTP calls in the web app.

## Considered Options

- Design-first: hand-written `api/openapi.yaml`, Spring interfaces and DTOs plus the Angular client generated
- Code-first with springdoc: the contract is generated from the controllers
- Hand-written controllers and client, checked by contract tests

## Decision Outcome

Chosen option: "Design-first with code generation", because it is the only option where the contract comes first and
a mismatch fails the build.

- `api/openapi.yaml` (OpenAPI 3.1) is written by hand; server URL `/api`; shared `Problem` schema (RFC 9457). Each
  operation has an `operationId` and an `x-requirements` list (e.g. `[PLT-03]`).
- Backend: OpenAPI Generator Maven plugin (`spring`, `interfaceOnly`, `useTags`, `skipDefaultInterface`, Jakarta bean
  validation) into `target/`. Controllers implement the generated interfaces, so an unimplemented operation fails
  compilation.
- Frontend: `ng-openapi-gen` generates services and models into `src/app/api/` (gitignored) before start, build and
  test.
- Feature changes edit `api/openapi.yaml` as their first task.

### Consequences

- Good, because the contract cannot drift from the backend without a compile error, and the web app uses typed calls.
- Good, because validation constraints (`required`, lengths, patterns) live in the contract and become annotations.
- Bad, because generator versions must keep up with Spring Boot 4 (Jakarta, Jackson 3) and Angular 22.
- Bad, because generated code is not committed, so a build is needed before the IDE resolves the types.

## Pros and Cons of the Options

### Code-first with springdoc

- Good, because no generator setup is needed in the backend.
- Bad, because the contract follows the code, against spec-first review.

### Hand-written controllers and client with contract tests

- Good, because there is full control over the code.
- Bad, because drift is found only at test time, and both sides repeat the contract by hand.

## More Information

Change `add-platform-foundation` (PLT-09), design D7.
