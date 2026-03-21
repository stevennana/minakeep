# Public publishing foundation

```json taskmeta
{
  "id": "031-public-publishing-foundation",
  "title": "Public publishing foundation",
  "order": 31,
  "status": "active",
  "next_task_on_success": "032-owner-link-publish-controls",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/SECURITY.md",
    "docs/design-docs/minakeep-content-model.md",
    "docs/product-specs/public-link-publishing.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [
    "src",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The task broadens into public search or typography work.",
    "Publishing boundaries for notes versus links are still ambiguous.",
    "Mixed public content is implemented without clear draft/private protections."
  ]
}
```

## Objective

Extend the product and persistence contract from notes-only public publishing to mixed published notes and published links.

## Scope

- define the shared public-content boundary for notes and links
- add the publish-state foundation needed for links
- keep public access limited to explicitly published content

## Out of scope

- homepage shell cleanup
- title-only public search
- typography tuning

## Exit criteria

1. The repo has a clear notes-plus-links public publishing model.
2. Links can participate in public publishing without weakening private-by-default behavior.
3. `npm run verify` passes.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when later public-link and public-showroom tasks can build on one unambiguous publishing boundary.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 14:28 KST - Read the required repo docs and confirmed the current gap: notes already define publish-state and public queries, while links are still private-only in schema and domain code.
- 2026-03-21 14:34 KST - Added link publish-state fields to the Prisma contract, extended the link repo/service/types with publish and published-list support, and introduced a shared `public-content` boundary for mixed published notes and links without changing the homepage feed yet.
- 2026-03-21 14:40 KST - `npm run verify` passed after keeping the change set scoped to the publishing contract and leaving the mixed homepage rendering for later tasks.
- 2026-03-21 14:52 KST - Added explicit link publish/unpublish server actions and owner controls in `/app/links`, including homepage revalidation and owner-visible public/private status.
- 2026-03-21 14:52 KST - Switched the public homepage to the shared mixed `public-content` query so published links can appear alongside published notes while unpublished items remain excluded.
- 2026-03-21 14:52 KST - Updated E2E/UI coverage and generated schema docs to reflect the mixed public publishing boundary; full verification pending on this run.
- 2026-03-21 15:02 KST - `npm run verify` passed after adding the owner link publish controls, mixed public homepage boundary, and deterministic UI/E2E coverage for the new notes-plus-links public contract.
