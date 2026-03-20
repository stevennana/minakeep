# AI and UI hardening

```json taskmeta
{
  "id": "020-ai-ui-hardening",
  "title": "AI and UI hardening",
  "order": 20,
  "status": "active",
  "next_task_on_success": null,
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/QUALITY_SCORE.md",
    "docs/RELIABILITY.md",
    "docs/SECURITY.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ai-real",
    "npm run start:smoke"
  ],
  "required_files": [
    "scripts/ralph/README.md"
  ],
  "human_review_triggers": [
    "The task expands into fresh feature work instead of stabilization.",
    "AI failure handling or external-env assumptions remain under-documented.",
    "The visual refresh still has obvious route-to-route inconsistency."
  ]
}
```

## Objective

Stabilize the AI enrichment wave and the knowledge-studio UI so the repo is ready for the next tranche after this expansion.

## Scope

- tighten AI failure handling, retry behavior, and external-env documentation
- reconcile reliability, security, and quality docs with the shipped AI/UI behavior
- close obvious visual inconsistencies left by the redesign
- keep Ralph operator guidance aligned with the new promotion gates

## Out of scope

- new major product features
- AI chat
- unrelated infrastructure expansion

## Exit criteria

1. `npm run verify` passes.
2. `npm run test:e2e -- --grep @ai-real` passes when the AI env vars are configured.
3. `npm run start:smoke` passes.
4. Reliability, security, and quality docs match the shipped AI/UI behavior.
5. Remaining debt is explicit.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ai-real`
- `npm run start:smoke`

## Evaluator notes

Promote only when the repo is operationally ready for the next post-AI wave rather than merely visually or narratively complete.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- Note any external-endpoint blockers separately from normal product bugs.
- 2026-03-21 04:24 KST: Hardened the AI retry path so retry is a no-op unless a note or link is already in the visible failed state, then standardized owner-side AI status presentation across the editor, dashboard, links, search, and tags routes.
- 2026-03-21 04:24 KST: Reconciled operator and policy docs with shipped behavior by documenting the separate `@ai-real` promotion gate, the server-only env contract, explicit external-env blocker wording, and the remaining manual-retry/backoff debt.
- 2026-03-21 04:36 KST: Confirmed the task gates on the current tree with configured AI env vars: `npm run verify`, `npm run test:e2e -- --grep @ai-real`, and `npm run start:smoke` all passed locally. Remaining non-blocking debt stays explicit in the hardening docs as manual/immediate AI retry with no queued backoff.
- 2026-03-21 04:47 KST: Closed the pending-view reliability gap by replacing the links-only refresher with one shared enrichment refresh helper and wiring it into `/app`, `/app/links`, `/app/search`, `/app/tags`, and the note editor so owner surfaces that show pending AI state now refresh consistently in place.
- 2026-03-21 04:58 KST: Reconciled the last determinism mismatch by making Playwright run the E2E promotion path with one worker to match the shared SQLite runtime contract, and updated reliability/operator docs to describe the real harness behavior instead of a mixed serial/parallel story.
- 2026-03-21 04:58 KST: Tightened owner-surface AI metadata consistency by normalizing empty generated-tag copy and giving search/tag link results the same labeled AI summary and tag treatment as the primary links manager.
