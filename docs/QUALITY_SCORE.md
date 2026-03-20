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
| Feature slicing | A- | Notes, publishing, links, tags/search, and hardening all ship as small task slices with matching specs. |
| UX focus | B | Public reading and private authoring stay clearly separated, with owner workflows remaining functional-first. |

## Architecture Layer Scores
| Area | Score | Notes |
|---|---|---|
| Repo structure | A- | Docs-first structure, feature folders, and Ralph loop wiring remain legible after the feature slices landed. |
| Runtime determinism | A- | `db:prepare`, `verify`, `start:smoke`, and logged Playwright server artifacts keep the operator path inspectable. |
| Boundary clarity | B+ | Notes, links, tags/search, owner auth, and operations stay separated with forward-only dependencies. |

## Immediate Quality Priorities
- keep reliability, security, and Ralph loop docs aligned with the shipped automation path
- preserve deterministic runtime prep and production-style startup proof as hard promotion gates
- keep remaining operator and single-node debt explicit instead of leaving it implied
