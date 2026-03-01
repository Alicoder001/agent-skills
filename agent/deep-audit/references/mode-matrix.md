# Mode Matrix

## 1. Mode Selection

| Mode | Use for | Coverage Target |
|---|---|---|
| `project` | Full repository quality and architecture audit | All major sections and critical paths |
| `section` | One module, package, service, or folder | Entire bounded section and its interfaces |
| `feature-trace` | One user-facing or domain feature | End-to-end flow across layers |

## 2. Depth Profiles

| Depth | Effort | Analysis Style | Output Expectation |
|---|---|---|---|
| `deep` | High | Root-cause, dependency graph, edge-case heavy | Full section findings + full refactor plan |
| `medium` | Medium | Mainline + high-risk branches | Focused findings + prioritized plan |
| `low` | Low | Fast scan + obvious risks | Triage findings + short roadmap |

## 3. Minimum Evidence by Depth

| Depth | Evidence Requirement |
|---|---|
| `deep` | File and line references for all critical/high findings |
| `medium` | File and line references for critical findings, section-level references for others |
| `low` | File-level evidence for top risks only |

## 4. Verification Strictness

| Depth | Verification |
|---|---|
| `deep` | Run phase gate after every phase + full relevant tests + lint + targeted regression validation |
| `medium` | Run phase gate after every phase, allow explicit approved exceptions |
| `low` | Run phase gate after every phase with reduced scope + smoke checks |

## 5. Exit Criteria

### `project`

- `audit-map.md` lists all primary sections.
- Audit-level `implementation-plan.md`, `tasks.md`, and `roadmap.md` exist.
- Every section has a section package with `section-audit.md`, `implementation-plan.md`, `tasks.md`, `roadmap.md`.

### `section`

- Scope boundaries are explicit.
- Section package exists with all four files.
- Section plan and tasks tie directly to findings.
- Audit-level plan and tasks reference this section package.

### `feature-trace`

- Trace starts at user or API entry point and reaches persistence/output.
- Breakpoints and failure points are documented.
- Cross-layer section packages exist for all touched layers.
- Cross-layer refactor tasks are sequenced in audit-level roadmap.
