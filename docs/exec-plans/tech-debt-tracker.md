# Tech Debt Tracker

## Purpose
Track recurring cleanup and deferred concerns that should not remain implicit.

## Current Debt

- AI enrichment retries are still immediate owner actions with no queued backoff or per-attempt audit trail beyond the current visible status fields.
- The shared UI primitives still emit some legacy compatibility class names alongside the `ui-*` hooks, so the visual system is centralized but not yet fully de-aliased.
- UI hardening is regression-proof at the route level through screenshot coverage, but the design system still lacks smaller primitive-level presentation contracts outside the Playwright suite.
- Some mixed-public copy remains note-centric on note-detail return paths and nearby labels; the compact homepage shell is aligned after the public-home density pass, but a later low-risk UI copy pass should finish that wording cleanup without broadening the route contract.
- The source-first note editor now has deterministic transform and mode-sync coverage, but split view still lacks source-to-preview scroll sync for longer notes, so long-form review can drift until a later focused editor pass addresses it.
- Docker packaging still does not run a daemon-backed container boot inside `npm run verify`; the current repo contract is the explicit `docker build -t minakeep:test .` plus `docker compose config` proof path, with full image boot remaining an operator/CI-host check where Docker is available.
