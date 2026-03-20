# SECURITY.md

## Purpose
Define the security posture for Minakeep's current shipped slice.

## Core Security Rules
- keep `/app` routes private to the owner account
- expose only published notes on public routes
- do not log secrets, passwords, session tokens, or full private note/link payloads
- validate owner credentials on the server only

## Secrets and Config
- keep `AUTH_SECRET`, `DATABASE_URL`, `OWNER_USERNAME`, and `OWNER_PASSWORD` in environment configuration only
- never commit seeded credentials or secret values
- document required environment variables in `.env.example` and runtime docs

## Public Surfaces
- `/` and `/notes/[slug]` are public
- `/login` is public but only for owner authentication
- `/app/*` routes are private
- API health checks must expose only non-sensitive readiness information

## Verification
- private routes redirect unauthenticated users to `/login`
- unpublished notes never render on public routes
- no secrets appear in logs, docs examples, or test fixtures
- owner auth and route protection stay covered by automated checks before promotion
