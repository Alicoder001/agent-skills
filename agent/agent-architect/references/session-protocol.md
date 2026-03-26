# Session Protocol

## 1. Model Selection & Effort Strategy

| Model | Use For | Cost |
|-------|---------|------|
| **Haiku** | File exploration, simple lookups, subagent research | Lowest |
| **Sonnet** | ~80% of coding: implementation, review, testing | Medium |
| **Opus** | Complex architecture, multi-step reasoning, planning, adversarial audits | Highest |

**Default to Sonnet.** Use Opus for architecture design, planning, and verification audits. Use Haiku for subagent research tasks.

### Effort / Thinking Tuning

Claude 4.x models support an `effort` parameter that controls thinking depth and token cost:

| Effort | Use When | Token Cost |
|--------|----------|------------|
| `low` | Routine tasks, high-volume operations, latency-sensitive work | Lowest |
| `medium` | Most coding tasks — good balance of quality and cost | Medium |
| `high` | Complex reasoning, architecture decisions, verification audits | Higher |
| `max` | Opus 4.6 only — hardest long-horizon problems | Highest |

**Practical rules:**
- Set `MAX_THINKING_TOKENS=8000` for routine sessions to cap runaway thinking costs.
- Claude Opus 4.6 uses **adaptive thinking** — it decides per-message how much to think. Large system prompts can trigger unnecessary thinking. Keep CLAUDE.md lean to reduce over-thinking.
- For coding subagents doing simple file edits, specify `model: haiku` and `effort: low` in the subagent config.
- "Overthinking" symptoms: slow responses, thinking tokens dominate cost. Fix: lower effort level or add instruction "Choose an approach and commit to it."

## 2. Compaction Strategy

### When to Compact

| Trigger | Action |
|---------|--------|
| After exploration phase (before implementation) | `/compact Focus on findings and plan` |
| After completing a milestone | `/compact Preserve completed changes and next steps` |
| After debugging session | `/compact Keep root cause and fix, drop debug traces` |
| Before major context shift | `/compact` |
| At 50% context capacity | Create/update `HANDOFF.md`, then `/compact` |

### When NOT to Compact

- During related multi-file changes
- During active debugging
- During refactoring workflows where full local context still matters
- During verification gate execution (need full context for adversarial audit)

### Directed Compaction

Always provide focus instructions:

```text
/compact Focus on the API changes and modified files list
/compact Preserve test commands and current task state
/compact Keep architecture decisions, drop exploration traces
/compact Preserve verification results and next subphase scope
```

## 3. Session Lifecycle

### Prompt-Level Protocol

```text
SESSION START
  1. If HANDOFF.md exists, read it first
  2. Read _memory/progress.md
  3. Read _memory/todo.md
  4. Identify current phase/subphase/task
  5. Read the relevant phase README for context

DURING SESSION
  - Update todo.md at meaningful milestones
  - Run task self-check after each completed task
  - Consider /compact at logical breakpoints
  - At 50% context: refresh HANDOFF.md + /compact

SESSION END
  1. Update _memory/progress.md (current state only, ≤ 40 lines)
  2. Update _memory/todo.md (active queue only, ≤ 20 lines)
  3. Refresh HANDOFF.md if work remains
  4. Verify: do status files reflect verified truth or optimistic intent?
```

### Enforcement Reality

Prompt text alone is **not** automatic enforcement.

To call session continuity "automatic", verify at least one of:

- `SessionStart` hook injects or checks memory context
- `PreCompact` hook preserves progress state
- `SessionEnd` or `Stop` hook runs a session-state check
- Project script validates `progress.md`, `todo.md`, and `HANDOFF.md`
- Team workflow explicitly runs a verification command before finish

If none of these exist, classify the setup as **documented only**.

## 4. HANDOFF.md — Session Bridge

When context exceeds 50% or a session must end:

```markdown
# HANDOFF.md

## Goal
[What is being built — 1 sentence]

## Current State
[What works, what doesn't — bullets, current verified status]

## Blocker (if any)
[What stopped progress]

## Exact Next Step
[One concrete action with file/module context]

## Key Files
- path/to/critical/file1.ts
- path/to/critical/file2.ts
```

### Handling Rules

- Do NOT delete `HANDOFF.md` immediately after reading by default.
- Overwrite it with newest state when context reaches 50%.
- Archive/resolve only after `progress.md` and `todo.md` are updated.
- Deleting on read is only OK when the workflow explicitly uses disposable handoffs and that is enforced.

### HANDOFF.md Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| HANDOFF.md > 50 lines | Prune — keep only current state, not history |
| HANDOFF.md contains full implementation log | Move to progress.md, keep only current + next step |
| HANDOFF.md overstates completion | Match to verified status, not intended status |
| HANDOFF.md not updated at compaction | Always refresh before `/compact` |

## 5. Memory File Discipline

### progress.md (≤ 40 lines)

Purpose: **Current verified state of the project.** Not a history log.

```markdown
# Project Progress

## Current State
- Phase: Phase 2 — Core Business
- Subphase: 2.3 — Device management
- Status: IMPLEMENTED (awaiting verification gate)

## Completed
- [x] Phase 1 — Foundation (CLOSED)
- [x] 2.1 — Organization module (VERIFIED)
- [x] 2.2 — Employee CRUD (VERIFIED)

## Key Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-25 | argon2 over bcrypt | Security |

## Next Step
Run 2.3 subphase verification gate, then start 2.4 Phase Closure Audit.
```

**Anti-pattern:** progress.md > 40 lines with detailed narrative of everything ever done. Prune historical items to one line per completed phase/subphase.

### todo.md (≤ 20 lines)

Purpose: **Current session's active work queue.** Keeps the agent's attention focused.

```markdown
# Current: 2.3 — Device management

## Todo
- [ ] Run subphase verification gate
- [ ] Check truth-gates for forbidden patterns
- [ ] Verify responsive behavior

## Done
- [x] CRUD endpoints implemented
- [x] Encrypted credentials working
- [x] Self-check passed

## Now
Running verification gate for 2.3
```

**Anti-pattern:** todo.md > 20 lines with completed items from previous sessions. Prune aggressively — only current session matters.

## 6. Minimum Enforcement for Session Continuity

To reduce drift between prompts and reality, a project needs at minimum:

1. `CLAUDE.md` documents the session lifecycle protocol
2. `.claude/settings.json` includes `PreCompact` and at least one end-of-session hook
3. `package.json` exposes a verification command: `check:session-state`
4. `_memory/progress.md`, `_memory/todo.md`, and `HANDOFF.md` exist in stable format
5. Memory files have enforced size limits (40 / 20 / 50 lines)

Without items 2-3, the setup is `documented only` — not automated.

## 7. Session Navigation Commands

| Command | Purpose | When |
|---------|---------|------|
| `/clear` | Reset context entirely | Between unrelated tasks |
| `/compact` | Summarize and compress history | At logical breakpoints |
| `/compact <focus>` | Directed compaction | When specific context must survive |
| `/rewind` | Restore to a checkpoint | When approach failed |
| `/cost` | View session spending | Periodically |

## 8. Cross-Session Continuity Checklist

Before ending a session, verify:

- [ ] `progress.md` exists, ≤ 40 lines, reflects verified state
- [ ] `todo.md` exists, ≤ 20 lines, reflects active queue
- [ ] `HANDOFF.md` matches current state with concrete next step
- [ ] Status claims in all files are consistent with each other
- [ ] No file overstates completion (says VERIFIED when only IMPLEMENTED)
- [ ] If hooks are claimed, `/hooks` confirms they are registered
- [ ] If automation is claimed, a deterministic check exists
