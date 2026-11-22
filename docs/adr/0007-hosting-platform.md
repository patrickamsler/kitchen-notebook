---
status: open
date: 2026-11-22
---

# ADR-007 Hosting platform

## Context and Problem Statement

Where do the containers (`api`, `web`, `keycloak`, `postgres`, object storage, SMTP) run? Data residency (Switzerland
or EU) is to be decided too.

## Considered Options

- Kubernetes with Helm (familiar, more operations work)
- A managed container platform

## Decision Outcome

Open.
