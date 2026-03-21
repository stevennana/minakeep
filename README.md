# Minakeep

Minakeep is a self-hosted notes-and-bookmarks site with private capture, selective publishing, AI enrichment, and a polished knowledge-studio UI.

This bookmark site is inspired by the Karakeep project and is built as a demo for the Mina-Ralph loop skill.

## What it does

- private markdown note authoring
- private bookmark capture and management
- selective publishing for notes and links
- public showroom for published content
- AI-generated summaries and tags through a Mina-hosted OpenAI-compatible endpoint
- responsive owner and public UI

## Tech stack

- Next.js App Router
- TypeScript
- Prisma + SQLite
- Playwright
- Ralph-style task loop under `scripts/ralph/`

## Local setup

Install dependencies:

```bash
npm install
```

Prepare the local database:

```bash
npm run db:prepare
```

Configure AI enrichment if you want generated summaries and tags:

```bash
cp .env.example .env.local
```

Required AI environment keys:

```bash
LLM_BASE="https://mina-host.example/v1"
TOKEN="replace-with-a-mina-api-token"
MODEL="replace-with-a-mina-model-id"
```

Optional:

```bash
MINA_AI_TIMEOUT_MS=15000
```

Without `LLM_BASE`, `TOKEN`, and `MODEL`, the app still works for note and bookmark capture, but AI enrichment will stay disabled and saves will continue without generated metadata.

Start the app:

```bash
npm run dev
```

Run the full deterministic verification suite:

```bash
npm run verify
```

## Useful commands

```bash
npm run lint
npm run typecheck
npm run build
npm run test:unit
npm run test:e2e
npm run start:smoke
./scripts/ralph/status.sh
```

Run the real-endpoint AI check when the AI env vars are configured:

```bash
npm run test:e2e -- --grep @ai-real
```

## Project structure

- `src/` application code
- `docs/` product specs, design docs, and execution plans
- `scripts/ralph/` Ralph loop scripts and operator helpers
- `state/` Ralph state, artifacts, and run history
- `tests/` unit and end-to-end coverage

## Notes

- The repo uses the docs tree as the system of record for product and execution planning.
- Active work is tracked in `docs/exec-plans/active/`.
- Completed task history is preserved in `docs/exec-plans/completed/`.
- AI credentials are server-only and should stay in local or shell environment, not committed project files.

## Build journey

This project was built through the Mina-Ralph loop workflow rather than by hand-coding one large feature branch.

The practical flow was:

1. bootstrap the repo around docs-first planning, a Next.js scaffold, and the Ralph task loop
2. define a small active queue with explicit promotion gates
3. implement one task at a time
4. run deterministic checks
5. promote the next task only when the required checks passed
6. reopen planning when one queue wave was exhausted

The Mina-Ralph skill handled the repeatable engineering loop:

- write and refresh product specs, design docs, and exec plans
- keep the repo-local docs tree as the system of record
- implement scoped tasks from the active queue
- run verification commands and Playwright coverage
- maintain Ralph state, task history, and promotion flow

The founder still guided the product direction between waves. In other words, this repository was not created with zero human input; it was built through founder-directed wave planning plus skill-driven implementation and verification.

### Major waves so far

- bootstrap foundation and core note flow
- public note publishing
- private link capture plus owner retrieval
- AI enrichment foundation, note AI, and link AI
- broad UI refresh and owner-workspace density work
- public mixed showroom, public link publishing, and public title-only search
- public-home density refinement
- markdown editor workbench, toolbar, modes, mobile workflow, and hardening

For the concrete promotion history, see [state/task-history.md](/Users/stevenna/WebstormProjects/minakeep/state/task-history.md).
