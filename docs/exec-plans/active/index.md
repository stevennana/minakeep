# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence
1. `073-demo-user-auth-foundation.md` -> add the demo-user role and environment contract across auth, runtime, and Docker docs
2. `074-demo-workspace-read-only-shell.md` -> expose owner workspace routes to the demonstration user with clear read-only UI treatment
3. `075-demo-write-protection.md` -> block all note, link, publish, retry, and upload mutations server-side for the demonstration user
4. `076-demo-docker-and-hardening.md` -> align Docker/env docs and regression coverage for the demo-user wave

Tasks `067` through `072` are preserved in completed history as the completed refinement tranche. Earlier completed tranches remain preserved as history.

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
