# Execution Checklists

## A) New Task Intake

1. Select correct template variant.
2. Set `Task Type`, `Workstream`, `Priority`, `Risk`.
3. Fill `Instructions`, `Acceptance Criteria`, `Definition of Done`.
4. Set `Execution Mode` and `Executor Type`.
5. Set signature baseline (`Signature`, `Signature Status`).
6. Link project/team/assignee.
7. Fill continuity fields:
- `Client Session`
- `Continuation Token`
- `Resume Entry`
8. Confirm formula gates:
- `Required Fields OK = true`
- `Continuity OK = true` (for AI-capable modes)

## B) Start Execution (`Ready -> In progress`)

1. Append one `Work Logs` record first.
2. Set `Before State=Ready`, `After State=In progress`.
3. Add actor identity and signature.
4. Begin `Execution Notes`.

## C) Progress Update

1. Update notes with concrete delta.
2. Add or refresh evidence URL.
3. If dependency changed, update next action.
4. Append work log for each meaningful transition.

## D) Review Gate

### AI Review

1. Verify acceptance criteria coverage.
2. Verify evidence quality.
3. Verify AI signature format.
4. Decide `Human Review` or return to `In progress`.

### Human Review

1. Verify policy-sensitive constraints.
2. Verify approval requirement status.
3. Verify traceability chain completeness.

## E) Done Gate

1. `Done Gate OK` is true.
2. `Policy Verdict` is `PASS`.
3. Approval linked if required.
4. Final work log exists.
5. No unresolved blocker.
6. Handoff/context updated if transfer follows closure.

## F) Blocked Gate

1. Populate `Blocked By` with owner and reason.
2. Publish immediate recovery action.
3. If needed, trigger supervisor escalation.
4. Append blocker work log.

## G) Cross-Client Transfer

1. Create one `Handoffs` record.
2. Update one `Context Packets` record to `Current`.
3. Link both records on active task.
4. Ensure resume command is executable.

## H) Daily Operations Health

1. No `Done` tasks with missing mandatory fields.
2. No unsigned AI-executed tasks.
3. No transition without work log.
4. No stale approvals requiring decision.
5. No stale context packet for active tasks.
6. No active client profile with `MCP Profile Ready = false`.
7. No active project with `Execution Gate Verdict != READY`.
