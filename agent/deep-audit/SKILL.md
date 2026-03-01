---
name: deep-audit
description: Multi-mode engineering audit and refactor orchestration. Use when you need structured deep, medium, or low audits for (1) a whole project, (2) one section or module, or (3) one feature traced end-to-end across the repository, including clarification questions, system-understanding artifacts, phased section audits, audit-level and section-level work items, and strict verification gates.
---

# Deep Audit

> Run deterministic repository audits with clear artifacts, refactor plans, and delivery gates.

## Core Modes

1. `project`: Audit the full repository and cross-cutting architecture.
2. `section`: Audit one bounded area (module, layer, package, service, or folder).
3. `feature-trace`: Audit one feature across all touched files and layers.

Use depth presets from `references/mode-matrix.md`:
- `deep`: maximal coverage and root-cause analysis.
- `medium`: balanced depth and delivery speed.
- `low`: fast risk scan and prioritized actions.

## Clarification Protocol

Before auditing, build full understanding of the project intent and constraints.

1. Capture purpose, business flow, and critical user journeys in `system-understanding.md`.
2. If ambiguity exists, ask concise questions with options and one recommended option.
3. Log user answers in `clarifications.md` before continuing.

Use:
- `references/discovery-questions.md`

## Language Policy

1. If the user starts in Uzbek or asks for Uzbek, keep conversation in Uzbek.
2. Keep clarification questions, options, recommendations, updates, and final reports in Uzbek.
3. Keep technical tokens unchanged where needed (`typecheck`, `build`, `lint`, file paths, commands).
4. If language preference is unclear, ask one short language confirmation question before deep audit.

## Required Artifacts

Create these artifacts for every audit run:

1. `work-items/audits/<audit-id>/audit-map.md`
2. `work-items/audits/<audit-id>/system-understanding.md`
3. `work-items/audits/<audit-id>/clarifications.md`
4. `work-items/audits/<audit-id>/implementation-plan.md`
5. `work-items/audits/<audit-id>/tasks.md`
6. `work-items/audits/<audit-id>/roadmap.md`
7. `work-items/audits/<audit-id>/sections/<nn>-<section-slug>/section-audit.md`
8. `work-items/audits/<audit-id>/sections/<nn>-<section-slug>/implementation-plan.md`
9. `work-items/audits/<audit-id>/sections/<nn>-<section-slug>/tasks.md`
10. `work-items/audits/<audit-id>/sections/<nn>-<section-slug>/roadmap.md`

Create them quickly with:

```bash
node agent/deep-audit/scripts/init_dynamic_audit.js --mode <project|section|feature-trace> --depth <deep|medium|low> --scope "<target>"
```

Create each section package with:

```bash
node agent/deep-audit/scripts/init_section_audit.js --audit-root "work-items/audits/<audit-id>" --section "<section-name>" --order <nn>
```

Template and checklist details:
- `references/templates.md`
- `references/quality-gates.md`
- `references/phase-protocol.md`

## Execution Workflow

### 1. Discover System Essence First

1. Parse `mode`, `depth`, and exact scope text.
2. Model project essence: domain goals, core flows, non-functional constraints, and risk appetite.
3. If scope is unclear, ask user clarifying questions with options and explicit recommendation.
4. Normalize an `audit-id`: `<mode>-<depth>-<scope-slug>-<stamp>`.
5. Record assumptions and excluded areas in `audit-map.md`.

### 2. Run Phase 0 Gate

1. Run quality checks before deep audit:
```bash
node agent/deep-audit/scripts/run_phase_checks.js --phase "phase-0-baseline"
```
2. If checks fail, stop and log blocker in `clarifications.md`.

### 3. Build Audit Map First

1. Inventory repository sections before deep inspection.
2. Group files into sections by architecture boundary, not by random folders.
3. For each section, add:
- purpose
- key files
- dependencies in and out
- risk label (`critical`, `high`, `medium`, `low`)
4. Run phase gate:
```bash
node agent/deep-audit/scripts/run_phase_checks.js --phase "phase-1-map"
```

### 4. Run Section-by-Section Audit in Phases

1. Create one section package per section inside `sections/`.
2. Each section package must include:
- `section-audit.md`
- `implementation-plan.md`
- `tasks.md`
- `roadmap.md`
3. Process each section in phases (intent -> dependency graph -> findings -> fix options -> confidence).
4. Document:
- findings
- evidence (files and lines)
- impact
- root cause
- recommended fix
- confidence level
5. Cover correctness, reliability, security, performance, testability, and maintainability.
6. Run phase gate after each section:
```bash
node agent/deep-audit/scripts/run_phase_checks.js --phase "phase-2-section-<name>"
```

### 5. Maintain Audit-Level Work Item Pack

1. Keep audit-level files in `work-items/audits/<audit-id>/`.
2. Fill:
- `implementation-plan.md` with phased refactor strategy.
- `tasks.md` with trackable checklist and owners.
- `roadmap.md` with sequencing and dependencies.
3. Link audit-level tasks to section-level findings and section-level plans.
4. Run phase gate:
```bash
node agent/deep-audit/scripts/run_phase_checks.js --phase "phase-3-planning"
```

### 6. Implement Refactor

1. Execute tasks in dependency order.
2. Keep commits scoped and reversible.
3. Update `tasks.md` status after each completed change.
4. Run phase gate after each implementation batch:
```bash
node agent/deep-audit/scripts/run_phase_checks.js --phase "phase-4-implementation"
```

### 7. Verify and Close

1. Run test and quality commands relevant to changed areas.
2. Perform regression checks for impacted flows.
3. Mark unresolved items as explicit follow-up work, never silent omission.
4. Run final gate:
```bash
node agent/deep-audit/scripts/run_phase_checks.js --phase "phase-5-final"
```

### 8. Commit and Push Gate

1. Ensure all required checks in `references/quality-gates.md` pass.
2. Commit with a conventional message aligned to audit scope.
3. Push only after gates pass, branch policy allows it, and user confirmation is explicit.

## Mode Routing Rules

1. Route to `project` when request says full system, full repo, or complete architecture audit.
2. Route to `section` when request targets one module, package, folder, or bounded context.
3. Route to `feature-trace` when request targets one feature behavior across multiple layers.
4. If user gives no depth, default to `medium`.

## Non-Negotiable Rules

1. Never start refactor before `audit-map.md` exists.
2. Never report findings without file-level evidence.
3. Never mark audit complete without section phase reports and section-level task/plan/roadmap files.
4. Never skip phase gate checks (`typecheck`, `build`, `lint`) without recording blocker and user decision.
5. Never push changes if verification fails.
6. Never drop known risks; log them in roadmap follow-ups.

## Output Contract

When returning results, report in this order:

1. `Mode and Scope`
2. `Clarification and System Understanding`
3. `Audit Map Summary`
4. `Section Findings by Phase`
5. `Audit-Level and Section-Level Work Items Created`
6. `Refactor Changes`
7. `Verification Results`
8. `Git Status (commit and push)`

## References

1. [Mode Matrix](references/mode-matrix.md)
2. [Audit Templates](references/templates.md)
3. [Quality Gates](references/quality-gates.md)
4. [Discovery Questions](references/discovery-questions.md)
5. [Phase Protocol](references/phase-protocol.md)
