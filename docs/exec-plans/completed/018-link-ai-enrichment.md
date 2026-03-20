# Link AI enrichment

```json taskmeta
{
  "id": "018-link-ai-enrichment",
  "title": "Link AI enrichment",
  "order": 18,
  "status": "completed",
  "next_task_on_success": "019-knowledge-studio-ui-refresh",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/design-docs/ai-enrichment-lifecycle.md",
    "docs/product-specs/link-ai-enrichment.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ai-real"
  ],
  "required_files": [
    "src/features/links",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The task drifts into note enrichment or broad visual redesign work.",
    "The link save flow becomes blocked on AI success.",
    "The generated summary/tag behavior is still effectively manual or ambiguous."
  ],
  "completed_at": "2026-03-20T18:56:20.484Z"
}
```

## Objective

After link save, automatically generate AI-owned summary and tags, surface link enrichment status clearly, and allow retry on failure without blocking capture.

## Scope

- trigger link enrichment automatically after save
- show link enrichment status and generated metadata in the links page and relevant owner retrieval surfaces
- keep manual link capture focused on URL and title entry
- expose retry behavior when enrichment fails

## Out of scope

- note enrichment
- public link publishing
- broad visual redesign beyond the minimum UI needed for this slice

## Exit criteria

1. Saving a link triggers AI enrichment automatically.
2. AI failure does not block link save and leaves visible failed state with retry.
3. Generated link summary/tags appear in the documented owner surfaces.
4. `npm run verify` passes.
5. `npm run test:e2e -- --grep @ai-real` passes for a real link-enrichment journey when the AI env vars are configured.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ai-real`

## Evaluator notes

Promote only when link enrichment works in substance against the real endpoint contract and the save path remains reliable under failure.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- Note when existing link services, normalization, or E2E fixtures were extended instead of replaced.
- 2026-03-21 13:24 KST: Reused the existing enrichment-state fields and note-side `after()` scheduling pattern for links instead of adding a second async workflow. Link capture now saves only URL/title, marks enrichment `pending` or `failed` immediately, and runs the remote link enrichment call after the response.
- 2026-03-21 13:24 KST: Extended `src/features/links` with a dedicated enrichment runner, repo attempt-guarded metadata writes, nullable AI summary storage, and retry support. The links, search, and tags owner surfaces now show link AI status, generated metadata, and failure detail without exposing links publicly.
- 2026-03-21 13:24 KST: Expanded the existing Playwright AI fixture instead of replacing it by adding a deterministic local `success` mode alongside the existing timeout mode. Added unit coverage for link prompt/state transitions, updated link E2E journeys for auto-enrichment and retry, and added a real-endpoint `@ai-real` link journey.
- 2026-03-21 03:51 KST: Verified the link slice against lint, typecheck, build, unit tests, and the real-endpoint link E2E path. Fixed the unrelated `/app` owner-dashboard staleness that was blocking `npm run verify` by forcing fresh server data on that mutable dashboard route instead of broadening the link implementation.
- 2026-03-20T18:56:20.484Z: automatically promoted after deterministic checks and evaluator approval.
