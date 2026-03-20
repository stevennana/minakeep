# AI Enrichment Lifecycle

## Goal
Define how Minakeep generates, stores, surfaces, and retries AI-generated summary/tag metadata without weakening the core save flow.

## Provider Contract
- use the Mina-hosted OpenAI-compatible endpoint
- keep `LLM_BASE`, `TOKEN`, and `MODEL` in shell or local environment only
- target the chat-completions request shape first
- do not add multi-provider routing in this wave

## Trigger Model
- note enrichment runs automatically after note save
- link enrichment runs automatically after link save
- AI enrichment is not a separate inbox or chat product

## Metadata Ownership
- summary and tags generated in this wave are AI-owned metadata
- authored note title and markdown remain owner-owned
- saved-link URL and title remain owner-owned
- the UI may expose retry and status, but not manual editing of generated fields in this wave

## Failure Rules
- save succeeds even if enrichment fails or times out
- the UI must record visible enrichment status such as `pending`, `ready`, or `failed`
- notes and links store shared enrichment fields for status, error, attempt count, and last state update so later slices do not need to invent their own contract
- failed enrichment must have a retry path
- retry is only a recovery path for records already in the visible failed state; pending work should refresh in place instead of exposing duplicate retry controls
- failure state must not look like silent success
- disabled or partial AI env config must surface a visible failure that explains the configuration gap without exposing secret values

## Verification Rules
- unit tests must cover request shaping, response normalization, and state transitions
- AI-task promotion must include a real-endpoint E2E flow when `LLM_BASE`, `TOKEN`, and `MODEL` are configured
- the real-endpoint Playwright journeys use the `@ai-real` tag and the shared env helper under `tests/e2e/ai-real.ts`
- mock-only tests are insufficient for promotion of the AI feature tasks
