# Role Pipeline

## The 4-Role Model

Every AI-assisted project uses exactly these roles. Any model can play any role. One constraint is non-negotiable: **the Executor cannot audit its own completed work.**

```
┌─────────────────────────────────────────────────────────────────┐
│  ROLE          │  SCOPE                  │  CLOSED AUTHORITY    │
├─────────────────────────────────────────────────────────────────┤
│  Architect     │  Strategy, roadmap       │  None               │
│  Foundation    │  Enforcement, standards, │  None               │
│  Engineer      │  skeleton, Phase N plan  │                     │
│  Executor      │  Task implementation     │  None               │
│  Auditor       │  Independent validation  │  YES — exclusive    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Role Definitions

### Role 1: Architect

**Skill:** `agent/agent-architect` (modes: `discover`, `plan`, `architect`)

**Does:**
- Interviews stakeholders, reads existing codebase
- Produces `docs/SPEC.md` (Tier 1 discovery)
- Produces `_planning/roadmap.md` (Tier 2 strategic skeleton — phases + exit criteria only)
- Designs verification architecture

**Does NOT:**
- Write enforcement scripts
- Build project skeleton or base code
- Plan individual phases in detail (Tier 3)
- Execute tasks

**Handoff trigger:** SPEC.md + roadmap.md reviewed and approved → Foundation Engineer begins.

---

### Role 2: Foundation Engineer

**Skill:** `agent/foundation-engineer`

**Does:**
- Reads SPEC.md + roadmap.md
- Creates full enforcement layer (7 scripts + hooks + settings.json)
- Creates `standards.json` (machine-readable project standards)
- Creates CLAUDE.md + AGENTS.md
- Builds project skeleton (folder structure, configs, base types, base utilities, route/component skeletons)
- Writes Phase N Tier 3 plan (just-in-time, one phase at a time) before that phase executes
- Runs bootstrap verification before handoff

**Does NOT:**
- Implement business features
- Execute executor-level tasks
- Plan all phases upfront (Phase N+1 is planned only after Phase N is VERIFIED)

**Handoff trigger:** Bootstrap verification checklist passes → Executor begins Phase 1.

**Recurring role:** Foundation Engineer returns before each new phase to write Tier 3 plan for that phase.

> **Important:** Foundation Engineer writes Tier 3 for ONE phase at a time — just before that phase executes.
> The Architect already wrote the full roadmap (Tier 2) for ALL phases upfront. These are different activities.
> Foundation Engineer does NOT need to wait for Phase N CLOSED before writing Phase N+1 Tier 3 — only Phase N VERIFIED is required.

---

### Role 3: Executor

**Skill:** `agent/autonomous-delivery`

**Does:**
- Reads `_memory/progress.md` + assigned task card
- Implements tasks strictly within standards.json constraints
- Runs Level 1 self-check (5 adversarial questions) after each task
- Marks tasks `IMPLEMENTED` (never VERIFIED or CLOSED)
- Updates `_memory/todo.md` at milestones
- Signals Auditor when a subphase or phase is ready for review

**Does NOT:**
- Write VERIFIED or CLOSED (blocked by `check-status-advance.mjs`)
- Modify standards.json or enforcement scripts
- Audit its own work
- Plan phases or roadmap

**Handoff trigger:** All tasks in a subphase marked `IMPLEMENTED` → Auditor begins Level 2 gate.

---

### Role 4: Auditor

**Skill:** `agent/auditor`

**Does:**
- Loads task cards, READMEs, standards.json, and actual code (fresh context — no executor session)
- Runs `check-truth-gates.mjs` first (deterministic)
- Runs adversarial AI audit (probabilistic)
- Writes structured audit report to `_memory/audit-log.json`
- Writes VERIFIED (subphase) or CLOSED (phase) with evidence
- Creates concrete remediation tasks on FAIL

**Does NOT:**
- Execute or fix code
- Load executor's session history or HANDOFF notes before forming an opinion
- Skip truth-gate scripts
- Audit work it executed in the same session

**Handoff trigger (pass):** VERIFIED → Executor continues next subphase. CLOSED → Foundation Engineer prepares next phase plan.

**Handoff trigger (fail):** Remediation tasks → Executor fixes → Auditor re-audits from scratch.

---

## Full Pipeline Sequence

```
[Session 1 — Architect]
  Mode: discover → plan
  Input:  Project idea + user interview + existing codebase (if any)
  Output: docs/SPEC.md + _planning/roadmap.md
  Rule:   SPEC.md must be reviewed before Foundation Engineer begins

