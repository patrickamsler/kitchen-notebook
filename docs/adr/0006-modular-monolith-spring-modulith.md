---
status: rejected
date: 2026-11-22
---

# ADR-006 Modular monolith (Spring Modulith?)

## Context and Problem Statement

The backend is a modular monolith with modules matching the bounded contexts (`accounts`, `notebooks`, `invitations`,
`recipes`, `shopping`, `media`). Should module boundaries be checked with Spring Modulith?

## Considered Options

- Spring Modulith
- Plain packages by convention, checked with ArchUnit

## Decision Outcome

Spring Modulith is **rejected**, reason: plain packages by convention. The modular monolith stays; the feature packages
and their layering are a convention checked by ArchUnit rules (see `docs/development/backend.md`) and pull-request
review.

### Consequences

- Good, because there is no extra framework or module metadata, and the package rules are simple.
- Bad, because boundaries rely on ArchUnit rules and review; revisit if they erode.
