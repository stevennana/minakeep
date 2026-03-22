# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence
1. `067-ui-information-density-reset.md` -> remove redundant explanatory chrome and shift necessary guidance to lighter disclosure patterns
2. `068-public-search-expanded-row-reset.md` -> move expanded public search into its own clean row under the archive header and minimize redundant labels
3. `069-owner-dashboard-notes-priority-reset.md` -> remove the competing owner-tools block plus redundant route shortcuts and reclaim desktop space for Notes
4. `070-owner-links-layout-reset.md` -> stop pinning the short capture form beside the growing saved-links list
5. `071-owner-session-continuity.md` -> preserve authenticated owner continuity when moving between public and private routes
6. `072-ui-refinement-hardening.md` -> reconcile docs, screenshots, and responsive regressions after the refinement wave lands

Tasks `056` through `060` are preserved in completed history as the completed public-surface taste tranche. Tasks `045` through `055` remain preserved as the earlier markdown-editor, media, and container tranches.

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
