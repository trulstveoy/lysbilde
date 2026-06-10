# 0001 - Annotation Layer Boundary

## Status

Accepted

## Context

Lysbilde presents existing HTML files as slides. The product specification requires future annotations such as sticky notes, text comments, arrows, rectangles, and highlights, while preserving the rule that original HTML files are never modified.

## Decision

Annotations are project-owned data, not slide-source data. Each slide may reference one or more annotation layer files stored inside the Lysbilde project directory. The source HTML file remains read-only input.

The project model keeps an `annotations` collection so the project format already has a stable extension point. The phase 1 UI does not expose annotation tools yet.

## Consequences

- Imported HTML files can be regenerated or replaced without hidden Lysbilde edits.
- Annotation rendering can be added later as an overlay above the slide viewing surface.
- Project backup/export must include annotation layer files in addition to `project.json`.
- Missing source files and missing annotation layers can be handled independently.
