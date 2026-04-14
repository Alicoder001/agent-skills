---
name: task-manager
description: Task intake, decomposition, and agent dispatch. Use when the user sends multiple tasks at once and you need to analyze, group, assign to isolated agents, set priorities, and create tasks.md. This is the entry point for all multi-task sessions.
---

# Task Manager

> Receive many tasks. Analyze. Split. Dispatch. Track.

## When to Use

Trigger this skill when:
- User sends 3+ tasks in one message
- Tasks span different pages, modules, or domains
- Parallel agent execution is possible
- User says "ajrat", "bo'lib chiq", "agentlarga ber"

---

## Phase 1 — Intake

### 1.1 Read all tasks first
- Read the ENTIRE user message before doing anything
- Do NOT start implementing
- Do NOT ask clarifying questions yet (unless a task is completely ambiguous)

### 1.2 Categorize each task
For each task, identify:
- **Domain** — which page, module, or feature area
- **Type** — bug fix / new feature / refactor / config
- **Size** — small (< 1 hour) / medium / large (cross-cutting)
- **Dependency** — does it depend on another task?

---

## Phase 2 — Decompose

### 2.1 Group by isolation boundary

```
Rule: Tasks that touch the same files → same agent
Rule: Tasks that are cross-cutting (e.g. alias migration) → separate agent
Rule: Tasks with no file overlap → separate agents (parallel)
```

### 2.2 Agent assignment

Name agents alphabetically:

```
AGENT A — [Domain or Theme]
AGENT B — [Domain or Theme]
AGENT C — [Domain or Theme]
...
```

Each agent gets:
- A clear responsibility label
- A list of tasks (numbered A.1, A.2, ...)
- A list of files it owns (no overlap with other agents)

### 2.3 Isolation rule (HARD)

```
⚠️ ISOLATION — Non-negotiable

- Each agent owns its files. No other agent touches them.
- If two tasks need the same file → assign both to the same agent.
- If a file conflict is unavoidable → flag it to the user before starting.
- Agents NEVER read or modify each other's output mid-session.
```

---

## Phase 3 — Prioritize

| Priority | When | Examples |
|----------|------|---------|
| **HIGH** | Broken functionality, blocking others | Auth bug, crash, core feature |
| **MEDIUM** | Important but not blocking | New page, filter, export |
| **LOW** | Polish, cleanup, migration | Alias refactor, rename, docs |

Execution order:
1. HIGH agents first (run in parallel if isolated)
2. MEDIUM after HIGH is verified
3. LOW last

---

## Phase 4 — Write tasks.md

Create `tasks.md` in project root with this format:

```markdown
# Task List — [Project Name]
Generated: [date]

---

## 🤖 AGENT A — [Theme]
**Files owned:** `src/x/`, `src/y/file.ts`
**Priority:** HIGH

### Task A.1 — [Title]
- **What:** Clear description of what to do
- **Why:** Reason / user complaint / bug
- **Acceptance:** Specific condition that proves it's done
- **Files:** Exact file paths

### Task A.2 — [Title]
- **What:** ...
- **Why:** ...
- **Acceptance:** ...
- **Files:** ...

---

## 🤖 AGENT B — [Theme]
**Files owned:** `src/z/`
**Priority:** MEDIUM

### Task B.1 — [Title]
...

---

## ⚠️ ISOLATION CONTRACT

| Agent | Files | Must NOT touch |
|-------|-------|---------------|
| Agent A | src/x/, src/y/ | src/z/ |
| Agent B | src/z/ | src/x/, src/y/ |

---

## 📋 SUMMARY

| # | Agent | Tasks | Priority | Can start? |
|---|-------|-------|----------|------------|
| A | [Theme] | 2 | HIGH | Yes |
| B | [Theme] | 3 | MEDIUM | After A verified |

**Total agents:** N
**Total tasks:** M
**Parallel groups:** [A, C] then [B] then [D]

---

## ✅ VERIFICATION (each agent runs after finishing)

\`\`\`bash
pnpm typecheck
pnpm lint
pnpm test  # if available
\`\`\`
```

---

## Phase 5 — Dispatch

After `tasks.md` is written, dispatch agents:

### Parallel dispatch (no dependencies):
```
Agent A, B, C — parallel start.
Each reads only its section in tasks.md.
Each runs typecheck + lint after finishing.
```

### Sequential dispatch (dependencies exist):
```
1. Start Agent A (HIGH priority)
2. After Agent A: pnpm typecheck && pnpm lint
3. Start Agent B only after A is VERIFIED
```

### Dispatch message format per agent:
```
## Agent [X] — START

Your tasks are in tasks.md under "AGENT [X]" section.
Files you own: [list]
Files you must NOT touch: [list]

After completing ALL your tasks:
1. pnpm typecheck
2. pnpm lint
3. Report: which tasks done, any blockers
```

---

## Phase 6 — Track

After all agents complete:

| Agent | Status | Typecheck | Lint | Blockers |
|-------|--------|-----------|------|----------|
| A | ✅ Done | ✅ Pass | ✅ Pass | None |
| B | 🟡 WIP | — | — | Waiting for A |
| C | ❌ Blocked | — | — | Unclear requirement |

For blocked agents → ask user before resuming.

---

## Rules

**NEVER:**
- Start implementing before writing tasks.md
- Mix tasks from different domains into one agent
- Let two agents own the same file
- Mark a task complete if typecheck/lint fails
- Guess on ambiguous tasks — ask the user

**ALWAYS:**
- Write tasks.md before any agent starts
- Assign priority to every task
- State the isolation contract explicitly
- Run typecheck + lint after each agent
- Report blockers immediately

---

## Quick Reference

```
User sends tasks
     ↓
Phase 1: Read all. Categorize.
     ↓
Phase 2: Group by isolation. Assign agents.
     ↓
Phase 3: Set priorities.
     ↓
Phase 4: Write tasks.md
     ↓
Phase 5: Dispatch agents (parallel or sequential)
     ↓
Phase 6: Track. Verify. Report.
```
