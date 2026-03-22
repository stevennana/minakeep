# External note API create and publish

```json taskmeta
{
  "id": "078-external-note-api-create-and-publish",
  "title": "External note API create and publish",
  "order": 78,
  "status": "planned",
  "promotion_mode": "standard",
  "next_task_on_success": "079-external-note-api-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/product-specs/external-note-api.md",
    "docs/product-specs/public-note-publishing.md",
    "docs/product-specs/note-ai-enrichment.md",
    "docs/design-docs/external-note-api-boundary.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @note-api",
    "npm run verify"
  ],
  "required_files": [
    "src/app/api",
    "src/features/notes",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "API-created notes bypass or fork the existing note slug, publish, or enrichment behavior.",
    "Publish-on-create defaults to public instead of staying opt-in.",
    "The response contract is too thin for callers to use the created note without a second lookup."
  ]
}
```

## Objective

Create owner notes through the external API and support optional publish-on-create without inventing a second note workflow.

## Scope

- request JSON parsing for `title`, `markdown`, and optional `isPublished`
- note creation under the single owner account
- optional publish-on-create
- reuse of the existing note enrichment scheduling and public/private revalidation behavior
- success response contract with note identifiers and URLs

## Out of scope

- note updates, deletes, or list endpoints
- image upload
- remote-controlled slug, tags, or AI summary

## Exit criteria

1. A valid keyed request creates a private note when `isPublished` is omitted.
2. A valid keyed request publishes the note immediately when `isPublished` is `true`.
3. API-created notes enter the existing note AI enrichment lifecycle after save.
4. The response JSON includes the created note identity plus owner/public URLs as appropriate.
5. `npm run test:e2e -- --grep @note-api` passes.
6. `npm run verify` passes.

## Required checks

- `npm run test:e2e -- --grep @note-api`
- `npm run verify`

## Evaluator notes

Promote only when the external note-create path behaves like the existing owner note flow, not like a second product.

## Progress log

- Start here. Append timestamped progress notes as work lands.
