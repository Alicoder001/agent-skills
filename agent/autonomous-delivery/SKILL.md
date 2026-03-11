---
name: autonomous-delivery
description: Run a coding project in an ultra strict end-to-end delivery mode. Use only when the user explicitly wants autonomous completion with minimal interruption, a real phased TASKS.md board, upfront collection of blocker parameters, and continuous implementation until the project is complete or a true blocker is reached.
---

# Autonomous Delivery

Use this skill only for ultra strict end-to-end execution.

If this skill is not invoked, work normally. Do not apply this workflow implicitly unless the user clearly asks for it.

## Trigger conditions

Use this skill when the user explicitly wants a one-pass finish, for example:
- "to'xtama"
- "bir passda tugat"
- "oxirigacha bajar"
- "faqat oxirida hisobot ber"
- "loyiha tugamaguncha to'xtama"

When triggered:
- Do a short alignment pass first.
- Inspect the repository and all source-of-truth docs before changing code.
- Verify that `docs/TASKS.md` exists and is a true end-to-end execution board.
- If `docs/TASKS.md` is missing or weak, create or repair it before major implementation.
- Ask for all missing blocker parameters up front in one compact batch.
- Place those parameters into the correct locations as soon as they are provided.
- Continue executing without step-by-step reporting.
- Stop only for a true blocker that cannot be resolved from repo context or the provided parameters.
- At the end, update `docs/TASKS.md`, mark progress precisely, and give one final completion report.

## TASKS.md standard

When this skill is active, `docs/TASKS.md` is mandatory. When creating or repairing it, make it an execution board, not a vague wishlist.

Required properties:
- Use phased sections from foundation to delivery, operations, testing, and release readiness.
- Make tasks concrete, testable, and implementation-shaped.
- Track status consistently with `[]`, `[x]`, `[-]`, or another single documented convention.
- Include dependencies or sequencing where it matters.
- Keep a short "Current focus" section near the top.
- Keep a short "Immediate next actions" section near the bottom.
- Update the board during execution so another agent can resume cleanly.

Minimum phase shape:
1. Foundation and environment
2. Data and persistence
3. Core business flow
4. UI and operator surfaces
5. Integrations and delivery
6. Testing, hardening, and release checks

## Upfront parameter intake

In this mode, gather blocker inputs before deep implementation so execution does not stall midway.

Look for missing items such as:
- Environment variables and secrets
- External service choices
- Deployment targets
- Database connection details
- Domain names or public URLs
- Auth requirements
- Source lists, channel IDs, bot tokens, API keys, or CLI runtime decisions

Rules:
- Ask once in a compact, grouped format.
- Ask only for information that is truly needed to avoid later blockers.
- If a reasonable default exists, propose it instead of asking an open question.
- After the user answers, write values into the appropriate `.env`, config, docs, or placeholders immediately.

## Execution loop

Follow this order:

1. Read the repo and identify the current project state.
2. Read the main docs and confirm the source of truth.
3. Create or normalize `docs/TASKS.md` if needed.
4. Identify all likely blockers and gather parameters up front.
5. Apply configuration and placeholders immediately after the user replies.
6. Execute remaining tasks in dependency order.
7. Run validation steps that are realistic in the environment.
8. Update `docs/TASKS.md` with accurate statuses and notes.
9. Give one final report with outcomes, validations, and any residual blockers.

## Communication rules

Optimize for low-noise execution.

Do:
- Be concise.
- Make reasonable assumptions and record them after the work is done.
- Keep focus on finishing the project.

Do not:
- Report after every small step.
- Pause for non-critical confirmation.
- Produce long reflective commentary.
- Re-plan repeatedly after implementation has started.

## Final report format

When the full pass ends, report:
- What was completed
- What was validated
- What remains, if anything, and why
- Which task items were updated

If blocked:
- State the exact blocker
- State what was attempted
- State the smallest user action needed to unblock progress
