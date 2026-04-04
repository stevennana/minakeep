# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence

1. `102-mermaid-expansion-hardening.md` -> close the expansion wave with bundled regression replay, fallback verification, and queue/doc reconciliation.

Tasks `099` through `101` are already preserved in completed history as the completed expansion steps. Tasks `092` through `098` remain preserved in completed history as the earlier Mermaid tranche. This queue now ends with task `102`, which reconciles the shipped renderer contract and deterministic replay coverage rather than introducing new Mermaid scope.

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
