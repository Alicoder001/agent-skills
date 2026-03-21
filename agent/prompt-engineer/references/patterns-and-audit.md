# Prompt Patterns & Audit

## 1. The 4-Layer Agent Prompt Architecture

### Layer 1: Identity (WHO)

Define how the agent thinks, not just what it does.

```
BAD:  "You are a CTO. Answer technical questions."
GOOD: "You are Marcus Webb, CTO with 12 years at Google and Stripe.
       Decision style: trade-offs first, then decide.
       Strength: system design, scalability.
       Weakness: UX nuances — sometimes over-engineers."
```

### Layer 2: Domain Knowledge (WHAT)

Inject concrete, current project knowledge — not generalities.

```
BAD:  "You know about backend and APIs."
GOOD: "Stack: Node.js 20 + Express, PostgreSQL 14 + Redis 7
       Current: monolith -> microservices migration
       Tech debt: Sequelize -> Prisma migration pending
       CI/CD: GitHub Actions + ArgoCD"
```

### Layer 3: Authority Boundaries (CAN/CANNOT)

```
I DECIDE: Technical architecture, deploy freeze, backend PR approve/reject
REQUIRES APPROVAL: Feature priorities -> PM, spending >$10K -> CEO
OUTSIDE SCOPE: Design/UX -> Zoe, ML -> Leon
WHEN ASKED OUTSIDE SCOPE: "That's [name]'s call."
```

### Layer 4: Dynamic Context (NOW)

Injected at runtime: current sprint, active issues, last decisions, timestamp.

## 2. Prompt Language Rules

| Pattern | Bad | Good |
|---------|-----|------|
| Hard rules | "Prefer TypeScript" | "MUST use TypeScript strict" |
| Prohibitions | "Try to avoid any" | "NEVER use 'any'" |
| Specificity | "Format code properly" | "Use 2-space indentation" |
| Structure | Long narrative paragraph | Numbered steps or bullets |

Structured prompts consume ~30% fewer tokens than narrative with ~40% better adherence.

## 3. Skill Description Writing

```yaml
# GOOD — clear trigger and exclusion
description: >
  Extracts text from PDF files. Use when working with .pdf files
  or user mentions document extraction. Do NOT use for PDF creation.

# BAD — vague
description: "Helps with documents"
```

Rules: third person, "Use when..." + "Do NOT use when...", 2-4 sentences.

## 4. Effective Claude Code Prompts

**Bug fixing:**
```
"Users report login fails after session timeout.
Check auth flow in src/auth/, especially token refresh.
Write a failing test, then fix it."
```

**Feature with pattern reference:**
```
"Look at HotDogWidget.php for the pattern.
Follow it to implement a calendar widget.
No new libraries beyond what's already used."
```

**Scoped exploration with subagent:**
```
"Use subagents to investigate how token refresh works
in src/auth/ and what OAuth utils exist in src/utils/.
Report findings only — don't change files."
```

**Reset after failed attempts:**
```
"Knowing everything you know now, scrap this and implement the elegant solution."
```

## 5. CLAUDE.md Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| 200+ line CLAUDE.md | Prune to 60 lines, move rest to skills/docs |
| `console.log bo'lmasin` in CLAUDE.md | `"no-console": ["error"]` in .eslintrc |
| "Write clean code" | Delete — not verifiable |
| Detailed API docs inline | Link: `See @docs/api-reference.md` |
| File-by-file descriptions | Delete — let Claude explore |
| LLM-generated rules | Human-curate only what agent can't infer |

## 6. System Prompt Contract Format (API)

```
ROLE: [Who]
SUCCESS CRITERIA: [What perfect looks like]
CONSTRAINTS: [Hard limits]
UNCERTAINTY: [What to do when unsure]
CONTEXT: [Relevant info]
TASK: [Instruction]
OUTPUT FORMAT: [Expected structure]
```

---

## 7. Audit Checklist

### CLAUDE.md Health

| Check | Pass | Severity |
|-------|------|----------|
| Line count <= 100 | Yes/No | Critical if >200 |
| Token estimate <= 600 | Yes/No | High if >1000 |
| `claude "run the tests"` works first try | Yes/No | Critical |
| No tool-enforceable rules | Yes/No | High |
| No vague instructions | Yes/No | Medium |
| MUST/NEVER for hard rules | Yes/No | Medium |
| Session protocol present | Yes/No | High |

### Skills Architecture

| Check | Pass | Severity |
|-------|------|----------|
| Progressive disclosure (not inline CLAUDE.md) | Yes/No | Critical |
| Each SKILL.md <= 50 lines | Yes/No | High |
| "Use when..." in descriptions | Yes/No | High |
| No overlapping skills | Yes/No | Medium |

### Context Budget

| Check | Pass | Severity |
|-------|------|----------|
| Startup load < 2K tokens | Yes/No | Critical |
| 90%+ context available after startup | Yes/No | High |
| Auto-compact override <= 60% | Yes/No | Medium |
| MCP servers <= 10 | Yes/No | Medium |

### Session Continuity

| Check | Pass | Severity |
|-------|------|----------|
| progress.md exists | Yes/No | High |
| todo.md exists (max 20 lines) | Yes/No | Medium |
| HANDOFF.md protocol documented | Yes/No | Medium |

### Hooks

| Check | Pass | Severity |
|-------|------|----------|
| PostToolUse lint hook | Yes/No | High |
| PreCompact context preservation | Yes/No | Medium |
| No CLAUDE.md-hook duplication | Yes/No | Medium |

## 8. Audit Report Template

```markdown
# Prompt Architecture Audit
## Date: [date] | Project: [name]
## Health: [GREEN/YELLOW/RED]
## Critical: [count] | High: [count]
## Token Load: [current] -> [after fixes] ([X]% savings)
## Findings & Fixes
1. [Finding] -> [Fix]
```
