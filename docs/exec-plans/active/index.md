# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence
1. `041-public-search-collapsed-default.md` -> collapse the public title-search control by default so showroom content stays in the first screen
2. `042-public-showroom-first-screen-priority.md` -> remove non-essential explanatory copy and tighten the public-home shell around the showroom
3. `043-public-home-density-regression-pass.md` -> prove the collapsed-search and first-screen showroom behavior across desktop and mobile UI checks
4. `044-public-home-wave-hardening.md` -> reconcile docs, debt tracking, and any remaining public-home polish after the narrow slices land

Tasks `031` through `040` are preserved in completed history as the previous public-wave tranche.

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
