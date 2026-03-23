# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence
1. `087-public-site-origin-foundation.md` -> define the canonical public-site origin contract and fail-closed discovery rules
2. `088-public-sitemap-and-robots.md` -> add `sitemap.xml`, `robots.txt`, and published-note discovery behavior
3. `089-public-seo-discovery-hardening.md` -> align operator docs, regression coverage, and search-console-ready validation

Tasks `080` through `086` are preserved in completed history as the finished settings/delete/upgrade tranche. Earlier completed tranches remain preserved as history.

## Operating rule

A task may be promoted only when its task contract rules are satisfied.

For standard tasks, that means all of the following are true:

- deterministic checks pass
- the evaluator marks the task as `done`
- the evaluator recommends promotion
- the task metadata declares a `next_task_on_success`, or explicitly declares that the queue ends here

For tasks with `"promotion_mode": "deterministic_only"`, evaluator narrative is not required. Those tasks promote only when their required deterministic checks pass and the evaluation state marks them promotion-eligible.

## When this queue ends

When the active sequence is exhausted, do not continue with ad hoc prompts alone.
Update the relevant product specs and design docs first, then seed the next active queue for the next feature wave.
