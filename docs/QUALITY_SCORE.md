# QUALITY_SCORE.md

## Purpose
Track the current quality level of product domains and architectural layers so agent work can target the weakest areas first.
Quality scores should reflect both implemented behavior and how convincingly the test strategy proves it.

## Rubric
- **0** nonexistent
- **1** sketched only
- **2** scaffoldable and specified
- **3** functional and reasonably verified
- **4** strong, legible, and difficult to accidentally regress

## Product Domain Scores
| Area | Score | Notes |
|---|---|---|
| Product clarity | B | Scope is locked to notes, private links, public note publishing, tags, and owner-only search. |
| Feature slicing | B | Distinct specs and tasks exist, but only the foundation is implemented in this bootstrap pass. |
| UX focus | B | Public reading and private authoring are separated clearly. |

## Architecture Layer Scores
| Area | Score | Notes |
|---|---|---|
| Repo structure | B | Docs-first structure and Ralph loop wiring are part of the foundation. |
| Runtime determinism | B | SQLite prep, startup smoke, and logged startup are mandatory. |
| Boundary clarity | B | Notes, links, tags/search, owner auth, and operations stay separate. |

## Immediate Quality Priorities
- keep the docs and scaffold aligned
- avoid implementing queued feature slices during the bootstrap task
- make route placeholders and tests honest about what is and is not finished
- keep verification fast enough for repeated local use while still proving startup
