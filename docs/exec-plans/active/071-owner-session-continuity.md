# Owner session continuity

```json taskmeta
{
  "id": "071-owner-session-continuity",
  "title": "Owner session continuity",
  "order": 71,
  "status": "planned",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "072-ui-refinement-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/owner-session-continuity.md",
    "docs/design-docs/minakeep-information-architecture.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @owner-session"
  ],
  "required_files": [
    "src/app/layout.tsx",
    "src/lib/auth",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "An authenticated owner still appears logged out after moving to public routes.",
    "The fix leaks private controls to anonymous visitors.",
    "The owner still needs to re-authenticate unnecessarily when returning from public pages."
  ]
}
```

## Objective

Preserve authenticated owner continuity across public and private route switching.

## Scope

- public-topbar authenticated-state behavior
- owner return path from public routes back to the private workspace
- regression coverage for session continuity

## Out of scope

- auth provider changes
- multi-user account work
- owner dashboard layout beyond session continuity affordances

## Exit criteria

1. An authenticated owner can move between `/app`, `/`, and public note routes without an unnecessary re-login.
2. Public navigation reflects owner continuity appropriately.
3. Anonymous users still do not see private controls.
4. `npm run test:e2e -- --grep @owner-session` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @owner-session`

## Evaluator notes

Promote only when session continuity improves owner experience without weakening privacy boundaries.

## Progress log

- Start here. Append timestamped progress notes as work lands.
