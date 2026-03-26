# Pipeline Patterns

## 1. The Cardinal Rule: Separate Planning from Execution

| | Planning Phase | Execution Phase |
|---|---|---|
| **Goal** | Determine what to do | Do it |
| **Output** | `.md` files only | Code, tests, configs |
| **Agent count** | One-shot agents | Fresh instance per task |
| **Context** | Full project visibility | Only one task card + progress |
| **Time share** | 15-20% of project | 80-85% |
| **Verification** | Review plan completeness | Run 3-level verification |

Mixing these two phases is the single most common failure pattern in AI-assisted development.

## 2. Spec-Based Development (Recommended for Large Features)

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
Run self-check after each task.
```

**Why fresh session:** The spec captures all decisions. Clean context = full capacity for implementation.

## 3. Writer/Reviewer Pattern

Use two sessions for quality-critical work:

| Session A (Writer) | Session B (Reviewer) |
|---|---|
| Implements the feature | Reviews with fresh context (no confirmation bias) |
| Runs task self-checks | Runs adversarial audit on all claims |

**Variation — Test-First:**
- Session A: Write tests from spec
- Session B: Write code to pass tests

## 4. Multi-Agent Planning Pipeline

For complex projects requiring structured delivery:

```
PLANNING PHASE (one-time)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Discovery Agent]
  Input:  Project idea + user interview
  Output: discovery.md (stack, constraints, risk profile)

[Phase Architect Agent]
  Input:  discovery.md
  Output: phases.md (~300 words)
  Rule:   Every phase MUST end with a verification subphase

[Subphase Planner x N phases]
  Input:  phases.md (sees only one phase)
  Output: subphases_phaseN.md (~600 words x N)
  Rule:   Every subphase MUST have exit criteria with truth-gates

[Task Planner x M subphases]
  Input:  subphases_phaseN.md
  Output: tasks_subphaseN.md (task cards x M)
  Rule:   Every task card MUST have self-check section

