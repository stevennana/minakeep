# Minakeep Ralph Loop v2

This package upgrades the repository from a **repair loop** to a **task-promotion loop**.

## What changed

The first version of the loop could repeatedly work on one prompt, but it could not
reliably decide when to advance. This version adds:

- machine-readable task contracts in `docs/exec-plans/active/*.md`
- deterministic checks
- a read-only evaluator pass with structured JSON output
- automatic promotion to the next task when the current task is truly complete

## Why this matches the OpenAI harness pattern

OpenAI’s harness engineering article describes a system where:
- humans specify intent
- repository docs act as the system of record
- agents iterate until reviewers are satisfied
- short `AGENTS.md` files point to a structured `docs/` tree

This loop makes that concrete for Minakeep by treating the task docs as executable
contracts and adding a separate evaluator step before promotion.

## Files

- `scripts/ralph/run-once.sh`: one full worker/evaluator/promotion cycle
- `scripts/ralph/run-loop.sh`: repeated unattended cycles
- `scripts/ralph/ensure-e2e-port-free.sh`: clears port `3100` before E2E-capable verification commands
- `scripts/ralph/status.sh`: inspect current task, latest evaluation, and backlog
- `scripts/ralph/render-task-prompt.mjs`: build the worker prompt from the current task
- `scripts/ralph/evaluate-task.mjs`: run deterministic checks and a read-only evaluator
- `scripts/ralph/promote-task.mjs`: move a finished task forward
- `scripts/playwright-web-server.mjs`: wraps the Playwright web server so evaluator-set server log paths capture Next.js output
- `state/current-task.txt`: current task id
- `state/current-cycle.json`: live cycle phase/status for the current run
- `state/evaluation.json`: latest decision
- `state/backlog.md`: rendered queue snapshot
- `state/artifacts/`: per-cycle raw worker/evaluator/commit artifacts

## Safety defaults

The worker run uses:

- `--sandbox workspace-write`
- `--full-auto`

The evaluator run uses:

- `--sandbox read-only`
- `--output-schema ...`

This keeps the evaluator non-mutating and machine-readable.

Before Playwright-backed verification, the harness forcibly clears any listener on
`127.0.0.1:3100`. This is intentionally aggressive and can terminate unrelated
local work that is bound to that port.

## Logging

- `state/run-log.md` is the compact operator log
- `state/current-cycle.json` shows whether the current run is still active and which phase it is in
- full raw output for each cycle is written under `state/artifacts/`
- Playwright-backed verification also writes Next.js server output to a per-cycle `*-next-server.log` artifact
- manual operator runs should use `npm run start:logged`, which writes a timestamped Next.js server log under `logs/`
- generated repos should document a server log level environment variable such as `LOG_LEVEL`, with at least `trace`, `debug`, `info`, `warn`, and `error`
- inspect artifact files when the compact log points to a failed phase
- `state/run-log.md` also appends a compact health line after each cycle: `o` for promoted success, `x` for completed non-promotion/failure, and `!` for stalled worker recovery

## Recommended usage

### Dry run one cycle

```bash
./scripts/ralph/run-once.sh
./scripts/ralph/status.sh
```

### Run a longer unattended loop

```bash
RALPH_LOOP_SLEEP_SECONDS=45 ./scripts/ralph/run-loop.sh
```

Default sleep is `30` seconds when `RALPH_LOOP_SLEEP_SECONDS` is not set.

### Observe progress

```bash
tail -f state/run-log.md
cat state/last-result.txt
cat state/evaluation.json
cat state/current-cycle.json
ls logs/
tail -f logs/server-*.log
```

### Run the AI promotion gate

```bash
export LLM_BASE="https://mina-host.example/v1"
export TOKEN="replace-with-a-mina-api-token"
export MODEL="replace-with-a-mina-model-id"
npm run test:e2e -- --grep @ai-real
```

`npm run verify` is still required, but it does not replace the separate `@ai-real` run for promotable AI work.

## Operator guidance

- Keep tasks small and vertically sliced.
- Prefer deterministic gates plus evaluator review over “try harder” loops.
- Do not mix multiple feature fronts into one task.
- `run-once.sh` always rewrites `state/current-cycle.json`, `state/evaluation.json`, `state/backlog.md`, and `state/last-result.txt`; treat those as loop-owned state.
- if the worker goes silent and `worker.jsonl` stops changing past the stall timeout, the harness marks the cycle as `stalled`, writes a stall artifact, appends `!` to the health line, and stops the unattended loop for RCA
- Required commands come from each task doc’s `taskmeta.required_commands`; `evaluate-task.mjs` runs exactly those commands plus required-file checks.
- Port cleanup is executed automatically only by the evaluator path for `npm run verify`, `npm run test:e2e`, or other Playwright-bearing commands. Manual local runs do not get that cleanup for free.
- `scripts/playwright-web-server.mjs` mirrors Playwright's Next.js server output to `MINAKEEP_NEXT_SERVER_LOG` when the evaluator provides that path.
- `ensure-e2e-port-free.sh` is intentionally aggressive and may terminate unrelated processes bound to `127.0.0.1:3100`.
- Playwright-backed promotion checks run with one worker because the suite shares one mutable SQLite runtime state; if that assumption changes, update the docs and harness together.
- If `npm run test:e2e -- --grep @ai-real` cannot run because `LLM_BASE`, `TOKEN`, and `MODEL` are missing or the Mina endpoint is unavailable, record that as an external-env blocker instead of folding it into generic product failure wording.
- If the evaluator repeatedly returns `not_done`, tighten the active task doc instead of making the prompt larger.
- If a task is semantically done but not promotable, fix the contract or the deterministic checks; do not manually skip ahead silently.
