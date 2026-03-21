# Media and container hardening

```json taskmeta
{
  "id": "055-media-and-container-hardening",
  "title": "Media and container hardening",
  "order": 55,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/RELIABILITY.md",
    "docs/SECURITY.md",
    "docs/product-specs/note-image-attachments.md",
    "docs/product-specs/link-favicon-caching.md",
    "docs/product-specs/docker-packaging.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @media-regression"
  ],
  "required_files": [
    "docs",
    "src",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Docs and shipped media/container behavior drift apart.",
    "Media visibility or favicon fallback regressions are left without regression coverage.",
    "Docker packaging still lacks a deterministic operator proof path."
  ]
}
```

## Objective

Reconcile docs, security, reliability, and regression coverage after the media and container wave lands.

## Scope

- doc alignment
- regression coverage for media and favicon behavior
- remaining Docker/operator proof cleanup

## Out of scope

- new attachment types
- object storage
- orchestration platforms beyond the Docker/Compose path already chosen

## Exit criteria

1. Docs reflect the shipped media and Docker behavior accurately.
2. Media visibility and favicon fallback regressions are covered deterministically.
3. Remaining container/operator debt is resolved or explicitly tracked.
4. `npm run test:e2e -- --grep @media-regression` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @media-regression`

## Evaluator notes

Promote only when the media and Docker wave is documented, hardened, and consistent with the private-vault model.

## Progress log

- Start here. Append timestamped progress notes as work lands.
