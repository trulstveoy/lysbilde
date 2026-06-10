# Agent Instructions

## Superpowers

- Use the available Superpowers workflows when they apply to the task.
- Superpowers session tracking, such as `update_plan`, is temporary working state. Persistent task, backlog, spec, plan, review, and artifact records must be written under `docs/`.

## Task And Backlog Tracking

- Use `docs/tasks/` for active, concrete tasks that are selected for work.
- Use one task file per active task, named with a stable numeric prefix and short slug, for example `docs/tasks/0001-tauri-hello-world.md`.
- A task file should capture the goal, current status, scope, links to related plans/specs/reviews, and execution checklist when useful.
- Use `docs/backlog/` for deferred work, ideas, follow-up items, and not-yet-scheduled tasks.
- Move or copy backlog items into `docs/tasks/` when they become active work.
- Use `docs/plans/` for implementation plans produced by the Superpowers planning workflow, for example `docs/plans/0001-tauri-hello-world-plan.md`.

## Documentation And Artifacts

- Store all documentation and generated artifacts under the repository-level `docs/` directory.
- Use meaningful subdirectories inside `docs/` so artifacts stay organized by purpose, for example:
  - `docs/plans/` for implementation plans and task breakdowns.
  - `docs/tasks/` for active task notes, task state, and execution checklists.
  - `docs/backlog/` for deferred work, ideas, follow-up items, and not-yet-scheduled tasks.
  - `docs/reviews/` for review notes and findings.
  - `docs/research/` for investigation notes and source summaries.
  - `docs/decisions/` for architecture or product decisions.
  - `docs/artifacts/` for generated outputs, diagrams, reports, exports, and other deliverables.
- Do not place task documentation or generated artifacts in the repository root unless the user explicitly asks for a root-level file.

## Completion Handoff

- When finishing a task, always end the final response with a concrete next activity so the user does not need to ask what should happen next.
- The next activity should be actionable and specific, for example a command the user can give, the next plan task to execute, a review step, a commit/push step, or a verification step.
- If there are multiple reasonable next activities, recommend one and briefly mention the alternative only if it affects the workflow.
- Keep the next activity short and separate from the work summary.
