# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence
1. `016-ai-enrichment-foundation.md` -> establish the Mina-hosted OpenAI-compatible client boundary, enrichment state model, and promotion-safe real-endpoint test contract
2. `017-note-ai-enrichment.md` -> add automatic note summary/tag enrichment with visible status and retry behavior
3. `018-link-ai-enrichment.md` -> add automatic link summary/tag enrichment with visible status and retry behavior
4. `019-knowledge-studio-ui-refresh.md` -> refresh the full app into a cohesive elegant knowledge-studio interface
5. `020-ai-ui-hardening.md` -> reconcile AI reliability, security, and UI polish after the new wave lands

## Operating rule

A task may be promoted only when all of the following are true:

- deterministic checks pass
- the evaluator marks the task as `done`
- the evaluator recommends promotion
- the task metadata declares a `next_task_on_success`, or explicitly declares that the queue ends here

## When this queue ends

When the active sequence is exhausted, do not continue with ad hoc prompts alone.
Update the relevant product specs and design docs first, then seed the next active queue for the next feature wave.
