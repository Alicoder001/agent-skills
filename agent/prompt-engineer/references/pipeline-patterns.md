# Pipeline Patterns

## 1. The Cardinal Rule: Separate Planning from Execution

| | Planning Phase | Execution Phase |
|---|---|---|
| **Goal** | Determine what to do | Do it |
| **Output** | `.md` files only | Code, tests, configs |
| **Agent count** | One-shot agents | Fresh instance per task |
| **Context** | Full project visibility | Only one task card |
| **Time share** | 15-20% of project | 80-85% |

Mixing these two phases is the single most common failure pattern in AI-assisted development.

## 2. Spec-Based Development (Recommended for Large Features)

The most effective pattern for features that span multiple files or sessions.

### Phase 1: Interview (Session A)

```
I want to build [brief description]. Interview me in detail using
AskUserQuestion.

Ask about technical implementation, UI/UX, edge cases, concerns,
and tradeoffs. Don't ask obvious questions — dig into the hard
parts I might not have considered.

Keep interviewing until we've covered everything,
then write a complete spec to SPEC.md.
```

### Phase 2: Implement (Session B — fresh context)

```
Read SPEC.md and implement the feature.
Run tests after each major component.
```

**Why fresh session:** The spec captures all decisions. Clean context = full capacity for implementation.

## 3. Writer/Reviewer Pattern

Use two sessions for quality-critical work:

| Session A (Writer) | Session B (Reviewer) |
|---|---|
| Implements the feature | Reviews with fresh context (no bias) |
| Receives feedback | Checks edge cases, race conditions, patterns |

**Variation — Test-First:**
- Session A: Write tests from spec
- Session B: Write code to pass tests

## 4. Multi-Agent Planning Pipeline

For complex projects requiring structured delivery:

```
PLANNING PHASE (one-time)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Philosophy Agent]
  Input:  Project idea
  Output: philosophy.md (~500 words)

[Phase Architect Agent]
  Input:  philosophy.md
  Output: phases.md (~300 words)

[Subphase Planner x N phases]
  Input:  phases.md (sees only one phase)
  Output: subphases_phaseN.md (~600 words x N)

[Task Planner x M subphases]
  Input:  subphases_phaseN.md
  Output: tasks_subphaseN.md (task cards x M)

EXECUTION PHASE (per task)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Bootstrap Agent — once]
  Input:  All _planning/*.md files
  Output: _memory/progress.md, environment ready

[Task Executor x 1 — loop]
  Input:  _memory/progress.md + one task card
  Output: Completed task + progress update

[Review Agent — end of each phase]
  Input:  All phase task outputs
  Output: Gate open (pass) or gate closed (fail)

[Docs Agent — end of each phase]
  Input:  Phase outputs
  Output: _docs/phaseN_docs.md
```

### Planning Depth Limit

```
Maximum 2 levels deep:
  Phase -> Subphase -> Task

Do NOT plan inside tasks — that's determined during execution.
Planning itself should be 15-20% of total project time.
```

## 5. Task Card Format

Each task executor receives ONLY this. Nothing else.

```
═══════════════════════════════════════════
TASK CARD — [ID]
═══════════════════════════════════════════

CONTEXT (2 lines max):
[Project type and stack]
[Current phase and subphase]

DONE SO FAR:
See: _memory/progress.md
Key decision: [critical context from prior tasks]

MY JOB:
[Concrete deliverable]
- [Specific requirement 1]
- [Specific requirement 2]
- [Specific requirement 3]

CONTEXT BUDGET:
This card: ~30%
Execution: ~70% remaining

OUTPUT:
[file1] — [description]
[file2] — [description]

EXIT CHECK:
[ ] [Verifiable condition 1]
[ ] [Verifiable condition 2]
[ ] [Tests pass]
[ ] progress.md updated
[ ] todo.md updated

NEXT TASK:
[ID] — [name]
Input dependency: [what must be done first]

═══════════════════════════════════════════
```

**CONTEXT BUDGET in the card** — the agent knows how much room it has for execution.

## 6. Parallel Development with Worktrees

### Built-in Claude Code Support

```bash
claude -w feature-auth      # Auto-creates isolated worktree
claude -w fix-bug-123       # Another parallel worktree
```

### Manual Git Worktrees

```bash
git worktree add ../feature-auth feature-auth
git worktree add ../feature-payment feature-payment

# Terminal 1:
cd ../feature-auth && claude
"Build JWT auth per task card 1.2.3"

# Terminal 2:
cd ../feature-payment && claude
"Build Stripe integration per task card 2.1.1"
```

**Limit:** 3-4 active worktrees max. More creates management overhead.

### Subagent Worktree Isolation

Custom agents can use worktree isolation:

```markdown
# .claude/agents/feature-builder.md
---
name: feature-builder
description: Builds features in isolated worktrees
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---
```

Invoke with `isolation: worktree` for full isolation.

## 7. Fan-Out Pattern (Mass Operations)

For large-scale migrations or batch processing:

```bash
# Step 1: Generate task list
claude -p "List all Python files needing migration" > files.txt

# Step 2: Process in parallel
for file in $(cat files.txt); do
  claude -p "Migrate $file from React to Vue. Return OK or FAIL." \
    --allowedTools "Edit,Bash(git commit *)" &
done
wait

# Step 3: Verify
claude -p "Check all migrated files for consistency"
```

`--allowedTools` restricts what Claude can do during unattended execution.

## 8. Context Saqlanish Tizimi — 3 Living Files

### progress.md (Project Long-Term Memory)

```markdown
# Project Progress

## Current State
- Phase: Phase 1 — Backend
- Subphase: 1.2 — Authentication
- Task: 1.2.3 — JWT middleware
- Status: IN PROGRESS

## Completed
- [x] Phase 0 — Bootstrap (100%)
- [x] Phase 1.1 — Database setup (100%)
- [~] Phase 1.2 — Authentication (60%)

## Key Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-18 | argon2 over bcrypt | Security best practice |

## Next Step
Task 1.2.4 — Role-based access control
```

### todo.md (Session Short-Term Memory — "Manus Mechanism")

Updated every step by the agent. Keeps current task in the model's active attention span, reducing hallucination.

```markdown
# Current: 1.2.3 — JWT middleware

## Todo
- [ ] Token validation function
- [ ] Error handling (401, 403)
- [ ] Tests

## Done
- [x] express-jwt installed
- [x] middleware/auth.js created

## Now
Writing token validation in middleware/auth.js
```

**Max 20 lines.** Anything longer dilutes attention.

## 9. Review Gate Protocol

After each phase, a Review Agent checks:

1. All exit criteria from task cards are met
2. Tests pass for the phase scope
3. No unresolved critical issues
4. Documentation exists for the phase

**Gate result:**
- PASS -> Next phase unlocked
- FAIL -> Specific remediation tasks created, phase re-entered
