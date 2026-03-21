# Tech Debt Tracker

## Purpose
Track recurring cleanup and deferred concerns that should not remain implicit.

## Current Debt

- AI enrichment retries are still immediate owner actions with no queued backoff or per-attempt audit trail beyond the current visible status fields.
- The shared UI primitives still emit some legacy compatibility class names alongside the `ui-*` hooks, so the visual system is centralized but not yet fully de-aliased.
- UI hardening is regression-proof at the route level through screenshot coverage, but the design system still lacks smaller primitive-level presentation contracts outside the Playwright suite.
