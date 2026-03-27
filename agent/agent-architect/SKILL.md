---
name: agent-architect
description: Professional project architecture, context engineering, verification design, and AI agent orchestration for coding agents (Claude Code, Codex, Cursor, Gemini CLI). Use when designing CLAUDE.md/AGENTS.md files, writing skills, building roadmaps with verification gates, bootstrapping projects for AI-assisted development, planning multi-agent pipelines, optimizing token usage, managing session handoffs, designing closure protocols, or auditing existing agent setups. Do NOT use for direct code implementation, code review, or debugging.
---

# Agent Architect

> Design bulletproof project architectures, verification systems, and agent orchestration for AI-assisted development.

## Iron Laws

Non-negotiable. Every mode, every project.

| # | Law | Violation Cost |
|---|-----|---------------|
| 1 | **Discovery before design.** NEVER architect without understanding the project. If info is missing — ask, do not guess. | Wrong architecture, rework |
| 2 | **Tools enforce, prompts guide.** Script-checkable rules MUST NOT live only in prompts. | Silent violations |
| 3 | **Three verification levels.** Task self-check → Subphase gate → Phase audit. Never skip. | False closure, fake states |
| 4 | **Three status states.** IMPLEMENTED → VERIFIED → CLOSED. "DONE" is forbidden. | Premature closure |
| 5 | **Adversarial before closure.** Every claim is suspect until disproven by verification. | Optimistic momentum |
| 6 | **Roadmap tracks truth, not intent.** Status advances AFTER verification, not after implementation. | Roadmap-code drift |
| 7 | **Context is finite and degrades.** CLAUDE.md < 100 lines (~2K tokens). Progressive disclosure. Subagents for research. Simplest approach first. | Hallucination, context rot |
| 8 | **Architecture follows discovery.** Never prescribe patterns without understanding constraints. | Wrong fit |
| 9 | **Separate planning from execution.** Planning → documents. Execution → code. | Scope creep |
| 10 | **Memory files are compact state.** progress.md ≤ 40, todo.md ≤ 20, HANDOFF.md ≤ 50 lines. | Buried truth |
| 11 | **Entry before execution — enforced by script.** NEVER start Phase N without `check-phase-entry.mjs --phase=N` returning exit 0. No exceptions. | Building on false foundation |
| 12 | **Every NEVER needs a script.** Every "NEVER" rule that grep/scan can verify MUST have a Layer 0 script. No script = fiction — label it `documented only`. | Silent violations at scale |
| 13 | **Phase detail is just-in-time.** Strategic skeleton covers all phases upfront. Full phase documentation is written one phase at a time, before that phase executes. NEVER plan all phases in full detail simultaneously. | Orphaned checkboxes, false confidence |
| 14 | **Multi-agent means shell scripts.** Codex/Cursor have no PreToolUse hook. `plan-phase.sh`, `execute-phase.sh`, `audit-phase.sh` are mandatory for any multi-agent project. See `enforcement-architecture.md §9`. | Silent CLOSED writes, broken non-Claude enforcement |

## Core Modes

| # | Mode | Purpose | Reference |
|---|------|---------|-----------|
| 1 | `discover` | Deep project analysis — **MANDATORY** before `bootstrap`/`architect` on new projects | inline |
| 2 | `bootstrap` | Generate enforcement layer: CLAUDE.md, hooks, scripts, _memory/, settings | enforcement-architecture.md §7 |
| 3 | `architect` | Design full architecture: CLAUDE.md, AGENTS.md, roadmap, verification gates, truth-gates | enforcement-architecture.md + verification-protocol.md |
| 4 | `plan` | Execute 3-tier planning pipeline: discovery → strategic skeleton → per-phase documentation (one phase at a time, all before execution) | pipeline-patterns.md §14 |
| 5 | `session` | Optimize session continuity, tokens, compaction, handoff | session-protocol.md |
| 6 | `pipeline` | Design multi-agent planning/execution pipelines and task cards | pipeline-patterns.md |
| 7 | `craft` | Write or refine a specific prompt, skill, or agent definition | audit-patterns.md §1-6 |
| 8 | `audit` | Audit existing architecture, find enforcement/verification/closure gaps | audit-patterns.md §7-9 |

## Execution Workflow

### 1. Discovery (MANDATORY for new projects)

Gather before designing:

| Category | What to Learn | Method |
|----------|--------------|--------|
| Stack | Languages, frameworks, monorepo | Read config files |
| Architecture | Patterns, module boundaries | Read code structure |
| Constraints | Hard rules, security needs | Ask user |
| Risk Profile | Fake-sensitive? Security-critical? | Ask user |
| Team | Solo/team? Experience level? | Ask user |
| Current State | What exists, planned, broken | Read codebase + git |
| Existing Config | CLAUDE.md, hooks, _memory/ | Check .claude/, root |
| Design Assets | Mockups, specs, references | Ask user |

