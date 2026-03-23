# Next wave hardening

```json taskmeta
{
  "id": "086-next-wave-hardening",
  "title": "Next wave hardening",
  "order": 86,
  "status": "completed",
  "promotion_mode": "standard",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "docs/SECURITY.md",
    "docs/RELIABILITY.md",
    "docs/FRONTEND.md",
    "docs/product-specs/workspace-settings.md",
    "docs/product-specs/owner-content-deletion.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/product-specs/public-note-reading.md",
    "docs/product-specs/docker-packaging.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [
    "docs",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "Docs drift from the shipped delete/settings/reading/showroom/upgrade behavior.",
    "Regression coverage misses one of the new feature fronts.",
    "The hardening pass broadens into unrelated product work instead of closing the wave cleanly."
  ],
  "completed_at": "2026-03-23T05:59:23.134Z"
}
```

## Objective

Harden the full wave by aligning docs, tests, and regression coverage after the feature slices land.

## Scope

- doc alignment across the full wave
- regression coverage review
- cleanup of any wave-level drift

## Out of scope

- new feature fronts beyond this tranche

## Exit criteria

1. The shipped docs match the final behavior across settings, delete, public reading, public showroom, and upgrade safety.
2. Regression coverage protects the new feature fronts.
3. `npm run verify` passes.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when the full wave reads as one coherent shipped tranche rather than several partially integrated slices.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-23T05:43:54.452Z: restored as current task after 085-self-host-upgrade-safety promotion.
- 2026-03-23T05:47:58Z: Audited the shipped wave against the hardening contract. Confirmed settings, delete, public showroom, public note reading, and upgrade-safe runtime behavior are already implemented; remaining work is doc alignment plus a small service-level delete regression.
- 2026-03-23T05:47:58Z: Tightened the shipped docs by confirming the runtime-upgrade design doc status, refining the public-note title-wrap wording to match the shipped desktop behavior, and recording the service-boundary delete invariant in the reliability test strategy.
- 2026-03-23T05:52:06Z: Added unit regression coverage for the note/link unpublished-only delete guards and re-ran the full task gate. `npm run verify` passed with lint, `db:prepare`, typecheck, build, 51 unit tests, 80 Playwright tests, and the two-stage `start:smoke` contract including the legacy SQLite upgrade backup proof.
- 2026-03-23T05:59:23.134Z: automatically promoted after deterministic checks and evaluator approval.
