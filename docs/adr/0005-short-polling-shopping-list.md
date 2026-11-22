---
status: accepted
date: 2026-11-22
---

# ADR-005 Short polling instead of push for the shopping list

## Context and Problem Statement

Several members edit the shared shopping list. How do other members see changes?

## Decision Outcome

Chosen option: "Short polling" (about every 15 s while the list is open, with ETags so unchanged lists answer 304).
No WebSocket or SSE in v1.

### Consequences

- Good, because there is no extra infrastructure and no message broker (quality goal 3, simplicity).
- Bad, because updates arrive with a delay, and polling keeps sessions alive, so an absolute session timeout is needed.
