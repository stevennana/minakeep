# AI enrichment foundation

```json taskmeta
{
  "id": "016-ai-enrichment-foundation",
  "title": "AI enrichment foundation",
  "order": 16,
  "status": "completed",
  "next_task_on_success": "017-note-ai-enrichment",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/RELIABILITY.md",
    "docs/SECURITY.md",
    "docs/design-docs/ai-enrichment-lifecycle.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [
    ".env.example",
    "src",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The task starts implementing note or link-specific UI instead of shared enrichment plumbing.",
    "The AI client leaks shell credentials into client-side code or committed config.",
    "The real-endpoint AI promotion gate is left implied instead of explicit."
  ],
  "completed_at": "2026-03-20T17:51:26.889Z"
}
```

## Objective

Introduce the shared Mina-hosted OpenAI-compatible integration layer, enrichment-state model, and promotion-safe real-endpoint test contract needed for the AI wave.

## Scope

- add a dedicated server-side AI client boundary for `LLM_BASE`, `TOKEN`, and `MODEL`
- define how notes and links record enrichment status such as pending, ready, and failed
- add retry-friendly service interfaces without yet polishing note- or link-specific UX deeply
- establish the real-endpoint E2E tagging strategy for promotable AI tasks

## Out of scope

- full note-specific enrichment UX
- full link-specific enrichment UX
- broad visual redesign work
- AI chat or multi-provider support

## Exit criteria

1. The codebase has one narrow server-side AI integration path for the Mina-hosted OpenAI-compatible endpoint.
2. Notes and links have a shared enrichment-state contract that later tasks can use without guessing.
3. The AI-task promotion rules explicitly require a real-endpoint E2E path when the AI env vars are configured.
4. `npm run verify` passes.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when the foundation clearly prepares later note/link AI tasks without already collapsing those feature fronts together.
Do not promote if credential handling, failure-state rules, or promotion-gate commands are still ambiguous.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- Note when existing helpers or tests were reused instead of duplicated.
- 2026-03-21 02:31 KST: Extended the existing Prisma note/link models instead of creating parallel AI tables, adding shared enrichment status, error, attempt count, and timestamp fields that both fronts can reuse.
- 2026-03-21 02:31 KST: Added one server-side Mina OpenAI-compatible client boundary plus shared enrichment state helpers, then reused the existing note/link repos and services by extending them with retry-friendly enrichment state methods rather than replacing their save flows.
- 2026-03-21 02:31 KST: Made the real-endpoint contract explicit in `.env.example`, reliability/architecture/design docs, and the shared `tests/e2e/ai-real.ts` helper so later promotable AI tasks can use `@ai-real` without inventing another test gate.
- 2026-03-21 02:42 KST: Hardened the Mina AI credential path by moving `LLM_BASE`, `TOKEN`, and `MODEL` reads into a dedicated server-only config module, then pointed the enrichment service and unit tests at that boundary so accidental client imports fail earlier.
- 2026-03-20T17:51:26.889Z: automatically promoted after deterministic checks and evaluator approval.
