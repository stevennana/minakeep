# Minakeep

Minakeep is a self-hosted notes-and-bookmarks site with private capture, selective publishing, AI enrichment, and a polished knowledge-studio UI.

This bookmark site is inspired by the Karakeep project and is built as a demo for the Mina-Ralph loop skill.

## What it does

- private markdown note authoring
- private bookmark capture and management
- selective publishing for notes and links
- public showroom for published content
- AI-generated summaries and tags
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
