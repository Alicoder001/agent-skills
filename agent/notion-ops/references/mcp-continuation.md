# MCP Continuation

Use this playbook to continue work across Codex, Cursor, Claude Code, Gemini, VS Code, or other MCP-capable clients.

## Client Profile Lifecycle

1. Register one profile per client in `MCP Integrations`.
2. Set `Connection Type`, `Credential Method`, `Signature Policy`.
3. Keep `Last Verified` current.
4. Link default project/team/orchestrator.

## Session Start

1. Open project `Resume Entry`.
2. Open active task.
3. Open latest handoff and current context packet.
4. Execute `Resume Command`.
5. Append first work log before status change.

## Session Pause

1. Write concise execution delta.
2. Create or update handoff with:
- `Next Action`
- `Resume Command`
- `Handoff Signature`
3. Update context packet with:
- `Completed`
- `Decisions`
- `Constraints`
- `Risks`
- `Next Steps`
4. Link both records to active task.

## Cross-Client Transfer Rules

1. Do not transfer without explicit `To Agent`/owner mapping.
2. Do not transfer without updated context packet.
3. Keep continuation token stable for same task chain.
4. If scope changes materially, generate new context version.

## Continuation Token Pattern

Recommended:
`CTX::<project>::<task_id>::<yyyy-mm-dd>::v<version>`

## Resume Command Pattern

Recommended command content:

1. Open task URL
2. Verify blocker/approval status
3. Execute next action
4. Append work log
5. Continue lifecycle gate

## Common Failure Modes

1. Client cannot continue because `Next Action` is vague.
2. Transfer happened but context packet stayed stale.
3. Signature policy changed and template defaults were not updated.
4. Handoff references exist but task links are missing.

## Recovery Procedure

1. Freeze task at current status.
2. Rebuild handoff and context links.
3. Re-issue deterministic `Resume Command`.
4. Restart from first missing audit point with new work log entry.
