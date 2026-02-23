# Database Contracts

Use this contract when creating, validating, or auditing Notion operational workspaces.

## Core Databases

### 1. `Projects`

Purpose: program-level control plane.

Required properties:
- `Name` (title)
- `Status`
- `Automation Mode`
- `Interoperability`
- `Agent Team`
- `MCP Profiles`
- `Latest Handoff`
- `Latest Context`

Recommended:
- `Last Run`
- `Latest Approval`
- `Resume Entry`
- `Ops Notes`
- `Project Ops Ready` (formula)
- `Execution Gate Verdict` (formula)

### 2. `Total tasks`

Purpose: master execution queue.

Required properties:
- `Name` (title)
- `Status`
- `Task Type`
- `Workstream`
- `Priority`
- `Risk`
- `Execution Mode`
- `Executor Type`
- `Instructions`
- `Acceptance Criteria`
- `Definition of Done`
- `Signature`
- `Signature Status`
- `Interoperability`
- `Policy Version`

Governance/traceability links:
- `Assigned Agent` or `Human Assignee`
- `Agent Team`
- `Run`
- `Work Logs`
- `Approval`
- `Latest Handoff`
- `Context Packet`
- `Client Profile`

Governance formulas:
- `Required Fields OK`
- `Signature OK`
- `Work Log OK`
- `Approval OK`
- `Continuity OK`
- `Done Gate OK`
- `Policy Verdict`

### 3. `Agents`

Purpose: actor registry.

Required properties:
- `Name`
- `Agent Type` (`AI`, `Human`, `System`)
- `Role` (`Orchestrator`, `Planner`, `Executor`, `Reviewer`, `Analyst`, `Specialist`, `Human Supervisor`, `General Supervisor`)
- `Mode`
- `Status`
- `Default Signature`
- `Objective`

### 4. `Agent Teams`

Purpose: team topology and responsibility.

Required properties:
- `Name`
- `Lead Agent`
- `Members`
- `Operating Model`
- `Status`

Recommended:
- `Human Supervisor`
- `Purpose`

### 5. `Runs`

Purpose: orchestration session tracking.

Required properties:
- `Name`
- `Run ID`
- `Stage`
- `Trigger`
- `Project`
- `Orchestrator`
- `Signature`

Recommended:
- `Agent Team`
- `Started At`
- `Ended At`
- `Retry Count`
- `Error Log`

### 6. `Approvals`

Purpose: human/validator sign-off.

Required properties:
- `Name`
- `Approval ID`
- `Decision`
- `Policy Check`
- `Project`
- `Task`
- `Signature`

Recommended:
- `Approver`
- `Reviewer Agent`
- `Reviewer Notes`
- `Approved At`

### 7. `Work Logs`

Purpose: immutable transition and activity ledger.

Required properties:
- `Name`
- `Log ID`
- `Timestamp`
- `Action Type`
- `Actor Type`
- `Actor Name`
- `Before State`
- `After State`
- `Signature`
- `Immutable`
- `Task`
- `Project`

Recommended:
- `Run`
- `Agent`
- `Agent Team`
- `Metadata`

### 8. `MCP Integrations`

Purpose: client profile registry.

Required properties:
- `Name`
- `Client`
- `Status`
- `Connection Type`
- `Credential Method`
- `Signature Policy`

Recommended:
- `Connection Command`
- `MCP Server Name`
- `Default Project`
- `Default Team`
- `Default Orchestrator`
- `Last Verified`
- `Connection Ready` (formula)
- `Default Routing OK` (formula)
- `MCP Profile Ready` (formula)

### 9. `Handoffs`

Purpose: explicit ownership transfer.

Required properties:
- `Name`
- `Handoff ID`
- `From Agent`
- `To Agent`
- `Project`
- `Task`
- `Run`
- `Status`
- `Next Action`
- `Resume Command`
- `Handoff Signature`

Recommended:
- `Priority`
- `Due`
- `Context Snapshot`
- `Blockers`
- `Audit Log`
- `Client Profile`

### 10. `Context Packets`

Purpose: continuation memory for deterministic resume.

Required properties:
- `Name`
- `Packet ID`
- `Status` (`Current`, `Superseded`, `Archived`)
- `Project`
- `Task`
- `Run`
- `Handoff`
- `Owner Agent`
- `Continuation Token`
- `Resume Command`
- `Signature`
- `Snapshot Time`

Recommended:
- `Objective`
- `Scope`
- `Completed`
- `Decisions`
- `Constraints`
- `Risks`
- `Next Steps`
- `References`
- `Client Profile`

## Cross-Database Relation Minimum

1. `Projects` <-> `Total tasks`
2. `Total tasks` <-> `Work Logs`
3. `Total tasks` <-> `Runs`
4. `Total tasks` <-> `Approvals`
5. `Total tasks` <-> `Handoffs`
6. `Total tasks` <-> `Context Packets`
7. `Projects` <-> `MCP Integrations`
8. `Runs` <-> `Agent Teams` and `Agents`
9. `Handoffs` <-> `Work Logs`
10. `Context Packets` <-> `Handoffs`

## Validation Rules

1. If `Status` changes, `Work Logs` must append one entry.
2. If `Executor Type` includes AI, `Signature Status` cannot be `Not required`.
3. If `Approval Required=Yes`, task cannot be `Done` without linked approval.
4. If cross-client transfer happens, both `Handoffs` and `Context Packets` must update.
5. Only one context packet per task should remain `Current`.
6. `Policy Verdict` should resolve to `PASS` before closing critical tasks.
7. `MCP Profile Ready` should be true for actively used client profiles.
