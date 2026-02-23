---
name: notion-ops
description: Notion operations control-plane for AI and human delivery teams. Use when designing, setting up, auditing, or running Notion workspaces with task lifecycle governance, signatures, approvals, work logs, handoffs, context packets, and MCP client continuity.
---

# Notion Ops

> Operate Notion as a reliable execution system for multi-agent and human workflows.

## Core Outcomes

1. Keep `Total tasks` as the single source of execution truth.
2. Enforce immutable `Work Logs` for every status transition.
3. Enforce signature policy for AI and human actors.
4. Preserve deterministic continuation across MCP clients.
5. Keep handoff, context, and approval chains auditable.

## Execution Workflow

### 1. Audit Baseline

1. Verify required databases and relations.
2. Verify role model (`Orchestrator`, `Planner`, `Executor`, `Reviewer`, `Human Supervisor`).
3. Verify template quality and required task fields.
4. Verify continuity chain (`Runs`, `Handoffs`, `Context Packets`).

Use: `references/database-contracts.md`

### 2. Harden Template Layer

1. Keep one canonical SOP template for governance.
2. Maintain specialized templates (AI solo, incident, research, supervisor).
3. Ensure template defaults are safe:
- `Status=Backlog`
- `Signature Status=Missing` for AI-capable templates
- `Interoperability=Ready`
- explicit `Policy Version`

Use: `references/operating-model.md`

### 3. Operate Task Lifecycle

1. Fill mandatory fields before `Ready`.
2. Create first work log before `In progress`.
3. Attach evidence before review gates.
4. Enforce signatures and approvals before `Done`.
5. If blocked, publish blocker owner and next action immediately.

Use: `references/checklists.md`

### 4. Maintain MCP Continuity

1. On pause/transfer, publish one `Handoffs` record.
2. Keep one `Context Packets` record marked `Current`.
3. Include executable `Resume Command` and `Next Action`.
4. Link active task to client profile and context/handoff records.

Use: `references/mcp-continuation.md`

### 5. Run Daily Control

1. Check signature compliance.
2. Check transition-log completeness.
3. Check unresolved blockers and aging `In progress` tasks.
4. Check open approvals and stale context packets.

## Non-Negotiable Rules

1. Never move AI-executed work to `Done` without valid AI signature.
2. Never change task status without a matching `Work Logs` entry.
3. Never transfer work across clients without handoff + context update.
4. Never close incidents without mitigation proof and follow-up actions.

## Output Contract

When reporting work, return:

1. `Current State`: concise health snapshot.
2. `Actions Performed`: exact updates and affected artifacts.
3. `Compliance Gaps`: signature/log/approval/continuity misses.
4. `Next Actions`: ordered commands for immediate continuation.

## Failure Handling

1. Relation mismatch: fetch schema and map exact property names before writing.
2. Ambiguous selection update: use unique snippets or replace full content.
3. Rate limits: switch to direct page fetches by ID and continue incrementally.
4. Partial continuity data: freeze status advancement, then repair handoff/context links.

## References

1. [Database Contracts](references/database-contracts.md)
2. [Operating Model](references/operating-model.md)
3. [Execution Checklists](references/checklists.md)
4. [MCP Continuation](references/mcp-continuation.md)
