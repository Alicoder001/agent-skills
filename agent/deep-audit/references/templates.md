# Audit Templates

## 1. `audit-map.md`

```markdown
# Audit Map: <audit-id>

## Scope
- Mode: <project|section|feature-trace>
- Depth: <deep|medium|low>
- Continuity: <section-lock|full-lock|manual-pause>
- Target: <scope text>
- Exclusions: <if any>

## System Understanding
- Domain purpose:
- Core user flows:
- Critical constraints:
- Success criteria:

## Clarification Log
- Savol:
- Variantlar:
- Tavsiya etilgan:
- Foydalanuvchi tanlovi:

## Section Inventory
| Section | Purpose | Key Files | Dependencies | Risk |
|---|---|---|---|---|
| <name> | <purpose> | `<path>` | <in/out> | <critical|high|medium|low> |

## Audit Order
1. <section-1>
2. <section-2>
3. <section-3>

## Initial Risk Summary
- Critical:
- High:
- Medium:
- Low:
```

## 2. Audit-Level `implementation-plan.md`

```markdown
# Implementation Plan: <audit-id>

## Objectives
1. <objective>
2. <objective>

## Phases
| Phase | Goal | Inputs | Output |
|---|---|---|---|
| 0 | Baseline and understanding | system model + clarifications | shared context |
| 1 | Stabilize critical risks | <section finding IDs> | <patch set> |
| 2 | Cross-section refactor | <section plans> | <architecture delta> |
| 3 | Validate and close | tests + review | verified result |

## Rollback Strategy
- Trigger:
- Rollback command/process:
- Data safety notes:
```

## 3. Audit-Level `tasks.md`

```markdown
# Tasks: <audit-id>

- [ ] T-001 Consolidate critical findings from all sections
- [ ] T-002 Execute cross-section fixes
- [ ] T-003 Ensure section plans and tasks are synchronized
- [ ] T-004 Run verification checks
- [ ] T-005 Prepare commit and push
- [ ] T-006 Run phase gate checks and log output

## Notes
- Owner:
- Blockers:
- Last update:
- User confirmation for push:
- Continuity holati:
```

## 4. Audit-Level `roadmap.md`

```markdown
# Roadmap: <audit-id>

## Milestones
1. Audit map and section packs complete
2. Critical section fixes complete
3. Cross-section refactor complete
4. Verification complete

## Dependency Graph
- M1 -> M2
- M2 -> M3
- M3 -> M4

## Deferred Work
- <item> (reason and risk)
```

## 5. Section Package `sections/<nn>-<section-slug>/section-audit.md`

```markdown
# Section Audit: <section-name>

## Intent
<What this section must do>

## Section Phases
1. Intent and contract confirmation
2. Dependency and failure-point trace
3. Evidence-backed findings
4. Fix options and recommendation
5. Phase gate result (`typecheck/build/lint`)

## Files Reviewed
- `<path>:<line>`

## Findings
| ID | Severity | Evidence | Impact | Root Cause | Recommendation |
|---|---|---|---|---|---|
| <F-01> | <critical|high|medium|low> | `<path>:<line>` | <impact> | <cause> | <fix> |

## Test and Reliability Notes
- Existing tests:
- Missing tests:
- Regression risk:

## Refactor Inputs
- Must-fix now:
- Can defer:
- Dependencies:
- Gate output summary:
```

## 6. Section Package `sections/<nn>-<section-slug>/implementation-plan.md`

```markdown
# Section Implementation Plan: <section-name>

## Objectives
1. <objective>
2. <objective>

## Phases
| Phase | Goal | Inputs | Output |
|---|---|---|---|
| 1 | Stabilize critical risks | <finding IDs> | <patch set> |
| 2 | Refactor section structure | <finding IDs> | <clean architecture delta> |
| 3 | Validate and close | tests + review | verified result |

## Rollback Strategy
- Trigger:
- Rollback command/process:
- Data safety notes:
```

## 7. Section Package `sections/<nn>-<section-slug>/tasks.md`

```markdown
# Section Tasks: <section-name>

- [ ] ST-001 Fix <finding-id> in `<path>`
- [ ] ST-002 Add or update tests for <behavior>
- [ ] ST-003 Refactor section interface contract
- [ ] ST-004 Run section verification checks
- [ ] ST-005 Sync outputs to audit-level tasks

## Notes
- Owner:
- Blockers:
- Last update:
- Continuity holati:
```

## 8. Section Package `sections/<nn>-<section-slug>/roadmap.md`

```markdown
# Section Roadmap: <section-name>

## Milestones
1. Section audit complete
2. Critical fixes complete
3. Verification complete

## Dependency Graph
- M1 -> M2
- M2 -> M3

## Deferred Work
- <item> (reason and risk)
```
