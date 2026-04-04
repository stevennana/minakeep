# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence

1. `096-mermaid-semantic-rendering-foundation.md` -> replace the fake non-flowchart Mermaid summary renderer with a real shared semantic rendering contract and strengthen invalid-syntax fallback detection.
2. `097-public-mermaid-contract-realignment.md` -> prove published note pages reflect the stricter Mermaid contract for supported roots and supported-root failures.
3. `098-editor-mermaid-regression-closeout.md` -> bring the same stricter Mermaid contract through the owner preview path and close the next Mermaid wave with deterministic replay.

Tasks `092` through `095` remain preserved in completed history as the first Mermaid tranche. This new queue exists because review found two gaps in the shipped renderer: non-flowchart roots are still represented by generic diagram-themed summary cards, and malformed syntax for some supported roots can still appear as a successful render instead of falling back.

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
