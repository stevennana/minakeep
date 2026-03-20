# Link AI enrichment

```json taskmeta
{
  "id": "018-link-ai-enrichment",
  "title": "Link AI enrichment",
  "order": 18,
  "status": "queued",
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
  ]
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
