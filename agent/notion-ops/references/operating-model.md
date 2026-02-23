# Operating Model

## Role Responsibilities

### `Orchestrator`

1. Route tasks to right agent/team.
2. Sequence dependencies and retries.
3. Escalate blockers and policy risks.
4. Maintain run-level health.

### `Planner`

1. Decompose goals into executable tasks.
2. Write measurable acceptance criteria.
3. Define definition-of-done and risk expectations.

### `Executor`

1. Implement scoped work.
2. Keep execution notes and evidence updated.
3. Respect status and signature contract.

### `Reviewer`

1. Validate correctness and completeness.
2. Enforce governance gates.
3. Decide return-to-work vs human-review handoff.

### `Human Supervisor`

1. Own final policy-sensitive decisions.
2. Approve/reject gated outcomes.
3. Handle exceptions and conflicts.

### `General Supervisor`

1. Govern cross-team priorities and policy baselines.
2. Resolve escalations that span multiple projects or agent teams.
3. Authorize emergency exceptions and recovery direction.

## Execution Modes

### `Human Only`

Use for policy, legal, governance, or stakeholder tasks.

### `Solo Agent`

Use for bounded technical work with deterministic verification.

### `AI Team`

Use for multi-step technical delivery requiring routing across roles.

### `Human + AI`

Use for mixed execution where humans own final supervisory decision.

## Signature Policy

### AI Signature

Format:
`AI::<role>::<run_id>::<timestamp>`

Required when any AI actor performs execution or review.

### Human Signature

Default format:
`HUMAN_DEFAULT::<user>::<timestamp>`

Use for supervisory closure and approval actions.

## Status Gate Contract

### `Backlog -> Ready`

Required:
- scope clarity
- acceptance criteria
- definition of done
- ownership assignment

### `Ready -> In progress`

Required:
- first `Work Logs` entry
- initial execution notes

### `In progress -> AI Review`

Required:
- evidence attached
- AI signature present

### `AI Review -> Human Review`

Required:
- reviewer check complete
- unresolved blockers resolved or documented

### `Human Review -> Done`

Required:
- approval linked when needed
- signature status valid
- final work log appended

### Any -> `Blocked`

Required:
- `Blocked By` contains actionable blocker owner
- immediate next action documented

## Incident Mode

For `P1`/`Critical` tasks:

1. Start or attach active `Run`.
2. Open high-frequency work log trail.
3. Keep supervisor in review loop.
4. Close only after mitigation + follow-up tasks.
