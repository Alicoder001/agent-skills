# Quality Gates

## 1. Pre-Refactor Gate

All must pass before code changes:

- Scope and depth are explicit.
- `system-understanding.md` captures project essence and critical flows.
- Open ambiguity is resolved in `clarifications.md`.
- `audit-map.md` exists and lists sections.
- Audit-level `implementation-plan.md`, `tasks.md`, and `roadmap.md` exist.
- Section package files exist for each active section: `section-audit.md`, `implementation-plan.md`, `tasks.md`, `roadmap.md`.
- Critical and high findings are prioritized in section-level `tasks.md` and reflected in audit-level `tasks.md`.

## 2. Phase Gate (Mandatory)

After each phase, run quality checks:

```bash
node agent/deep-audit/scripts/run_phase_checks.js --phase "<phase-name>"
```

Required checks:

- `typecheck`
- `build`
- `lint`

If a required check command is missing or fails:

1. Stop progression.
2. Record blocker in `clarifications.md`.
3. Request user decision with recommended option before continuing.

## 3. Refactor Completion Gate

All must pass before declaring implementation complete:

- Each completed task maps to one or more findings.
- No unresolved critical findings remain untracked.
- New or changed behavior has test coverage or explicit risk note.
- Audit-level and section-level `implementation-plan.md` and `roadmap.md` reflect final state.

## 4. Verification Gate

Run applicable checks:

- Phase gate checks completed for all executed phases.
- Lint or static analysis for touched scope.
- Unit/integration tests for touched scope.
- Feature-path regression checks for `feature-trace`.
- Manual sanity checks for user-visible behavior.

Record output summary directly in the final audit report.

## 5. Git Gate

Before commit:

- Working tree contains only intended files.
- Commit message clearly states audit scope.
- No temporary scaffold files remain unfinished.

Before push:

- Verification gate passed.
- Branch policy satisfied.
- Target branch is confirmed.
- User confirmation for push is recorded.

If any gate fails, stop and return blocker details with a recovery action.
