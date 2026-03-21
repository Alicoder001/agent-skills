# Prompt Patterns & Audit

## 1. Prompt Architecture

Use a layered structure:

- Identity: who the agent is
- Domain context: current stack and constraints
- Authority boundaries: can/cannot decide
- Dynamic context: current task, sprint, blockers

## 2. Prompt Language Rules

| Pattern | Bad | Good |
|---------|-----|------|
| Hard rules | "Prefer TypeScript" | "MUST use TypeScript strict" |
| Prohibitions | "Try to avoid any" | "NEVER use any" |
| Specificity | "Format code properly" | "Use 2-space indentation" |
| Structure | Long narrative | Bullets or steps |

## 3. Skill Description Writing

Descriptions should clearly say:

- Use when...
- Do NOT use when...

## 4. Effective Prompting Patterns

Prefer:

- scoped file/path references
- explicit success criteria
- verification steps
- references to existing patterns instead of re-describing whole systems

## 5. CLAUDE.md Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| 200+ line CLAUDE.md | Prune and move details to docs/skills |
| Tool-enforceable rules in prompts | Move to hooks/scripts/lint |
| Vague quality statements | Replace with verifiable instructions |
| Inline long docs | Link or summarize |

## 6. Prompt System Contract

Use a stable structure:

```text
ROLE
SUCCESS CRITERIA
CONSTRAINTS
UNCERTAINTY POLICY
CONTEXT
TASK
OUTPUT FORMAT
VERIFICATION
```

## 7. Audit Checklist

### CLAUDE.md Health

| Check | Severity |
|------|----------|
| Line count > 100 | High |
| Line count > 200 | Critical |
| No session protocol | High |
| Tool-enforceable rules trapped in prompts | High |
| Vague instructions | Medium |

### Skills Architecture

| Check | Severity |
|------|----------|
| No progressive disclosure | Critical |
| Overlapping skills | Medium |
| No clear trigger language | High |

### Session Continuity

| Check | Severity |
|------|----------|
| `progress.md` missing | High |
| `todo.md` missing | Medium |
| `HANDOFF.md` protocol missing | Medium |
| Session continuity documented but not enforced | High |
| Project claims automation without hooks/scripts/verification | Critical |
| Handoff gets deleted on read without explicit disposable workflow | High |

### Hooks / Enforcement

| Check | Severity |
|------|----------|
| No PreCompact preservation path | Medium |
| No end-of-session verification path | High |
| Hook examples unsafe or overly destructive | High |
| Hook claims not verified in `/hooks` | Medium |

### Prompt Reliability

| Check | Severity |
|------|----------|
| No eval or verification step for important prompt changes | High |
| No model/version pinning guidance where stability matters | Medium |

## 8. Audit Output Requirements

Every audit should classify the system as one of:

- `documented only`
- `partially enforced`
- `fully enforced`

Every finding should include:

1. What is wrong
2. Why it matters
3. What exact file or mechanism should change
4. How to verify the fix

## 9. Audit Report Template

```markdown
# Prompt Architecture Audit

## Date
[date]

## Health
[GREEN / YELLOW / RED]

## Automation Status
[documented only / partially enforced / fully enforced]

## Findings
1. [Finding] -> [Fix] -> [Verification]
```
