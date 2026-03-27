---
name: autonomous-delivery
description: Run a coding project in ultra-strict end-to-end delivery mode. Use when the user explicitly wants autonomous completion with minimal interruption. Detects agent-architect enforcement automatically — respects phase entry gates and IMPLEMENTED → VERIFIED → CLOSED when active; falls back to TASKS.md board for standalone projects.
---

# Autonomous Delivery

Use this skill only for ultra-strict end-to-end execution. Do not apply implicitly.

## Trigger conditions

Use when the user explicitly wants a one-pass finish:
- "to'xtama"
- "bir passda tugat"
- "oxirigacha bajar"
- "faqat oxirida hisobot ber"
- "loyiha tugamaguncha to'xtama"

## Project mode detection (MANDATORY — first action)

Before any execution, determine which mode applies:

**agent-architect mode** — when ALL of the following exist:
- `_planning/` directory with phase READMEs
- `scripts/check-phase-entry.mjs`
- `HANDOFF.md` using IMPLEMENTED / VERIFIED / CLOSED status

**standalone mode** — all other projects

Mode determines the execution loop, status tracking, and board format. Never mix modes mid-run.

---

## agent-architect mode

Autonomous delivery operates WITHIN agent-architect Iron Laws. Speed is maintained — gate compliance is not optional.

### Entry gate (non-negotiable)

Before each phase: `node scripts/check-phase-entry.mjs --phase=N`

- Exit 0 → proceed automatically, no interruption
- Exit 1 → **STOP** — report exact gate output to user. This is the only non-blocker-class stop condition.

Never bypass, suppress, or ignore exit 1. There are no exceptions.

### Execution board

Use `_planning/phase-N/README.md` subphase list as the execution board. Do not create `docs/TASKS.md` in agent-architect projects.

Track and update subphase status in-place:

| From | To | Condition |
|------|----|-----------|
| NOT STARTED | IMPLEMENTED | Code complete, compiles |
| IMPLEMENTED | VERIFIED | Truth-gate greps pass, typecheck + lint + tests pass |
| VERIFIED | CLOSED | Adversarial audit passes, roadmap + memory files updated |

### Status advancement rules

- NEVER write `CLOSED` without running the subphase's Truth-Gate grep commands first
- Run `pnpm check:truth-gates` (or equivalent) before any VERIFIED → CLOSED advancement
- If truth-gates fail: fix violations, re-run, then advance. Do not skip or defer.
- After each subphase closure: update `HANDOFF.md`, `_memory/progress.md`, `_memory/todo.md`

### Execution loop (agent-architect mode)

1. Read `HANDOFF.md` → `_memory/progress.md` → current phase README and all subphase READMEs.
2. Identify all likely blockers. Gather external parameters upfront (see §Upfront parameter intake).
3. Run `check-phase-entry.mjs --phase=N` — must exit 0 to continue.
4. Execute subphases in order. For each subphase: implement → verify → close before starting the next.
5. After each subphase: run truth-gates, advance status, update memory files.
6. After all subphases: run `pnpm typecheck && pnpm lint && pnpm test`. Fix all failures before closure.
7. Update `HANDOFF.md` and `_memory/progress.md`. Deliver one final report.

---

## Standalone mode

For projects without agent-architect enforcement. Original TASKS.md behavior.

### TASKS.md standard

`docs/TASKS.md` is mandatory in standalone mode. Create or repair it before implementation.

Required properties:
- Phased sections: foundation → data → core business → UI → integrations → testing/release
- Concrete, testable, implementation-shaped tasks
- Consistent status: `[ ]`, `[x]`, `[-]`
- "Current focus" section near top; "Immediate next actions" near bottom
- Updated during execution so another agent can resume cleanly without context

### Execution loop (standalone mode)

1. Read the repo and identify current project state.
2. Confirm or create `docs/TASKS.md`.
3. Gather blocker parameters upfront (see §Upfront parameter intake).
4. Apply configuration immediately after user replies.
5. Execute tasks in dependency order without stopping.
6. Run validation steps that are realistic in the environment.
7. Update `docs/TASKS.md` with accurate statuses. Deliver one final report.

---

## Upfront parameter intake

Gather before deep implementation to avoid mid-project stalls.

Look for:
- Environment variables and secrets
- External service choices (DB provider, auth service, deployment target)
- Domain names, public URLs, bot tokens, API keys, CLI runtime decisions

Rules:
- Ask once in a compact, grouped format.
- If a reasonable default exists, propose it instead of asking an open question.
- Write values into `.env`, config files, or placeholder locations immediately after the user replies.

---

## Communication rules

Optimize for low-noise execution.

Do:
- Be concise.
- Make reasonable assumptions; record them after the work is done.
- Keep focus on finishing.

Do not:
- Report after every small step.
- Pause for non-critical confirmation.
- Produce long reflective commentary.
- Re-plan after implementation has started.

---

## Final report format

Report once at the end:
- What was completed
- What was validated (truth-gates, typecheck, lint, test results)
- What remains and why (if anything)
- Which status files and board entries were updated

If blocked:
- State the exact blocker (gate exit code, script output, validation failure)
- State what was attempted
- State the smallest user action needed to unblock
