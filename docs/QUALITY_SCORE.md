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
| Product clarity | A- | The public/private knowledge-studio shape is stable, and the mixed public wave now documents both the showroom contract and the fail-closed handling for invalid published-link data alongside the full-suite `@ui-regression` gate. |
| Feature slicing | B+ | The redesign was corrected through smaller route/system tasks, and the final hardening pass now validates the whole surface deterministically. |
| UX focus | B+ | The public and owner surfaces now read as one coherent, cooler, denser system; remaining work is cleanup and regression resistance rather than a new direction. |

## Architecture Layer Scores
| Area | Score | Notes |
|---|---|---|
| Repo structure | A- | Docs-first structure and feature folders remain legible. |
| Runtime determinism | A | Verification and startup proof remain solid, and the UI wave now has a deterministic full-regression Playwright gate instead of relying on per-surface tags alone. |
| Boundary clarity | A- | Logic boundaries are good, compact surface styling lives in the shared `Surface` primitive, and the mixed public feed now owns unsafe-link filtering in the shared `public-content` boundary instead of only in the homepage route. |

## Immediate Quality Priorities
- introduce shared design tokens and reusable presentation components
- keep the `@ui-regression` screenshot baselines trustworthy as future feature work lands
- retire compatibility-only legacy UI class aliases once the remaining selectors and tests can move cleanly onto the shared `ui-*` hooks
- add smaller presentation contracts if route-level screenshot coverage starts hiding primitive-level drift
- tighten the remaining note-centric copy on mixed public surfaces in a deliberate follow-up pass rather than drifting it piecemeal
