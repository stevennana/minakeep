# Product Specs Index

## Purpose
This directory contains user-facing behavior specs.
If a UI or API behavior is visible to users, it should be defined here before implementation drifts.

## Current Spec Set
| Spec | Status | Scope |
|---|---|---|
| `note-authoring.md` | confirmed | Private note drafting, preview, and note-side AI metadata visibility |
| `markdown-editor-workbench.md` | confirmed | Source-first markdown editor modes, toolbar, shortcuts, and mobile authoring behavior |
| `note-image-attachments.md` | confirmed | Uploaded note images, markdown embedding, and derived note-card image behavior |
| `external-note-api.md` | confirmed | Server-to-server note creation through one environment API key |
| `workspace-settings.md` | confirmed | Owner-editable site title/description with an extensible settings surface |
| `owner-content-deletion.md` | proposed | Permanent delete for unpublished owner notes and links |
| `public-note-publishing.md` | confirmed | Public note visibility and note pages |
| `link-capture.md` | confirmed | Private bookmark capture with AI-owned summary/tag metadata |
| `link-favicon-caching.md` | confirmed | Cached favicon fetch and card rendering for saved links |
| `tag-filtering-and-owner-search.md` | confirmed | Shared tags and basic private retrieval |
| `note-ai-enrichment.md` | confirmed | Automatic AI summary/tag generation for notes |
| `link-ai-enrichment.md` | confirmed | Automatic AI summary/tag generation for links |
| `docker-packaging.md` | confirmed | Docker image, Compose path, mounted volumes, and env-driven runtime setup |
| `knowledge-studio-ui-refresh.md` | completed | Previous broad visual redesign tranche |
| `public-surface-human-design-reset.md` | confirmed | Content-first, bespoke public-surface redesign rules for the next wave |
| `ui-progressive-disclosure.md` | confirmed | Reduce redundant helper copy and rely on lighter disclosure where help is truly needed |
| `public-home-showroom.md` | confirmed | Mixed public showroom of published notes and links |
| `public-note-reading.md` | confirmed | Public note reading polish and metadata hierarchy |
| `owner-workspace-density.md` | confirmed | Tighter professional owner layout for desktop and mobile |
| `owner-session-continuity.md` | confirmed | Preserve owner continuity across public and private route switching |
| `demo-workspace-user.md` | confirmed | Read-only demonstration access to the owner workspace |
| `responsive-ui-behavior.md` | confirmed | Cross-surface responsive collapse and mobile scanning behavior |
| `public-link-publishing.md` | confirmed | Publish/unpublish links into the public showroom |
| `public-showroom-search.md` | confirmed | Unified title-only public homepage search |
| `ui-hierarchy-softening.md` | confirmed | Toned-down `h1` and `strong` hierarchy across surfaces |

## Editing Rule
When product behavior changes:
1. update the relevant spec
2. update the affected design or architecture docs if needed
3. only then adjust implementation plans
