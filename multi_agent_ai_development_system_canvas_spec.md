# 🧠 Multi-Agent AI Development System

## 1. Overview

This system is a structured multi-agent orchestration pipeline designed to build software with strict standards, validation loops, and controlled execution.

It is divided into layers:

- Strategy Layer
- Standardization Layer
- Execution Layer
- Validation Layer
- Constraint Layer
- Orchestration Layer

---

## 2. Agent Roles

### 🧭 Opus Architext (Strategic Planner)
**Responsibility:**
- Generates full project roadmap
- Defines phases and subphases
- High-level architecture decisions

---

### 🏗 Claude Sonnet 4.6 (Standard Architect)
**Responsibility:**
- Defines strict rules ("iron rules")
- Creates coding standards
- Defines constraints and requirements

**Output:**
- `standards.json`
- `rules.md`

---

### ⚙️ Qwen 3.5 Plus (Executor)
**Responsibility:**
- Executes tasks
- Produces code / output
- Must strictly follow rules

---

### 🧪 Codex 5.4 (Validator / Auditor)
**Responsibility:**
- Validates outputs
- Detects violations
- Assigns quality score
- Approves or rejects work

---

### 🔒 Blocker System (Constraint Layer)
**Responsibility:**
- Enforces hard limits
- Prevents invalid execution
- Script-based validation

---

## 3. Work Structure

```
Roadmap
 ├── Phase
 │    ├── Subphase
 │    │    ├── Task
```

### Task Requirements:
- Must be atomic
- Must have measurable output
- Must be testable

---

## 4. Standards System (Core)

### Types of Standards

#### 1. Global Rules
- Naming conventions
- Error handling
- Logging
- File structure

#### 2. Phase Rules
- Backend rules
- Frontend rules
- Database rules

#### 3. Task Rules
- Task-specific requirements

---

### Example `standards.json`

```json
{
  "naming": {
    "functions": "camelCase",
    "variables": "camelCase"
  },
  "error_handling": {
    "required": true
  },
  "logging": {
    "required": true
  }
}
```

---

## 5. Execution Flow

### Step-by-step Pipeline

1. Opus → creates roadmap
2. Claude → generates standards
3. Orchestrator → loads state

For each task:

4. Pre-check (Codex)
   - Validate task completeness
   - Validate requirements

5. Qwen Execution
   - Receives:
     - Task
     - Standards
     - Context

6. Post-check (Codex)
   - Validate against rules
   - Score quality

7. Decision:

- PASS → next task
- FAIL → return to Qwen

---

## 6. Control Loop (Important)

```
Qwen → Codex → Qwen → Codex
```

### Rules:
- Max 3 attempts
- If still failing → escalate

---

## 7. State Management

Each task must track state:

```json
{
  "task_id": "T-01",
  "status": "in_progress",
  "attempts": 2,
  "approved": false,
  "last_error": "Missing validation"
}
```

---

## 8. Validation System

### Codex Output Format

```json
{
  "status": "FAIL",
  "score": 6.5,
  "violations": [
    "No error handling",
    "Naming violation"
  ]
}
```

---

## 9. Orchestrator (Core Brain)

### Responsibilities:
- Controls flow
- Assigns tasks to agents
- Tracks state
- Applies stopping rules

---

## 10. Constraints (Blockers)

Examples:
- Prevent unsafe code
- Enforce required fields
- Stop invalid outputs

---

## 11. Key Principles

- MUST follow rules (not optional)
- No task without validation
- No approval without Codex PASS
- No infinite loops

---

## 12. Future Upgrades

- Parallel execution
- Auto task splitting
- Learning feedback system
- Metrics dashboard

---

## 🔥 Final Insight

This system is not prompt chaining.

This is a:
> **Controlled AI Operating System for Development**

