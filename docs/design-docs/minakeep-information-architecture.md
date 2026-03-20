# Minakeep Information Architecture

## Goal
Keep Minakeep legible by separating public reading from private authoring from the first scaffold onward.

## Public Surface
- `/` is the public homepage for published notes only
- `/notes/[slug]` is the only public content-detail route in v1
- public routes should feel calm and reading-oriented, not like an admin dashboard

## Private Surface
- `/login` handles owner authentication
- `/app` is the private landing shell after authentication
- `/app/notes/*` owns note drafting and editing
- `/app/links` owns private link capture
- `/app/tags` and `/app/search` own retrieval and organization

## Bootstrap Rule
- placeholder screens are acceptable in the foundation task only when they state clearly which queued task owns the missing behavior
- route shells should exist early when they materially reduce ambiguity in docs, queue design, and later implementation

## Navigation Rule
- public navigation stays minimal
- private navigation stays notes-first even when links, tags, and search exist
- new feature waves should attach to the existing public/private split instead of inventing a second admin surface