EXECUTION PHASE (per task)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Bootstrap Agent — once]
  Input:  All _planning/*.md files
  Output: _memory/progress.md, enforcement layer ready

[Task Executor x 1 — loop]
  Input:  _memory/progress.md + one task card
  Output: Completed task + self-check + progress update

[Gate Agent — end of each subphase]
  Input:  All task outputs for subphase
  Output: Subphase gate: PASS or FAIL with specific findings

[Audit Agent — end of each phase (verification subphase)]
  Input:  All subphase gate results + phase scope
  Output: Phase audit: CLOSED or FAIL with remediation tasks

[Docs Agent — end of each phase]
  Input:  Phase outputs
  Output: Updated status documents (only after CLOSED)
```

### Planning Depth Limit

```
Maximum 2 levels deep:
  Phase → Subphase → Task

Do NOT plan inside tasks — that is determined during execution.
Planning itself should be 15-20% of total project time.
```

## 5. Task Card Format

Each task executor receives ONLY this. Nothing else.

```
═══════════════════════════════════════════
TASK CARD — [Phase.Subphase.Task ID]
═══════════════════════════════════════════

CONTEXT (2 lines max):
[Project type and stack]
[Current phase and subphase]

DONE SO FAR:
See: _memory/progress.md
Key decision: [critical context from prior tasks]

MY JOB:
[Concrete deliverable — one sentence]
- [Specific requirement 1]
- [Specific requirement 2]
- [Specific requirement 3]

CONSTRAINTS:
- [Project-specific constraint relevant to this task]
- [Forbidden pattern to avoid]

OUTPUT:
[file1] — [description]
[file2] — [description]

SELF-CHECK (before marking IMPLEMENTED):
[ ] Stated what I implemented in concrete terms
[ ] Identified at least 2 ways my claim could be false
[ ] Named the specific file/search/test that proves correctness
[ ] Ran truth-gate scan on affected files — no violations
[ ] Confirmed no regression in adjacent code
[ ] lint/typecheck/build passes

EXIT CRITERIA:
[ ] [Verifiable condition 1]
[ ] [Verifiable condition 2]
[ ] Self-check passed
[ ] progress.md updated
[ ] todo.md updated

NEXT TASK:
[ID] — [name]
Input dependency: [what must be done first]

═══════════════════════════════════════════
```

**CONTEXT BUDGET note:** The task card uses ~30% of context. The remaining ~70% is for execution.

## 6. Phase README Template

Every phase README should follow this structure:

```markdown
# Phase N: [Name]

## Overview
[1-2 sentences describing the phase goal]

## Subphases

| # | Subphase | Status | Dependencies |
|---|----------|--------|-------------|
| N.1 | [Name] | NOT STARTED | — |
| N.2 | [Name] | NOT STARTED | N.1 |
| N.K | [Name] | NOT STARTED | N.(K-1) |
| N.(K+1) | Phase N Verification & Closure | NOT STARTED | All above |

## Agent Rules

### DO
- [Specific actionable instruction]
- [Specific actionable instruction]

### DON'T
- [Specific prohibition with reason]
- [Specific prohibition with reason]

## Exit Criteria

### All subphases VERIFIED
- [ ] [Subphase-level criteria]

### Phase audit passed
- [ ] Adversarial self-audit found no false claims
- [ ] Truth-gate script passes for full phase scope
- [ ] Roadmap-code alignment confirmed
- [ ] Status documents reflect verified truth

### Phase status
CLOSED only when ALL exit criteria pass.
```

## 7. Subphase README Template

```markdown
# Subphase N.X: [Name]

## Scope
[What this subphase delivers — 2-3 sentences]

## Tasks

| # | Task | Status |
|---|------|--------|
| 1 | [Task description] | NOT STARTED |
| 2 | [Task description] | NOT STARTED |
| K | [Task description] | NOT STARTED |

## Agent Rules

### DO
- [Scoped instruction]

### DON'T
- [Scoped prohibition]

## Exit Criteria

### Functional
- [ ] [Specific functional check]

### Truth-Gate
- [ ] No forbidden patterns: [list]
- [ ] No architecture violations: [list]

### Quality
- [ ] lint/typecheck/build green

### Status
All checks pass → VERIFIED. Any failure → fix and re-check.
```

## 8. Skill Frontmatter Patterns

Control when and how skills load to minimize token waste:

| Frontmatter | Effect | Use When |
|-------------|--------|----------|
| *(default)* | Description always in context; full content loads on invocation | Reference knowledge Claude should auto-apply |
| `disable-model-invocation: true` | Description NOT in context; loads only when you type `/name` | Workflows with side effects (deploy, commit, send-slack) |
| `user-invocable: false` | Claude can auto-load; hidden from `/` menu | Background knowledge users should not invoke manually |
| `context: fork` | Runs in isolated subagent context | Research, exploration, or operations needing clean context |
| `model: haiku` | Runs with Haiku model | Simple lookups, file reads, low-complexity operations |

**Token implications:**
- Default skills: ~50 tokens per skill (description) at session start, full content only on use.
- `disable-model-invocation: true`: 0 tokens at session start — safest for rarely-used skills.
- `context: fork`: Runs in isolated context window. The main conversation only receives a summary (~200-500 tokens), not the full exploration.

**When to use `context: fork`:**
```yaml
---
name: deep-audit
description: Audit codebase for forbidden patterns
context: fork
agent: Explore
---
Scan the entire codebase for: ...
Return only findings summary.
```

The subagent reads thousands of files; your main context gets a 300-token summary.

## 10. Parallel Development with Worktrees

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

**Limit:** 3-4 active worktrees max.

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

## 11. Fan-Out Pattern (Mass Operations)

```bash
# Step 1: Generate task list
claude -p "List all files needing migration" > files.txt

# Step 2: Process in parallel
for file in $(cat files.txt); do
  claude -p "Migrate $file. Return OK or FAIL." \
    --allowedTools "Edit,Bash(git commit *)" &
done
wait

# Step 3: Verify
claude -p "Check all migrated files for consistency"
```

`--allowedTools` restricts capabilities during unattended execution.

## 12. Context Preservation — 3 Living Files

| File | Purpose | Max Lines | Update Trigger |
|------|---------|-----------|---------------|
| `progress.md` | Project long-term verified state | 40 | After VERIFIED or CLOSED transitions |
| `todo.md` | Session short-term active queue | 20 | At every milestone during session |
| `HANDOFF.md` | Session bridge for continuation | 50 | At 50% context or session end |

These files are the agent's working memory. Keep them compact. Prune aggressively. Never let them become history logs.

## 13. Review Gate Protocol

### Subphase Gate (after each subphase)

Agent runs the verification gate checklist from `verification-protocol.md` §2.

**Result:**
- PASS → Subphase marked VERIFIED, next subphase unlocked
- FAIL → Specific remediation tasks created, subphase re-entered

### Phase Audit (verification subphase at end of each phase)

Agent runs the phase closure audit from `verification-protocol.md` §3.

**Result:**
- PASS → Phase marked CLOSED, next phase unlocked, status docs updated
- FAIL → Specific remediation tasks created, phase re-entered

## 14. 3-Tier Progressive Planning Pipeline

The recommended approach for any project with 3+ phases. Eliminates orphaned checkboxes, cognitive overload, and false closure from upfront over-planning.

**Root problem this solves:** Writing all phase detail upfront creates predictions, not plans. Predictions become fake checkboxes. Fake checkboxes become false CLOSED status. By the time Phase 6 runs, the Phase 6 plan was written based on Phase 1 assumptions — those assumptions are wrong.

### The Three Tiers

```
TIER 1 — DISCOVERY (one session, before any planning)
─────────────────────────────────────────────────────
Goal:    Capture all truth about the project before designing anything.
Output:  docs/SPEC.md
What:    Project vision, full requirements, stack decision + rationale,
         hard constraints (NEVER rules), risk profile, integrations,
         team context, design assets.
Rule:    No phase planning until SPEC.md is complete and reviewed.

TIER 2 — STRATEGIC SKELETON (one session, after discovery)
─────────────────────────────────────────────────────────
Goal:    Show all phases — names, dependencies, exit criteria only.
Output:  _planning/roadmap.md
What:    Phase name | dependency | exit criteria (2-3 lines max per phase)
Rule:    NO subphases. NO tasks. NO implementation detail.
         If you're writing tasks, you're in Tier 3, not Tier 2.

TIER 3 — PER-PHASE DOCUMENTATION (one session per phase, sequentially)
────────────────────────────────────────────────────────────────────────
Goal:    Write ONE phase's complete plan based on actual current state.
Output:  _planning/phase-N/README.md + subphase READMEs + task cards
What:    Subphases, tasks, iron laws, DO/DON'T, truth-gates, entry checks
Rule:    NEVER write Tier 3 for Phase N+1 before Phase N is VERIFIED.
         Each phase is documented one at a time, in order.
```

### Full Pipeline Sequence

```
[Session 1 — Discovery Agent]
  Input:  User interview + existing codebase
  Output: docs/SPEC.md
  Rule:   Ask about constraints, risk profile, design assets — NEVER guess

[Session 2 — Strategic Skeleton Agent]
  Input:  docs/SPEC.md
  Output: _planning/roadmap.md (skeleton only)
  Rule:   Every phase MUST end with a Verification & Closure subphase
          Exit criteria must be verifiable, not vague

[Session 3 — Phase 1 Documentation Agent]
  Input:  roadmap.md (reads Phase 1 row only)
  Output: _planning/phase-1/README.md + subphase READMEs
          Defines PHASE_ENTRY_CHECKS[2] in check-phase-entry.mjs
  Rule:   Full detail only for Phase 1. Stop at Phase 1.

[Session 4 — Phase 2 Documentation Agent]
  Input:  roadmap.md + phase-1/README.md (context only)
  Output: _planning/phase-2/README.md + subphase READMEs
          Defines PHASE_ENTRY_CHECKS[3] in check-phase-entry.mjs
  Rule:   Full detail only for Phase 2.

... repeat for each phase ...

[Execution — Phase N Task Executor]
  MANDATORY FIRST STEP: node scripts/check-phase-entry.mjs --phase=N
  If exit 0 → proceed. If exit 1 → BLOCKED. Fix previous phase first.
  Then: Execute tasks, run self-checks, run subphase gates, run phase audit.
```

### Why Not Write All Tier 3 Upfront?

| All Tier 3 upfront | Per-phase Tier 3 |
|-------------------|-----------------|
| Phase 6 plan written based on Phase 1 assumptions | Phase 6 plan written after Phase 5 is VERIFIED |
| 200+ checkboxes created speculatively | 20-30 checkboxes per phase, based on reality |
| Phase N plan is outdated before it executes | Phase N plan reflects actual current state |
| Cognitive overload → sloppy planning | Focused session → precise planning |
| False CLOSED from unchecked orphaned boxes | No orphaned boxes — each phase planned just before it runs |

### Entry Gate as Hard Blocker

The entry gate is what makes this system deterministic, not aspirational:

```bash
# This command MUST return exit 0 before Phase N begins.
# If it exits 1, Phase N is BLOCKED — no exceptions.
node scripts/check-phase-entry.mjs --phase=N
```

Define `PHASE_ENTRY_CHECKS[N]` during Phase N-1 documentation. Each check maps directly to Phase N-1's exit criteria — grep commands, file existence checks, import scans. If the check cannot be expressed as a command, it is not a truth-gate — it is wishful thinking.
