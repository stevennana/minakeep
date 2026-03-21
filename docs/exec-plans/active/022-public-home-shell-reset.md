# Public home shell reset

```json taskmeta
{
  "id": "022-public-home-shell-reset",
  "title": "Public home shell reset",
  "order": 22,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "023-public-home-dynamic-grid",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/design-docs/homepage-showroom-rhythm.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-home-shell"
  ],
  "required_files": [
    "src/app/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Reduce homepage hero dominance and reframe `/` as a note-first showroom shell.

## Scope

- lighten the introductory framing
- make published note previews the main focus above the fold
- keep note metadata compact and secondary

## Out of scope

- final dynamic grid rhythm details
- owner workspace redesign
- public note reading page polish

## Exit criteria

1. The homepage reads as a note showroom before it reads as a product introduction.
2. Intro framing is present but visually subordinate to the archive content.
3. `npm run test:e2e -- --grep @ui-home-shell` passes with desktop/mobile screenshots, visible note-first hierarchy, and accessibility checks.
4. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-home-shell`

## Evaluator notes

Promote when the deterministic UI checks pass and `/` clearly prioritizes note discovery over promo framing.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 10:40 KST: Reworked `src/app/page.tsx` so the published-note collection leads the home shell, with the intro reduced to a smaller supporting card and the owner entrance kept in a secondary rail.
- 2026-03-21 10:40 KST: Added deterministic `@ui-home-shell` Playwright coverage with fixed published-note seeding, desktop/mobile screenshot assertions, hierarchy checks, overflow guards, and structural accessibility checks.
