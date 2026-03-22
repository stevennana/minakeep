# Workspace Auth Roles

## Goal
Define the authentication and authorization model for the owner and the read-only demonstration user.

## Roles

### Owner
- full access to private workspace routes
- may create, edit, publish, unpublish, retry, upload, and otherwise mutate data

### Demonstration User
- may authenticate into the private workspace
- may view notes, links, tags, search, and note-edit surfaces
- may not create, edit, publish, unpublish, retry, upload, delete, or trigger any data mutation

## Runtime Contract
- demo credentials should be configured through environment variables, parallel to the owner credentials
- `DEMO_USERNAME` and `DEMO_PASSWORD` must either both be set or both be omitted
- `DEMO_USERNAME` must differ from `OWNER_USERNAME`
- the demo account is a runtime-only identity; only the owner password hash is persisted in SQLite
- if demo credentials are absent, the app behaves as owner-only
- auth/session helpers should expose enough role information for route rendering and server-action gating

## Security Rules
- the demonstration role must be enforced server-side, not only in UI rendering
- every server action that mutates data must reject the demonstration user explicitly
- demo access should not weaken private media visibility rules or public/private route boundaries

## UI Rules
- demo users should still see realistic owner screens instead of a fake demo site
- controls that would mutate data should either be disabled with clear read-only treatment or removed when the resulting page remains understandable
- the workspace should communicate read-only mode without becoming a wall of warnings