**If critical info is missing:** State what is missing and ask. NEVER guess.

### 2. Assess Current State

1. Check existing files: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `_memory/`, `_planning/`.
2. Estimate startup token budget.
3. Classify enforcement: `documented only` → `partially enforced` → `fully enforced`.
4. Check if 3-level verification and truth-gates exist.

### 3. Mode Protocols

**Bootstrap:** Discover → ask: multi-agent (Codex/Cursor)? → enforcement layer (`enforcement-architecture.md §7`) → if multi-agent: shell scripts (`§9`) → truth-gates for each constraint → report enforcement classification.

**Plan (3-Tier Pipeline):** See `pipeline-patterns.md §14`. Tier 1: Discovery → `docs/SPEC.md` | Tier 2: Strategic skeleton (phases + exit criteria, no tasks) | Tier 3: Per-phase detail, one at a time. Entry gate required before each phase.

**Architect:**
1. Ensure discovery is done.
2. Design CLAUDE.md (< 100 lines): stack, commands, hard rules (max 15), session protocol, verification summary.
3. Design AGENTS.md (< 150 lines): roles, pipeline, iron laws, completion gates, decision log. Include multi-agent enforcement table (Claude Code vs Codex vs other).
4. Design roadmap strategic skeleton: phases + dependencies + exit criteria only. Full phase detail written per-phase via `plan` mode.
5. Design truth-gates for the project's risk profile. See `verification-protocol.md` §4.
6. Wire `check-phase-entry.mjs` and `check-status-advance.mjs` to hooks (`enforcement-architecture.md §10-11`).

**Verification requirements for ALL architectures:**
- Task cards include self-check section → `verification-protocol.md` §1
- Subphase READMEs include exit criteria with truth-gates → `verification-protocol.md` §2
- Each phase includes final verification subphase → `verification-protocol.md` §3

**Session / Pipeline / Craft / Audit:** Route to reference file per Core Modes table.

### 4. Validate and Deliver

Before delivering, verify:
- Discovery complete, token budget estimated, progressive disclosure applied
- No script-enforceable rules trapped in prompt files only
- 3-level verification present, truth-gates designed for risk profile
- Status uses IMPLEMENTED/VERIFIED/CLOSED, closure protocol blocks false completion

For each recommendation: state WHAT, WHY (with evidence), and HOW TO VERIFY.

## Rules

**NEVER:** design without discovery | CLAUDE.md > 100 lines without approval | script-checkable rules in prompts only | skip token budget | vague instructions | claim unenforced automation | advance status before verification | use "DONE" as single status | skip adversarial audit | prescribe patterns without constraints | let memory become history logs | duplicate rules across CLAUDE.md and AGENTS.md | write full detail for all phases simultaneously | start Phase N without entry script PASS | claim enforced without Layer 0 script | skip phase entry gate

**ALWAYS:** discovery before design | 3-level verification in every roadmap | project-specific truth-gates | IMPLEMENTED → VERIFIED → CLOSED | "Use when…" in skill descriptions | WHY for each recommendation | distinguish documented/partially/fully enforced | phase READMEs with DO/DON'T/EXIT CHECK | verification subphase last in every phase | estimate token impact | simplest approach | 3-tier planning for new projects | entry gate before each phase | script for every checkable NEVER rule | per-phase detail one at a time | shell scripts for multi-agent projects | multi-agent enforcement table in AGENTS.md

## Mode Routing

1. `discover` — new project or missing critical context
2. `plan` — starting a new project from scratch (after discover)
3. `bootstrap` — "set up project" or missing CLAUDE.md/_memory/
4. `architect` — full project design (CLAUDE.md, AGENTS.md, roadmap, verification)
5. `session` — token/compaction/handoff issues
6. `pipeline` — multi-agent workflows, task cards
7. `craft` — single prompt/skill/definition
8. `audit` — review or improve existing setup
9. Multiple modes → order: discover → plan → audit → architect → bootstrap → craft

## Output Contract

```
Mode → Discovery State → Assessment → Recommendations (WHY + evidence) → Token Impact → Deliverables
```

## Language Policy

1. User speaks Uzbek → respond in Uzbek. Deliverable files stay English (consumed by AI agents).
2. If unclear, ask once.

## Enforcement Principle

```
Layer 0: Hooks / scripts / settings  → deterministic enforcement
Layer 1: CLAUDE.md / AGENTS.md       → project-wide behavior
Layer 2: Phase / subphase READMEs   → scoped guidance
Layer 3: Skills                     → design knowledge (this skill)
Layer 4: Docs                       → reference material
```

## References

1. [Enforcement Architecture](references/enforcement-architecture.md)
2. [Verification Protocol](references/verification-protocol.md)
3. [Session Protocol](references/session-protocol.md)
4. [Pipeline Patterns](references/pipeline-patterns.md)
5. [Audit Patterns](references/audit-patterns.md)
