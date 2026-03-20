# AI and UI hardening

```json taskmeta
{
  "id": "020-ai-ui-hardening",
  "title": "AI and UI hardening",
  "order": 20,
  "status": "queued",
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
