# FRONTEND.md

## Goal
Describe the user-facing structure of Minakeep so an agent can implement the UI without guessing the product model.

## Tech Direction
- Next.js application
- TypeScript
- App Router
- server-backed data flows where appropriate

## Route Map
- `/` -> public homepage listing published notes
- `/notes/[slug]` -> public published-note page
- `/login` -> owner sign-in
- `/app` -> private notes-first dashboard shell
- `/app/notes/new` -> create note
- `/app/notes/[id]/edit` -> edit note and preview markdown
- `/app/links` -> private saved-link management
- `/app/tags` -> shared-tag overview
- `/app/search` -> owner-only search and filtering

## Primary Screens
### Public homepage
Shows published notes only, newest first, with title, excerpt, tags, and updated date.

### Public note page
Renders one published markdown note by slug.

### Owner login
Simple credentials form for the single owner account.

### Private dashboard
Notes-first shell with fast links into note creation, link management, tags, and search.

### Note editor
Textarea-based markdown editing with preview.

### Link manager
Manual bookmark form and private list view.

## UI Rules
- keep public reading calm and legible rather than dashboard-like
- keep the private area functional and notes-first
- do not introduce AI affordances, collaboration affordances, or media upload UI in v1
- make placeholder routes honest when the queue has not implemented them yet

## Search / Share / Admin Notes
- search is owner-only in v1
- tags are shared across notes and links
- links stay private even when notes can be public
- publishing is a note-level decision, not a site-wide mode switch

## Frontend Non-Goals for v1
- public search UI
- rich-text editor tooling
- attachment or upload interfaces
- collaborative presence or sharing controls beyond note publishing
