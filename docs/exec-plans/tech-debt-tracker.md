# Tech Debt Tracker

## Purpose
Track recurring cleanup and deferred concerns that should not remain implicit.

## Current Debt

- AI enrichment retries are still immediate owner actions with no queued backoff or per-attempt audit trail beyond the current visible status fields.
