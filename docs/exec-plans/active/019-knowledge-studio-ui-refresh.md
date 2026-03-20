# Knowledge studio UI refresh

```json taskmeta
{
  "id": "019-knowledge-studio-ui-refresh",
  "title": "Knowledge studio UI refresh",
  "order": 19,
  "status": "queued",
  "next_task_on_success": "020-ai-ui-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/DESIGN.md",
    "docs/design-docs/knowledge-studio-visual-system.md",
    "docs/product-specs/knowledge-studio-ui-refresh.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [
    "src/app",
    "src/features"
  ],
  "human_review_triggers": [
    "The redesign turns into a reference clone instead of a Minakeep-specific adaptation.",
    "The visual refresh regresses route clarity or responsive behavior.",
    "AI metadata visually overwhelms authored content."
  ]
}
```

## Objective

Refresh the whole app into an elegant, dense, reference-inspired knowledge-studio UI while preserving the current route model and workflow clarity.

## Scope

- redesign the public homepage, public note pages, login, and private vault surfaces
- introduce a coherent typography, spacing, color, and card/layout system across the app
- keep public reading calm and private authoring functional and notes-first
- integrate AI metadata visually without turning the product into a chat assistant

## Out of scope

- new product features outside the documented AI enrichment work
- public search
- cloned reference layout or branding

## Exit criteria

1. Public and private surfaces share one coherent visual system.
2. The refreshed UI remains responsive and usable on desktop and mobile.
3. Existing note, publishing, link, tags, and search journeys still pass under the new visual system.
4. `npm run verify` passes.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when the redesign materially improves polish and density without reducing clarity or breaking existing flows.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- Note which current surfaces were preserved structurally and which were substantially redesigned.
