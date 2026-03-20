# Bootstrap foundation

```json taskmeta
{
  "id": "010-bootstrap-foundation",
  "title": "Bootstrap foundation",
  "order": 10,
  "status": "completed",
  "next_task_on_success": "011-note-authoring",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/PRODUCT_SENSE.md",
    "docs/FRONTEND.md",
    "docs/PLANS.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run start:smoke"
  ],
  "required_files": [
    "package.json",
    "scripts/ralph/run-once.sh",
    "docs/exec-plans/active/index.md"
  ],
  "human_review_triggers": [
    "The task broadens into product-specific feature work",
    "The docs and scaffold disagree on the repo contract",
    "The scaffold does not support the documented deterministic commands"
  ],
  "completed_at": "2026-03-20T07:55:25+00:00"
}
```

## Objective

Bootstrap the repository so it has a coherent docs tree, a minimal Next.js scaffold, and a working Ralph loop foundation.

## Scope

- generate the baseline docs
- create the minimal scaffold
- install the Ralph loop
- expose deterministic commands
- expose an operator-visible `npm run start:logged` path and documented server log levels

## Out of scope

- advanced product features
- polished UI
- optional integrations

## Exit criteria

1. The baseline docs exist.
2. The Next.js scaffold exists.
3. The Ralph scripts exist.
4. `npm run verify` passes.
5. `npm run start:smoke` passes.
6. The repo documents `npm run start:logged`, the `logs/` directory, and the supported server log levels for manual verification.

## Required checks

- `npm run verify`
- `npm run start:smoke`
- targeted unit or smoke checks for the files being introduced, while iterating

## Evaluator notes

Promote only when the docs, scaffold, and Ralph scripts agree on the same repo contract.
Do not promote if `npm run verify` fails, even if the bootstrap looks complete by inspection.
Do not promote if the production-style startup smoke fails, even when `build` passes.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- Note when existing partial implementations were found and reused instead of replaced.
- 2026-03-20T07:00:00Z: bootstrap foundation now targets `011-note-authoring` as the next feature task after handoff.
- 2026-03-20T07:55:25+00:00: automatically completed by the bootstrap skill after docs, scaffold, Ralph wiring, and verify succeeded.
