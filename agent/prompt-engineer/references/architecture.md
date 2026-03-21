# Architecture & Enforcement

## 1. The Enforcement Pyramid

```
   HOOKS (Layer 0)      100% guaranteed, deterministic
   CLAUDE.md (Layer 1)  ~85% reliable, loaded every session
   SKILLS (Layer 3)     On-demand, loaded when triggered
   DOCS (Layer 4)       Reference, loaded when pointed to
```

| Behavior | Correct Level | Why |
|----------|---------------|-----|
| Run lint after file edit | **Hook** | Must happen every time, zero exceptions |
| Read progress.md at session start | **CLAUDE.md** | Must happen every session |
| Update todo.md after each step | **CLAUDE.md** | Must happen every session |
| Create HANDOFF.md at 50% context | **CLAUDE.md** | Must happen every session |
| How to write a CLAUDE.md | **Skill** | Only needed when designing config |
| API conventions for this project | **Docs** | Only needed when touching API |

**Priority when rules conflict:** Hook > CLAUDE.md MUST/NEVER > Skill > Docs > Training.

## 2. The 4-Layer Progressive Disclosure Stack

### Layer 1: CLAUDE.md (~500 tokens, always loaded)

**Include:** Stack, commands, hard rules (MUST/NEVER), session protocol, compaction rules, skill/doc pointers.

**Exclude:** Tool-enforceable rules (ESLint/Prettier/TSC), standard conventions, detailed docs, file descriptions, vague instructions.

**Adherence:** 60 lines = peak. Bullet-points 40% better than paragraphs. MUST/NEVER > "prefer"/"try".

### Layer 2: Docs (~200-500 tokens each, on-demand)

Domain gotchas, edge cases, project learnings. CLAUDE.md MUST contain: "IMPORTANT: Read relevant docs before starting tasks."

### Layer 3: Skills (~20 tokens frontmatter at startup, full on invoke)

Keep under 50 lines. Split if larger. Description includes "Use when..." AND "Do NOT use when...".

### Layer 4: Subagents (0 tokens in main context)

Reads 20 files, returns 1-2K summary. Use for research, review, exploration.

## 3. Hook Templates

### PostToolUse — Auto-Lint

```json
"PostToolUse": [{
  "matcher": "Write|Edit",
  "command": "npx eslint --fix $FILE && npx prettier --write $FILE"
}]
```

### PreCompact — Preserve Context

```json
"PreCompact": [{
  "command": "echo '---PRESERVE---' && head -30 _memory/progress.md 2>/dev/null && echo '---END---'"
}]
```

### PreToolUse — Protect Frozen Files

```json
"PreToolUse": [{
  "matcher": "Write|Edit",
  "command": "node scripts/check-frozen-files.js $FILE"
}]
```

## 4. AGENTS.md — Cross-Tool SSOT

```
AGENTS.md                          <- Single source
CLAUDE.md                          <- "See AGENTS.md" + short context
.cursor/rules/                     <- Mirrors AGENTS.md (.mdc)
.github/copilot-instructions.md   <- Symlink -> AGENTS.md
.windsurfrules                     <- Synced from AGENTS.md
```

## 5. Token Budget

```
System prompt + CLAUDE.md:     ~5K   ( 2.5%)
Skills frontmatter (20):       ~400  ( 0.2%)
MCP tool schemas:               ~5K  ( 2.5%)
Available:                    ~190K  (95%)
Optimal working range:         40-60%
Dumb zone:                     80%+
```

| File | Max Lines | Token Estimate |
|------|-----------|----------------|
| CLAUDE.md | 60-100 | 300-600 |
| AGENTS.md | 80-120 | 500-800 |
| Skill SKILL.md | 30-50 | 200-400 |
| progress.md | ~40 | ~500 |
| todo.md | 20 max | ~200 |

## 6. Memory File Hierarchy

```
~/.claude/CLAUDE.md        Global (all projects)
./CLAUDE.md                Project root (team-shared, git-tracked)
./CLAUDE.local.md          Personal overrides (gitignored)
./subdir/CLAUDE.md         Directory-specific (auto-loaded)
```

CLAUDE.md supports `@path` imports: `See @docs/api-conventions.md for REST patterns.`

## 7. Bootstrap Templates

### CLAUDE.md Template

```markdown
# [PROJECT_NAME]

## Stack
[Framework] + [Language] + [Key deps] — [Package manager]

## Commands
- Dev: `[command]`
- Build: `[command]`
- Test: `[command]`
- Lint: `[command]`

## Rules (MUST follow)
- [Rule 1 — concrete, verifiable]
- [Rule 2 — concrete, verifiable]

## Session Protocol
1. START: Read _memory/progress.md + _memory/todo.md (if they exist)
2. DURING: Update todo.md after completing each step
3. AT 50% CONTEXT: Create HANDOFF.md (goal, state, blocker, next step, files) then /compact
4. END: Update progress.md + todo.md before closing

## Compaction Rules
When compacting, MUST preserve: modified files list, test results, current task, key decisions.
```

### _memory/progress.md Template

```markdown
# Project Progress

## Current State
- Phase: [TBD]
- Task: [TBD]
- Status: NOT STARTED

## Completed
(none yet)

## Key Decisions
| Date | Decision | Reason |
|------|----------|--------|
```

### _memory/todo.md Template

```markdown
# Current Task

## Todo
- [ ] (awaiting first task)

## Done
(none yet)

## Now
Awaiting first task assignment.
```

### .claude/settings.json Template

```json
{
  "hooks": {
    "PreCompact": [
      {
        "command": "echo '---PRESERVE---' && head -30 _memory/progress.md 2>/dev/null && echo '---END---'"
      }
    ]
  }
}
```

## 8. Bootstrap Verification

After generating files, verify:

```
- [ ] New session: agent reads progress.md + todo.md?
- [ ] Edit file: lint hook runs?
- [ ] /compact: progress.md survives?
- [ ] 50% context: agent creates HANDOFF.md?
- [ ] End session: agent updates progress.md + todo.md?

If any fails:
1. Check CLAUDE.md has Session Protocol section
2. Check .claude/settings.json has hooks
3. Check CLAUDE.md is not >100 lines
```
