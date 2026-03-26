# FRONTEND.md

## Goal
Describe the user-facing structure of Minakeep so an agent can implement the UI without guessing the product model.

## Tech Direction
- Next.js application
- TypeScript
- App Router
- server-backed data flows where appropriate
- reusable presentational components layered above existing route and feature logic

## Route Map
- `/` -> public showroom of published notes and published links
- `/notes/[slug]` -> public published-note reading page
- `/sitemap.xml` -> machine-readable sitemap for the homepage and published notes when the public site origin is configured
- `/robots.txt` -> crawler rules plus sitemap advertisement when the public site origin is configured
- `/login` -> owner sign-in
- `/login` may also admit a read-only demonstration user when demo credentials are configured
- `/app` -> private notes-first dashboard shell
- `/app/notes/new` -> create note
- `/app/notes/[id]/edit` -> edit note and preview markdown
- `/app/links` -> private saved-link management with publish controls
- `/app/tags` -> shared-tag overview
- `/app/search` -> owner-only search and filtering
- `/app/settings` -> owner-only configuration section for site-wide service settings
- media delivery should use server-backed URLs that respect owner/private and published/public boundaries

## Primary Screens
### Public homepage
Acts as a mixed public showroom first. It should emphasize a dynamic masonry-style archive of published note and published link previews, remove the old owner-entrance side section, keep framing copy minimal, use a compact archive header instead of a hero block, keep the public title-only search control collapsed into a small button-and-summary row until the visitor explicitly expands it, and load only the first 10 matching public items before continuing automatically from a bottom `Load more` control.

### Public note page
Prioritizes reading comfort with narrower measure, calmer human-made typography, quieter metadata, uploaded note images, and supporting AI summary/tags.

### Published link cards
Appear in the public showroom alongside note cards, with a cached favicon head image, title, summary, and tags, and open the external destination in a new tab.

### Owner login
Simple credentials screen with reduced visual bulk and cleaner desktop/mobile balance. Public navigation should preserve owner continuity when an authenticated owner moves between public and private routes. When demo credentials are configured, the login surface should also admit the demonstration user without implying write access.

### Private dashboard
Compact professional workspace with slimmer navigation, tighter lists, and more visible note content above the fold on desktop. Secondary route-promoting blocks should not steal prime desktop width from the Notes section. The notes list should load the first 20 items and continue from a bottom `Load more` control when the owner reaches it.

### Demonstration workspace mode
The demonstration user should see the same owner workspace routes and content model, but all mutating actions must be unavailable or clearly disabled. The demo experience is for product inspection, not content editing.

### Note editor and owner forms
Smaller typographic hierarchy, reduced padding, and reusable form/layout primitives without changing existing logic flows. The note editor should evolve into a source-first markdown workbench with syntax-aware editing, a compact formatting toolbar, `Source / Split / Preview` modes on desktop, a cleaner `Edit / Preview` toggle on mobile, and an upload path that inserts note images into markdown automatically.

### Links, tags, and search
Secondary owner surfaces should inherit the same density and responsive behavior as the dashboard rather than looking like oversized standalone cards. The links route should load the first 20 saved links and continue from a bottom `Load more` control when the owner reaches it.

### Settings
The owner workspace should expose a dedicated settings section for service configuration. The first wave needs only title and description, but the route and storage model should feel like the start of an extendable settings area rather than an isolated one-off form.

## UI Rules
- keep public reading calm, clear, and note-first
- make the published content visually dominant; topbar chrome, archive counters, and search affordances should feel recessive
- reduce non-essential informational copy across public and owner screens; obvious controls should not require explanatory paragraphs
- reserve persistent helper text for guidance that materially changes user action or trust, and prefer lighter disclosure such as tooltip-style help for optional guidance
- the public homepage no longer needs a separate “Owner entrance” or “Private origin” section
- use one unified title-only public search bar without a type selector
- keep the public search control compact or collapsed on first load so the showroom remains visible in the first screen
- when expanded, the public search panel should sit on its own row beneath the archive header rather than as a competing right-side tile beside the archive count
- expanded public search should use minimal labeling rather than repeating obvious “search” language around the field
- do not spend first-screen space on multi-paragraph explanatory copy above the public showroom
- prefer a masonry-style desktop archive with 3 to 4 columns depending on width, then fall back aggressively to 2 columns on tablet and 1 column on narrow mobile
- if masonry behavior is implemented with CSS multi-columns, child cards must use `break-inside: avoid` and mobile must collapse back to a strict ordered stack
- published link cards should look related to note cards but remain visibly distinguishable as links
- published note cards may use the first embedded note image as their head image
- link cards should use cached favicons when available instead of depending on third-party icon URLs at render time
- tone down `h1` scale and `strong` emphasis across public and owner surfaces without flattening hierarchy
- avoid generic “AI slop” signatures such as oversized centered heroes, equal three-card marketing rows, glowing accent treatments, or interchangeable SaaS panel chrome
- tags must size to content cleanly, allow long names to wrap or clamp safely, and never let text spill outside the chip background
- prefer premium sans typography for public surfaces over generic system-feel headings; the public site should feel bespoke without drifting into ornamental serif theatrics
- keep the owner workspace compact and professional on desktop
- on the owner dashboard, prioritize the Notes section over route-promotion tiles or owner-tool explainer panels
- do not repeat `Links`, `Tags`, and `Search` as in-panel shortcuts inside the Notes section when the left sidebar already exposes those routes
- on the owner links screen, do not pin the growing saved-links list beside a short static capture form; the growing list should take the dominant continuous space
- owner settings should live in the same navigation system as the other private surfaces rather than in an ad hoc hidden route
- avoid exposing internal implementation details such as DB seeding or route structure as user-facing informational copy
- public navigation should not leave an authenticated owner appearing logged out or force an unnecessary re-login
- demo users may browse owner routes, but all write controls must be disabled, hidden, or replaced with read-only status treatment
- server-side actions must still reject demo-user writes even if a client bypasses the UI
- build reusable design primitives and CSS tokens so style changes do not require route-level logic edits
- make mobile layouts easy to scan and operate with one hand
- keep note authoring markdown-native; richer editor controls should still save one markdown string, not a separate rich-text document model

## Search / Share / Admin Notes
- public search is homepage-only and title-only
- public search resets the visible window to the first 10 matching items whenever the query changes
- public discovery for search engines should expose only routes that are already first-party public pages
- the public search affordance is collapsed or compact by default, shows title-only scope in its collapsed state, and expands only on explicit user action
- closing the expanded public search returns to the collapsed state and clears the active query
- owner search remains private
- tags remain shared across notes and links
- publishing is a per-item decision for both notes and links
- published links open the saved destination in a new tab
- published links do not get first-party sitemap entries in v1 because they do not have internal public detail pages
- AI metadata remains visible but visually secondary to authored content
- uploaded note images remain owner-visible immediately but should reach public routes only through published-note surfaces
- demo mode is read-only across note save, link save, publish, unpublish, retry, upload, and other mutation paths
- owner delete actions require an explicit confirmation and remain unavailable for still-published notes or links

## Frontend Non-Goals for v1
- public search filters by type
- public full-text search over summaries or note bodies
- public link detail pages
- rich-text editor tooling
- arbitrary attachment/upload interfaces beyond note-image uploads
- cloned Karakeep layout or branding
