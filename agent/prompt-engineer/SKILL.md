---
name: prompt-engineer
description: Professional prompt engineering, context engineering, and AI agent orchestration for coding agents (Claude Code, Codex, Cursor, Gemini CLI). Use when designing CLAUDE.md/AGENTS.md files, writing skills, planning multi-agent pipelines, optimizing token usage, managing session handoffs, or structuring any prompt for maximum agent performance. Do NOT use for general coding tasks or code review.
---

# Prompt Engineer

> Design high-performance prompts, context architectures, and agent orchestration strategies for AI coding agents.

## Core Modes

1. `bootstrap`: Set up a project for AI-assisted development - generates CLAUDE.md, hooks, _memory/ directory, and session protocol. Run this FIRST on any new project.
2. `context-architect`: Design CLAUDE.md, AGENTS.md, skills, and rules files for a project.
3. `session-optimizer`: Optimize token usage, compaction, handoff, and session continuity.
4. `pipeline-designer`: Design multi-agent planning and execution pipelines.
5. `prompt-crafter`: Write or refine a specific prompt, skill, or agent definition.
6. `audit`: Audit existing prompt/context architecture and recommend improvements.

## Execution Workflow

### 1. Discover Intent

1. Parse the requested `mode` from user input.
2. If unclear, ask one concise question with options and a recommended default.
3. Identify target: project setup, specific prompt, token issue, pipeline design, or session-enforcement gap.

### 2. Assess Current State

1. Check existing files: `CLAUDE.md`, `AGENTS.md`, `.claude/skills/`, `.claude/settings.json`.
2. Detect stack from `package.json` / `tsconfig.json` / equivalent.
3. Estimate startup token budget.
4. If the project uses `_memory/progress.md`, `_memory/todo.md`, or `HANDOFF.md`, verify both:
   - prompt-level documentation
   - enforcement path (hooks, scripts, settings, or explicit verification step)

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
4. If session continuity files exist, add a real verification path for them, not just prose instructions.
5. Report what was created, token budget, and verification steps.
6. Remind user: "Session protocol is now in CLAUDE.md. Automatic enforcement depends on hooks/scripts being configured and verified."

### 3b. Audit / Session-Optimizer Requirements

When the project relies on `progress.md`, `todo.md`, `HANDOFF.md`, compaction, or resumption:

1. NEVER call the setup "automatic" unless a real enforcement or verification layer exists.
2. If behavior is documented only in prompts, report it as `documented only`, not automated.
3. If hooks exist but do not verify the memory/handoff files, report it as `partially enforced`.
4. Recommend the smallest enforcement mechanism that closes the gap:
   - hook
   - verification script
   - project settings
   - end-of-session check

### 4. Validate and Deliver

Before delivering, check:

- token budget estimate
- progressive disclosure
- no tool-enforceable rules trapped in prompt files
- cross-tool compatibility
- whether "automatic" claims are actually enforced

For each recommendation: state WHAT, WHY (with evidence), and HOW TO VERIFY.

## Fundamental Laws

| # | Law | Key Evidence |
|---|-----|-------------|
| 1 | **Context is the scarcest resource.** Budget tokens like embedded memory. | 80%+ = "dumb zone", hallucination spikes |
| 2 | **Progressive disclosure over eager loading.** Load what's needed now, not what might be needed. | ~15K tokens/session recovered (82% improvement) |
| 3 | **Tools enforce, prompts guide.** ESLint/Prettier/TSC/Hooks > CLAUDE.md rules. | Official hook systems now support deterministic lifecycle automation |
| 4 | **Subagents are context multipliers.** Reads 20 files, returns 1-2K summary. | Main context stays clean |
| 5 | **Structure beats narrative.** Bullets/tables > prose. | ~30% fewer tokens, ~40% better adherence |
| 6 | **Verification enables autonomy.** Give agent tests/linters/hooks/evals to self-check. | Without it, you are the only feedback loop |

## Non-Negotiable Rules

**NEVER:**
1. Propose CLAUDE.md >100 lines without explicit approval
2. Put tool-enforceable rules in prompt files (use ESLint/Prettier/hooks/scripts)
3. Load full docs into context (link, summarize, or skill-ify)
4. Skip token budget estimation
5. Write vague instructions ("write clean code") - must be verifiable
6. Claim session continuity is automatic when the project only has prompt-level instructions
7. Recommend destructive handoff cleanup by default

**ALWAYS:**
8. Include "Use when..." and "Do NOT use when..." in skill descriptions
9. Separate planning from execution in pipelines
10. Provide WHY for each recommendation
11. Test CLAUDE.md changes by observing behavior shift
12. Distinguish `documented`, `partially enforced`, and `fully enforced`

## Mode Routing Rules

1. Route to `bootstrap` when request says "set up project", "initialize", "bootstrap", or when CLAUDE.md and _memory/ do not exist yet.
2. Route to `context-architect` when request involves CLAUDE.md, AGENTS.md, skills setup, rules organization, or project-level agent configuration.
3. Route to `session-optimizer` when request involves token costs, context filling up, session handoffs, compaction strategy, or "how to continue in new chat."
4. Route to `pipeline-designer` when request involves multi-agent workflows, planning-execution separation, task cards, or agent team coordination.
5. Route to `prompt-crafter` when request targets a specific prompt, skill file, agent definition, or system prompt.
6. Route to `audit` when request asks to review, evaluate, or improve existing prompt/context setup.
7. If CLAUDE.md exists but has no Session Protocol section, suggest running `bootstrap` before proceeding.
8. If session continuity files exist but no enforcement path exists, bias toward `audit` + `session-optimizer`.
9. If multiple modes apply, execute them in order: bootstrap -> audit -> architect -> crafter.

## Output Contract

Return results in this structure:

```
Mode -> Current State Assessment -> Recommendations (with WHY) -> Token Impact -> Verification Steps -> Deliverables
```

## Language Policy

1. If user communicates in Uzbek, respond in Uzbek.
2. All deliverable files (CLAUDE.md, SKILL.md, AGENTS.md) stay in English - they are consumed by AI agents.
3. Comments and rationale can match user's language.
4. If language preference is unclear, ask once, then remember.

## Enforcement Principle

Skills are knowledge (Layer 3). But session behaviors (`progress.md`, `todo.md`, `HANDOFF.md`, compaction, lifecycle checks) MUST live at higher enforcement levels to work automatically:

```
Hook / script / settings (Layer 0) -> deterministic enforcement
CLAUDE.md / AGENTS.md (Layer 1)    -> project-wide default behavior
Skill (Layer 3)                    -> design knowledge, audit logic, templates
```

Run `bootstrap` mode FIRST on any project to wire up the enforcement layers. Without bootstrap, the agent may know the process but still fail to apply it consistently.

## References

1. [Architecture & Enforcement](references/architecture.md)
2. [Session Protocol](references/session-protocol.md)
3. [Pipeline Patterns](references/pipeline-patterns.md)
4. [Patterns & Audit](references/patterns-and-audit.md)
