# AGENTS.md

## Purpose
Minakeep is a self-hosted knowledge vault for private markdown notes and saved links, with selectively published public notes.

This repository is optimized for agent-legible development and a Ralph-style task-promotion loop.

## Read Order
Before changing code or plans, read these files in order:

1. `ARCHITECTURE.md`
2. `docs/PRODUCT_SENSE.md`
3. `docs/design-docs/core-beliefs.md`
4. `docs/product-specs/index.md`
5. `docs/FRONTEND.md`
6. `docs/PLANS.md`
7. active plans in `docs/exec-plans/active/`

## Scope Guardrails
### In scope for v1
- capture private markdown notes
- save private links with manual URL, title, summary, and shared tags
- publish selected notes to a public homepage and public note pages
- organize notes and links with shared tags and owner-only basic search

### Explicitly out of scope for v1
- AI tagging, summarization, or chat features
- multi-user collaboration or invite flows
- browser importers, automation rules, OCR, or content archiving
- public link publishing or anonymous search

## Product Shape
- public homepage lists published notes only
- anonymous readers can open published note pages only
- private owner routes handle note drafting, link saving, tags, and search
- notes are markdown-first; links are manual bookmarks with short summaries

## Technical Shape
- Next.js App Router with TypeScript and npm
- Prisma with SQLite for persistent runtime state
- Auth.js credentials for the single owner account
- Playwright for end-to-end coverage and `node --import tsx --test` for unit coverage
- Ralph loop scripts under `scripts/ralph/` with mutable run state under `state/`

## Validation Strategy
Use layered checks:
- unit tests for domain rules
- integration tests for repository/runtime boundaries where needed
- small E2E coverage for the required user journeys only

Promotion is blocked when required checks fail. Required test commands in active task contracts are hard gates, not suggestions.
While iterating, prefer the smallest targeted check for the code you just changed. Use the full required command set before considering the task done.
If a feature depends on an outside resource such as AI chat or another remote service, keep it in the required E2E flows before allowing promotion.
For manual server inspection, prefer `npm run start:logged` and set `LOG_LEVEL` intentionally instead of relying only on ephemeral terminal output.

### Required E2E flows
- owner sign-in works for the configured owner account
- owner can create and edit a draft markdown note
- owner can publish a note and see it appear on `/`
- anonymous readers can open a published note page
- owner can save a tagged link
- owner can filter or search private content by title, URL, or tag

## Documentation Discipline
- If behavior changes, update the related spec or design doc in the same cycle.
- Prefer small, executable plans over vague TODOs.
- When a repeated mistake appears, first document it; if it keeps recurring, promote it into tests or lint rules.
- Keep the documented test strategy current; do not leave promotion gates implied.
- When adding or editing tests, explain what behavior the test protects if that intent would otherwise be easy to lose.

## Search Discipline
- Search the codebase before concluding that a thing is unimplemented.
- Prefer multiple targeted searches over one broad assumption.
- If you find a partial implementation, adapt or complete it instead of duplicating it blindly.

## Optional Companion Skills
- If the customer allows them and they are installed, consider relevant companion skills before planning or implementation.
- Good candidates include database, Next.js pattern, UI design, responsive UI, and clean-architecture skills.

## Done Definition
- the relevant spec, design docs, and active plan all match the shipped behavior
- required commands in the active task contract pass locally
- `npm run start:smoke` proves the production-style app can boot against prepared SQLite state
- remaining debt and non-goals are documented instead of implied
