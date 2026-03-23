# Design Docs Index

## Purpose
This directory contains durable design decisions that are deeper than the top-level architecture map and more stable than task plans.

## Current Docs
| Doc | Status | Scope |
|---|---|---|
| `core-beliefs.md` | confirmed | operating principles for the repo |
| `system-shape.md` | confirmed | project-specific design constraints |
| `minakeep-information-architecture.md` | confirmed | public/private route split and navigation responsibilities |
| `minakeep-content-model.md` | confirmed | owner, note, link, tag, publish-state, and enrichment-state decisions |
| `ai-enrichment-lifecycle.md` | confirmed | automatic AI summary/tag generation, failure handling, and retry contract |
| `knowledge-studio-visual-system.md` | confirmed | previous broad visual-system direction for the shipped tranche |
| `cool-monochrome-visual-system.md` | confirmed | next-wave visual system, tokens, and reusable styling primitives |
| `public-surface-taste-rules.md` | confirmed | content-first public-surface design directives derived from the Taste skill and masonry references |
| `progressive-disclosure-rules.md` | confirmed | remove redundant helper copy and reserve visible guidance for real need |
| `workspace-auth-roles.md` | confirmed | owner vs demo-user permissions and route behavior |
| `external-note-api-boundary.md` | confirmed | static-key remote note-create boundary and server-owned note lifecycle rules |
| `site-configuration-architecture.md` | proposed | owner-editable site branding and extensible settings-domain rules |
| `homepage-showroom-rhythm.md` | confirmed | public homepage composition, dynamic grid behavior, and preview-card rhythm |
| `media-storage-and-serving.md` | confirmed | mounted media storage, publish-gated image serving, and derived card-image rules |
| `container-runtime-packaging.md` | confirmed | Docker image, Compose, mounted volumes, and env-driven operator packaging |
| `runtime-upgrade-and-backup.md` | proposed | upgrade-safe schema changes and automatic SQLite backup rules for self-host/Docker paths |
| `public-home-first-screen-density.md` | confirmed | collapsed search chrome, minimal framing copy, and first-screen showroom priority |
| `markdown-editor-workbench.md` | confirmed | source-first note-editor architecture, view modes, toolbar rules, and mobile authoring behavior |
| `owner-workspace-density.md` | confirmed | desktop density rules, slimmer navigation, and compact owner layouts |
| `responsive-ui-rules.md` | confirmed | mobile-first collapse behavior and breakpoint-specific composition rules |
| `../references/ui-verification-contract.md` | confirmed | deterministic screenshot/responsive/accessibility rules for the UI wave |

## Rule
When a rule keeps getting re-explained in prompts or review comments, promote it into a design doc, test, or static check.
