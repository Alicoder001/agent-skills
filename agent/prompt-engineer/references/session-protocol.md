# Session Protocol

## 1. Model Selection Strategy

| Model | Use For | Cost |
|-------|---------|------|
| **Haiku** | File exploration, simple lookups, subagent research | Lowest |
| **Sonnet** | ~80% of coding tasks: implementation, review, testing | Medium |
| **Opus** | Complex architecture, multi-step reasoning, planning | Highest |

**Default to Sonnet.** Switch only when the task demands deeper reasoning.

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

### Directed Compaction

Always provide focus instructions:

```text
/compact Focus on the API changes and modified files list
/compact Preserve test commands and current task state
/compact Keep architecture decisions, drop exploration traces
```

## 3. Session Lifecycle

### Prompt-Level Expectation

```text
SESSION START
  1. Read _memory/progress.md
  2. Read _memory/todo.md
  3. If HANDOFF.md exists, read it first
  4. Execute task

DURING SESSION
  - Update todo.md at meaningful milestones
  - Consider /compact at logical breakpoints
  - At 50% context: refresh HANDOFF.md + /compact

SESSION END
  1. Update _memory/progress.md
  2. Update _memory/todo.md
  3. Refresh HANDOFF.md if work remains or next-step context matters
```

### Enforcement Reality

Prompt text alone is **not** automatic enforcement.

To call session continuity "automatic", verify at least one of:

- `SessionStart` hook injects or checks memory context
- `PreCompact` hook preserves progress state
- `SessionEnd` or `Stop` hook runs a session-state check
- project script validates `progress.md`, `todo.md`, and `HANDOFF.md`
- team workflow explicitly runs a verification command before finish

If none of these exist, classify the setup as **documented only**.

## 4. HANDOFF.md - Session Bridge

When context exceeds 50% or a session must end:

```markdown
# HANDOFF.md

## Goal
[What is being built - 1 sentence]

## Current State
[What works, what doesn't - bullets]

## Blocker (if any)
[What stopped progress]

## Exact Next Step
[One concrete action]

## Modified Files
- path/to/file1.ts
- path/to/file2.ts
```

### Important Handling Rule

Do **not** delete `HANDOFF.md` immediately after reading by default.

Prefer one of these:

- preserve it until the session ends
- overwrite it with the newest state
- archive/resolve it only after `progress.md` and `todo.md` are updated

Deleting handoff state on read is only appropriate when the workflow explicitly uses disposable handoff files and that behavior is enforced and verified.

## 5. Minimum Enforcement for Session Continuity

To reduce drift between prompts and reality, prefer this baseline:

1. `CLAUDE.md` documents the lifecycle
2. `.claude/settings.json` includes `PreCompact` and at least one end-of-session guard
3. `package.json` exposes a verification command such as `check:session-state`
4. the project maintains `_memory/progress.md`, `_memory/todo.md`, and `HANDOFF.md` in a stable format

## 6. Verification Checklist

- [ ] `progress.md` exists and reflects the current task
- [ ] `todo.md` exists and reflects current next actions
- [ ] `HANDOFF.md` matches the same task state
- [ ] compaction preserves enough state to resume
- [ ] if hooks are claimed, `/hooks` confirms they are registered
- [ ] if automation is claimed, a deterministic check exists

## 7. Session Navigation Commands

| Command | Purpose | When |
|---------|---------|------|
| `/clear` | Reset context entirely | Between unrelated tasks |
| `/compact` | Summarize and compress history | At logical breakpoints |
| `/compact <focus>` | Directed compaction | When specific context must survive |
| `/rewind` | Restore to a checkpoint | When approach failed |
| `/cost` | View session spending | Periodically |

## 8. Implementation Note

Recent official Claude Code guidance explicitly supports lifecycle hooks such as `SessionStart`, `PreCompact`, `Stop`, and `SessionEnd`, which means session continuity can now be enforced more concretely than prompt prose alone. Use that capability when users expect reliable automation.
