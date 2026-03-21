---
name: prompt-engineer
description: Professional prompt engineering, context engineering, and AI agent orchestration for coding agents (Claude Code, Codex, Cursor, Gemini CLI). Use when designing CLAUDE.md/AGENTS.md files, writing skills, planning multi-agent pipelines, optimizing token usage, managing session handoffs, or structuring any prompt for maximum agent performance. Do NOT use for general coding tasks or code review.
---

# Prompt Engineer

> Design high-performance prompts, context architectures, and agent orchestration strategies for AI coding agents.

## Core Modes

1. `bootstrap`: Set up a project for AI-assisted development — generates CLAUDE.md, hooks, _memory/ directory, and session protocol. Run this FIRST on any new project.
2. `context-architect`: Design CLAUDE.md, AGENTS.md, skills, and rules files for a project.
3. `session-optimizer`: Optimize token usage, compaction, handoff, and session continuity.
4. `pipeline-designer`: Design multi-agent planning and execution pipelines.
5. `prompt-crafter`: Write or refine a specific prompt, skill, or agent definition.
6. `audit`: Audit existing prompt/context architecture and recommend improvements.

## Execution Workflow

### 1. Discover Intent

1. Parse the requested `mode` from user input.
2. If unclear, ask one concise question with options and a recommended default.
3. Identify target: project setup, specific prompt, token issue, or pipeline design.

### 2. Assess Current State

1. Check existing files: `CLAUDE.md`, `AGENTS.md`, `.claude/skills/`, `.claude/settings.json`.
2. Detect stack from `package.json` / `tsconfig.json` / equivalent.
3. Estimate startup token budget. Log findings before proposing changes.

### 3. Apply Mode-Specific Protocol

Route to the correct reference:

- `bootstrap` -> `references/architecture.md` (section 7: Bootstrap Templates)
- `context-architect` -> `references/architecture.md`
- `session-optimizer` -> `references/session-protocol.md`
- `pipeline-designer` -> `references/pipeline-patterns.md`
- `prompt-crafter` -> `references/patterns-and-audit.md` (sections 1-6)
- `audit` -> `references/patterns-and-audit.md` (sections 7-8)

### 3a. Bootstrap Protocol (when mode is `bootstrap`)

This mode generates the enforcement layer that makes all other modes effective.

1. Detect stack: read `package.json`, `tsconfig.json`, `pyproject.toml`, or equivalent.
2. Detect existing config: check for CLAUDE.md, .claude/, _memory/, AGENTS.md.
3. Generate files using templates from `references/architecture.md` section "Bootstrap Templates".
4. Report what was created, token budget, and verification steps.
5. Remind user: "Session protocol is now in CLAUDE.md. Agent will follow it automatically in every future session."

### 4. Validate and Deliver

Before delivering, check: token budget estimate, progressive disclosure (nothing eagerly loaded that could be lazy), no tool-enforceable rules in prompts, cross-tool compatibility.

For each recommendation: state WHAT, WHY (with evidence), and HOW TO VERIFY.

## Fundamental Laws

| # | Law | Key Evidence |
|---|-----|-------------|
| 1 | **Context is the scarcest resource.** Budget tokens like embedded memory. | 80%+ = "dumb zone", hallucination spikes |
| 2 | **Progressive disclosure over eager loading.** Load what's needed now, not what might be needed. | ~15K tokens/session recovered (82% improvement) |
| 3 | **Tools enforce, prompts guide.** ESLint/Prettier/TSC/Hooks > CLAUDE.md rules. | ETH Zurich 2026: LLM-generated rules = -3% perf, +20% cost |
| 4 | **Subagents are context multipliers.** Reads 20 files, returns 1-2K summary. | Main context stays clean |
| 5 | **Structure beats narrative.** Bullets/tables > prose. | ~30% fewer tokens, ~40% better adherence |
| 6 | **Verification enables autonomy.** Give agent tests/linters/screenshots to self-check. | Without it, YOU are the only feedback loop |

## Non-Negotiable Rules

**NEVER:**
1. Propose CLAUDE.md >100 lines without explicit approval
2. Put tool-enforceable rules in prompt files (use ESLint/Prettier/hooks)
3. Load full docs into context (link, summarize, or skill-ify)
4. Skip token budget estimation
5. Write vague instructions ("write clean code") — must be verifiable

**ALWAYS:**
6. Include "Use when..." and "Do NOT use when..." in skill descriptions
7. Separate planning from execution in pipelines
8. Provide WHY for each recommendation
9. Test CLAUDE.md changes by observing behavior shift

## Mode Routing Rules

1. Route to `bootstrap` when request says "set up project", "initialize", "bootstrap", or when CLAUDE.md and _memory/ do not exist yet.
2. Route to `context-architect` when request involves CLAUDE.md, AGENTS.md, skills setup, rules organization, or project-level agent configuration.
3. Route to `session-optimizer` when request involves token costs, context filling up, session handoffs, compaction strategy, or "how to continue in new chat."
4. Route to `pipeline-designer` when request involves multi-agent workflows, planning-execution separation, task cards, or agent team coordination.
5. Route to `prompt-crafter` when request targets a specific prompt, skill file, agent definition, or system prompt.
6. Route to `audit` when request asks to review, evaluate, or improve existing prompt/context setup.
7. If CLAUDE.md exists but has no Session Protocol section, suggest running `bootstrap` before proceeding.
8. If multiple modes apply, execute them in order: bootstrap -> audit -> architect -> crafter.

## Output Contract

Return results in this structure:

```
Mode -> Current State Assessment -> Recommendations (with WHY) -> Token Impact -> Verification Steps -> Deliverables
```

## Language Policy

1. If user communicates in Uzbek, respond in Uzbek.
2. All deliverable files (CLAUDE.md, SKILL.md, AGENTS.md) stay in English — they are consumed by AI agents.
3. Comments and rationale can match user's language.
4. If language preference is unclear, ask once, then remember.

## Enforcement Principle

Skills are knowledge (Layer 3). But session behaviors (progress.md, todo.md, HANDOFF.md, compaction) MUST live at higher enforcement levels to work automatically:

```
Hook (Layer 0)     → 100% guaranteed: lint, compaction context preservation
CLAUDE.md (Layer 1) → ~85% reliable: session protocol, compaction rules
Skill (Layer 3)    → On-demand: design knowledge, patterns, templates
```

Run `bootstrap` mode FIRST on any project to wire up the enforcement layers. Without bootstrap, the agent has the knowledge but no automatic behavior.

See `references/architecture.md` for the full enforcement architecture and verification checklist.

## References

1. [Architecture & Enforcement](references/architecture.md)
2. [Session Protocol](references/session-protocol.md)
3. [Pipeline Patterns](references/pipeline-patterns.md)
4. [Patterns & Audit](references/patterns-and-audit.md)
