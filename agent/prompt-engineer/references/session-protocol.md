# Session Protocol

## 1. Model Selection Strategy

| Model | Use For | Cost |
|-------|---------|------|
| **Haiku** | File exploration, simple lookups, subagent research | Lowest |
| **Sonnet** | ~80% of coding tasks: implementation, review, testing | Medium |
| **Opus** | Complex architecture, multi-step reasoning, planning | Highest |

**Default to Sonnet.** Switch with `/model opus` only when the task demands deep reasoning. ~60% cost reduction vs always-Opus.

**Subagent model:** Use Haiku for exploration subagents (~80% cheaper than main model).

## 2. Compaction Strategy

### When to Compact

| Trigger | Action |
|---------|--------|
| After exploration phase (before implementation) | `/compact Focus on findings and plan` |
| After completing a milestone | `/compact Preserve completed changes and next steps` |
| After debugging session | `/compact Keep root cause and fix, drop debug traces` |
| Before major context shift | `/compact` |
| At 50% context capacity | **Proactive** — create HANDOFF.md, then `/compact` |

### When NOT to Compact

- During related multi-file changes
- During active debugging (you need the full trace)
- During refactoring workflows (related context is valuable)

### Directed Compaction

Always provide focus instructions:

```
/compact Focus on the API changes and modified files list
/compact Preserve test commands and current task state
/compact Keep architecture decisions, drop exploration traces
```

### Custom Compaction Rules in CLAUDE.md

```markdown
## Compaction Rules
When compacting, always preserve:
- Full list of modified files
- Test commands and their results
- Current task state and next steps
- Architecture decisions with rationale
```

## 3. Session Lifecycle

```
SESSION START
  1. Read _memory/progress.md    (where am I?)
  2. Read _memory/todo.md        (what's next?)
  3. If HANDOFF.md exists -> read and delete after loading
  4. Execute task

DURING SESSION
  - Monitor context usage via status line
  - At logical breakpoints: consider /compact
  - At 50% context: create HANDOFF.md + /compact

SESSION END
  1. Update _memory/progress.md  (what was done)
  2. Update _memory/todo.md      (what's next)
  3. If switching topics: /clear before new task
```

## 4. HANDOFF.md — Session Bridge

When context exceeds 50% or session must end:

```markdown
# HANDOFF.md

## Goal
[What is being built — 1 sentence]

## Current State
[What works, what doesn't — bullets]

## Blocker (if any)
[What stopped progress]

## Exact Next Step
[One concrete action — not vague]

## Modified Files
- path/to/file1.ts
- path/to/file2.ts
- _memory/progress.md
```

**Usage:**
```bash
# Create before ending session:
"Create HANDOFF.md with: goal, current state, blockers, exact next step, modified files"

# Then compact or end:
/compact

# New session:
"Read HANDOFF.md and continue from where we left off"
```

## 5. Session Navigation Commands

| Command | Purpose | When |
|---------|---------|------|
| `/clear` | Reset context entirely | Between unrelated tasks |
| `/compact` | Summarize and compress history | At logical breakpoints |
| `/compact <focus>` | Directed compaction | When specific context must survive |
| `/rewind` or `Esc+Esc` | Restore to any checkpoint | When approach failed |
| `/btw <question>` | Side question (no context impact) | Quick lookup mid-task |
| `/cost` | View session spending | Periodically |
| `/rename <name>` | Name session for later resume | Long-running workstreams |
| `claude --continue` | Resume last session | Returning to work |
| `claude --resume` | Pick from recent sessions | Multiple workstreams |
| `Esc` | Stop mid-action (context preserved) | Course correction |

## 6. Token Optimization Techniques

### Structural Prompt Optimization (~30% savings)

```
# BAD (450 tokens)
"I'd like you to look at the auth.ts file and find out why
authentication doesn't work when the token expires and the
refresh mechanism fails..."

# GOOD (280 tokens)
"File: auth.ts
Bug: auth failure on token expiry
Action: fix refresh token validation"
```

### Extended Thinking Management

Extended thinking reserves up to 31,999 tokens per request. Reduce to 10,000 for most tasks:

```json
{
  "env": {
    "MAX_THINKING_TOKENS": "10000"
  }
}
```

Set to 0 for trivial tasks. ~70% cost reduction on thinking tokens.

### MCP Server Optimization

- Keep under 10 MCP servers enabled per project
- Use `defer_loading: true` for MCP tools (~85% token reduction on tool schemas)
- Prefer CLI tools (`gh`, `aws`, `gcloud`) over MCP equivalents
- Run `/mcp` to assess context cost

### Subagent Delegation

```
"Use subagents to investigate how our auth system handles token refresh.
Report back with findings only — don't change any files."
```

Subagent explores in separate context. Main context receives only the summary.

## 7. The Two-Correction Rule

If you've corrected Claude more than twice on the same issue:

1. Context is cluttered with failed approaches
2. Run `/clear`
3. Write a better initial prompt incorporating what you learned
4. A clean session with a better prompt always outperforms accumulated corrections

## 8. Auto-Compaction Override

Set earlier auto-compaction to prevent dumb zone:

```json
{
  "env": {
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```

Default is 95% — too late. Set to 50% for proactive compaction.
