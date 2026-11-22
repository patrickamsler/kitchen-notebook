# AGENTS instructions

## Environment Setup

TODO

## Commands

TODO

## Repository Structure

```text
openspec/
  config.yaml                      # project context + rules for OpenSpec
docs/
  architecture.md                  # arc42 architecture, tech stack, ADR list
  domain-model.md                  # entities, invariants, state diagrams
  design/
    design-system.md               # the shipped look, rules for UI work, layout, components, accessibility
    screen-inventory.md            # screen ID → files → requirement IDs
    screens/                       # 40 screens × desktop/mobile × light/dark + tokens board (PNG)
frontend/
  src/styles/kn-tokens.css         # design tokens for the shipped look — source of truth in code
  src/assets/illustrations/
    generic/                       # 8 illustrations users can pick (SVG, 800 × 500)
    samples/                       # 11 sample-recipe illustrations for seed/demo data
```

## Coding Standards

TODO

## Boundaries

* **Ask first**
  * Large refactors.
  * New dependencies with broad impact.
  * Destructive data or migration changes.
* **Never**
  * Commit secrets, credentials, or tokens.
  * Commit in the authors name unless explicitly told to do so.
  * Use destructive git operations unless explicitly requested.
