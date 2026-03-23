# Site settings foundation

```json taskmeta
{
  "id": "080-site-settings-foundation",
  "title": "Site settings foundation",
  "order": 80,
  "status": "planned",
  "promotion_mode": "standard",
  "next_task_on_success": "081-site-settings-ui",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/RELIABILITY.md",
    "docs/product-specs/workspace-settings.md",
    "docs/design-docs/site-configuration-architecture.md",
    "docs/design-docs/minakeep-information-architecture.md"
  ],
  "required_commands": [
    "npm run typecheck",
    "npm run test:unit",
    "npm run verify"
  ],
  "required_files": [
    "src/app",
    "src/features",
    "prisma/schema.prisma",
    "tests/unit"
  ],
  "human_review_triggers": [
    "The implementation adds a one-off branding hack instead of an extensible settings boundary.",
    "The settings persistence path weakens existing owner/demo access rules.",
    "Shell branding reads diverge between public and private surfaces without an explicit documented reason."
  ]
}
```

## Objective

Establish the persisted settings model and service boundary for site-wide title and description.

## Scope

- persisted settings model for site title and description
- server-side read/write service boundary
- route ownership and navigation contract for `/app/settings`
- deterministic defaults when no saved settings exist yet

## Out of scope

- broader settings UI polish
- content deletion flows
- public showroom and note-detail UI changes

## Exit criteria

1. The repo has a documented and implemented settings foundation for site title/description.
2. Public/private shell branding can read the same persisted settings values with safe defaults.
3. The settings boundary is shaped for later configuration growth.
4. `npm run verify` passes.

## Required checks

- `npm run typecheck`
- `npm run test:unit`
- `npm run verify`

## Evaluator notes

Promote only when the settings work looks like the start of a durable configuration domain, not a route-local special case.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-23 12:08 KST: Read the task contract plus the settings, architecture, frontend, reliability, and information-architecture docs. Confirmed the current branding is still hard-coded in the shared root layout and the private nav has no settings route yet.
- 2026-03-23 12:08 KST: Implemented a singleton `SiteSettings` Prisma model and a new `src/features/site-settings` domain with deterministic defaults plus server-side read/write helpers for shared branding.
- 2026-03-23 12:08 KST: Wired `/app/settings` into private navigation, added the owner-write/demo-read-only route surface, and switched the shared public/private shell branding plus root metadata to read from the same settings service.
- 2026-03-23 12:08 KST: Added unit coverage for default fallback and save normalization. Required verification commands still need to run.
- 2026-03-23 12:20 KST: `npm run typecheck`, `npm run test:unit`, and `npm run verify` passed. Owner-navigation snapshot baselines were refreshed where the intentional new `Settings` nav item changed the shipped UI.
