# Note AI enrichment

## Goal
Let Minakeep automatically generate AI-owned summary and tags for notes after save, while keeping note writing fast and resilient.

## Trigger / Entry
The owner creates or updates a note from the private note editor.

## User-Visible Behavior
- After note save, Minakeep starts AI enrichment automatically.
- The note editor and owner-facing lists show whether enrichment is pending, ready, or failed.
- When enrichment succeeds, the generated summary and tags become visible across relevant owner surfaces.
- If enrichment fails, the note still saves and the owner can retry enrichment.

## Validation
- A saved note can complete a real-endpoint enrichment flow when `LLM_BASE`, `TOKEN`, and `MODEL` are configured.
- AI enrichment failure does not block note save.
- Generated note metadata appears in the owner UI where the related docs say it should.
- `npm run verify` passes.
- `npm run test:e2e -- --grep @ai-real` passes for the note AI journey when the env vars are configured.
