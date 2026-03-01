# Phase Protocol

Use this protocol for all modes. Keep the same phase names for clear reporting.

## Phase 0: Baseline and Understanding

1. Collect system purpose, domain vocabulary, and critical flows.
2. Fill `system-understanding.md`.
3. Resolve ambiguity with discovery questions.
4. Run:
`node agent/deep-audit/scripts/run_phase_checks.js --phase "phase-0-baseline"`

## Phase 1: Map and Boundaries

1. Build `audit-map.md` with section inventory and dependencies.
2. Assign risk levels and audit order.
3. Run:
`node agent/deep-audit/scripts/run_phase_checks.js --phase "phase-1-map"`

## Phase 2: Section Deep Audit

For each section:

1. Create section package:
`node agent/deep-audit/scripts/init_section_audit.js --audit-root "work-items/audits/<audit-id>" --section "<section-name>" --order <nn>`
2. Confirm section intent and contracts.
3. Trace dependencies, edge cases, and failure points.
4. Log evidence-backed findings into `section-audit.md`.
5. Maintain section-level `implementation-plan.md`, `tasks.md`, and `roadmap.md`.
6. Run:
`node agent/deep-audit/scripts/run_phase_checks.js --phase "phase-2-section-<slug>"`

## Phase 3: Refactor Planning

1. Convert section findings into both audit-level and section-level plans/tasks/roadmaps.
2. Ensure every critical/high finding has section-level task coverage.
3. Ensure audit-level tasks aggregate section-level priorities.
4. Run:
`node agent/deep-audit/scripts/run_phase_checks.js --phase "phase-3-planning"`

## Phase 4: Implementation

1. Execute tasks in dependency order.
2. Keep changes small and reversible.
3. Run after each batch:
`node agent/deep-audit/scripts/run_phase_checks.js --phase "phase-4-implementation"`

## Phase 5: Final Verification and Release Gate

1. Run full relevant test scope and regressions.
2. Verify open risks are explicitly logged in roadmap.
3. Run:
`node agent/deep-audit/scripts/run_phase_checks.js --phase "phase-5-final"`
4. Push only after explicit user confirmation.

## Depth Mapping

| Depth | Mandatory Phase Behavior |
|---|---|
| `deep` | Complete all phases with strict blocking checks |
| `medium` | Complete all phases, allow approved exceptions in `clarifications.md` |
| `low` | Keep same phases but reduce section breadth, never skip final verification |
