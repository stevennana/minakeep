# Link AI enrichment

## Goal
Let Minakeep automatically generate AI-owned summary and tags for saved links after save, while keeping link capture fast and resilient.

## Trigger / Entry
The owner saves a link from the private links page.

## User-Visible Behavior
- After link save, Minakeep starts AI enrichment automatically.
- The links view and other owner-facing surfaces show whether enrichment is pending, ready, or failed.
- When enrichment succeeds, the generated summary and tags become visible across relevant owner surfaces.
- If enrichment fails, the link still saves and the owner can retry enrichment.

## Validation
- A saved link can complete a real-endpoint enrichment flow when `LLM_BASE`, `TOKEN`, and `MODEL` are configured.
- AI enrichment failure does not block link save.
- Generated link metadata appears in the owner UI where the related docs say it should.
- `npm run verify` passes.
- `npm run test:e2e -- --grep @ai-real` passes for the link AI journey when the env vars are configured.
