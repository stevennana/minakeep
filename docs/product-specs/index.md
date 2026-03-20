# Product Specs Index

## Purpose
This directory contains user-facing behavior specs.
If a UI or API behavior is visible to users, it should be defined here before implementation drifts.

## Current Spec Set
| Spec | Status | Scope |
|---|---|---|
| `note-authoring.md` | confirmed | Private note drafting, preview, and note-side AI metadata visibility |
| `public-note-publishing.md` | confirmed | Public note visibility and note pages |
| `link-capture.md` | confirmed | Private bookmark capture with AI-owned summary/tag metadata |
| `tag-filtering-and-owner-search.md` | confirmed | Shared tags and basic private retrieval |
| `note-ai-enrichment.md` | confirmed | Automatic AI summary/tag generation for notes |
| `link-ai-enrichment.md` | confirmed | Automatic AI summary/tag generation for links |
| `knowledge-studio-ui-refresh.md` | confirmed | Full-app visual redesign |

## Editing Rule
When product behavior changes:
1. update the relevant spec
2. update the affected design or architecture docs if needed
3. only then adjust implementation plans