[Session 2 — Foundation Engineer]
  Input:  docs/SPEC.md + _planning/roadmap.md
  Output: enforcement layer + standards.json + CLAUDE.md + AGENTS.md
          + project skeleton (lint/typecheck green)
          + _planning/phase-1/ (README + subphase READMEs + task cards)
          + HANDOFF.md (ready for Phase 1 execution)
  Rule:   Bootstrap verification checklist must pass before handoff

[Sessions 3..N — Execution Loop per Phase]

  [Executor — Phase N]
    Input:  HANDOFF.md + _memory/progress.md + task cards
    Start:  pnpm exec:phase N [claude|codex]  ← entry gate runs first
    Loop:   For each task → implement → Level 1 self-check → mark IMPLEMENTED
    End:    Signal Auditor when subphase complete

  [Auditor — Subphase Level 2 Gate]
    Input:  Task cards + subphase README + actual code (fresh context)
    Start:  pnpm audit:phase N (or targeted subphase audit)
    Run:    check-truth-gates.mjs → adversarial audit → score
    Output: VERIFIED → Executor continues | FAIL → remediation tasks → Executor re-does

  ... repeat Executor + Auditor for each subphase ...

  [Auditor — Phase Level 3 Closure]
    Scope:  Full phase — all subphases re-checked
    Output: CLOSED → Foundation Engineer prepares Phase N+1 plan
            FAIL → remediation → re-audit

  [Foundation Engineer — Phase N+1 Planning]
    Input:  roadmap.md (Phase N+1 row only) + Phase N closure state
    Output: _planning/phase-(N+1)/ (README + subphase READMEs + task cards)
            PHASE_ENTRY_CHECKS[N+2] filled in check-phase-entry.mjs
    Rule:   Write only Phase N+1 — never plan ahead further

  ... repeat until all phases CLOSED ...
```

---

## Model Assignment

These roles are **model-agnostic.** Assign based on availability and session context, not model identity.

```
Valid assignments:
  Architect     → Claude Code, Codex, Cursor, any capable model
  Foundation    → Claude Code, Codex, Cursor, any capable model
  Executor      → Claude Code, Codex, Cursor, any capable model
  Auditor       → Any model — NEVER the same session that executed the work

Recommended for enforcement reliability:
  Auditor → Claude Code preferred (PreToolUse hook enforces CLOSED blocking)
  Executor → Codex/Cursor acceptable (closure is blocked by entry gate scripts)
```

---

## Enforcement Coverage by Role

| Action | Script/Hook | Architect | Foundation | Executor | Auditor |
|--------|-------------|-----------|------------|----------|---------|
| Start Phase N | `execute-phase.sh → check-phase-entry.mjs` | — | — | Blocked if gate fails | — |
| Write CLOSED | `PreToolUse → check-status-advance.mjs` | — | — | Blocked | Allowed (after truth-gates) |
| Planning lockdown | `plan-phase.sh` | — | Enforced | — | — |
| Truth-gate scan | `check-truth-gates.mjs` | — | On skeleton | On task completion | Mandatory first step |
| Session state | `check-session-state.mjs` | — | On handoff | On session end | On session end |

---

## Handoff Protocol

Every role-to-role transition requires a handoff document. No implicit handoffs.

| From → To | Handoff file | Required content |
|-----------|-------------|-----------------|
| Architect → Foundation | `docs/SPEC.md` + `_planning/roadmap.md` | Stack, constraints, phases, exit criteria |
| Foundation → Executor | `HANDOFF.md` | "Foundation complete" + what was built + Phase 1 task queue |
| Executor → Auditor | `_memory/todo.md` update + signal | Subphase/phase scope + all tasks IMPLEMENTED |
| Auditor → Executor (fail) | `_memory/todo.md` | Concrete remediation tasks with file:line |
| Auditor → Foundation (pass, phase) | `HANDOFF.md` update | Phase N CLOSED + ready for Phase N+1 plan |

---

## Anti-Patterns

| Anti-pattern | Why it fails |
|-------------|-------------|
| Executor self-audits | Confirmation bias — always finds what it expects |
| Auditor fixes violations | Unreviewed changes enter codebase; role confusion |
| Foundation Engineer skips enforcement scripts | Executor has no constraints; chaos |
| Architect writes Tier 3 plans for all phases | Phase 6 plan is based on Phase 1 assumptions; orphaned checkboxes |
| Auditor reads executor's session notes first | Imports executor's perspective; kills independence |
| Multiple roles in one session without context reset | Roles blur; enforcement gaps appear |
| "Audit" that only checks lint/typecheck | Business logic unverified; false VERIFIED |
