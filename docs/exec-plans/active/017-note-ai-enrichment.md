# Note AI enrichment

```json taskmeta
{
  "id": "017-note-ai-enrichment",
  "title": "Note AI enrichment",
  "order": 17,
  "status": "queued",
  "next_task_on_success": "018-link-ai-enrichment",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/design-docs/ai-enrichment-lifecycle.md",
    "docs/product-specs/note-ai-enrichment.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ai-real"
  ],
  "required_files": [
    "src/features/notes",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The task mixes link enrichment or broad visual redesign work into the note slice.",
    "The note save flow becomes blocked on AI success.",
    "The real-endpoint E2E path is skipped or replaced by mock-only confidence."
  ]
}
```

## Objective

After note save, automatically generate AI-owned summary and tags, surface note enrichment status clearly, and allow retry on failure without blocking authoring.

## Scope

- trigger note enrichment automatically after create and update
- show note enrichment status and generated metadata in the note editor and relevant owner note surfaces
- preserve authored title and markdown as the primary note content
- expose retry behavior when enrichment fails

## Out of scope

- link enrichment
- broad search expansion beyond the documented note/title/tag behavior
- full-app visual redesign beyond the minimum UI needed for this slice

## Exit criteria

1. Saving a note triggers AI enrichment automatically.
2. AI failure does not block note save and leaves visible failed state with retry.
3. Generated note summary/tags appear in the documented note-related owner surfaces.
4. `npm run verify` passes.
5. `npm run test:e2e -- --grep @ai-real` passes for a real note-enrichment journey when the AI env vars are configured.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ai-real`

## Evaluator notes

Promote only when note enrichment works in substance against the real endpoint contract and the save path remains reliable under failure.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- Note when existing note services, editor components, or E2E fixtures were extended instead of replaced.
