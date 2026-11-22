---
status: accepted
date: 2026-11-22
---

# ADR-002 Angular PWA (one responsive app, no native apps)

## Context and Problem Statement

Cooks use the app on phones and desktops. One client or several?

## Decision Outcome

Chosen option: "Angular PWA", one responsive Angular 22 app (standalone components, signals, zoneless) installed as a
PWA. The service worker caches the app shell only; the app is online only. No native apps at launch.

### Consequences

- Good, because one code base serves phones and desktops (quality goal 4, usability on phones).
- Bad, because native-only capabilities are unavailable; a native app may follow later (see ADR-009).
