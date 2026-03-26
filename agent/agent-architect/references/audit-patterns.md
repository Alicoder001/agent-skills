# Audit Patterns

## 1. Prompt Architecture

Use a layered structure for every prompt/system prompt:

- **Identity:** Who the agent is, what role it plays
- **Domain context:** Current stack, constraints, project type
- **Authority boundaries:** What the agent can/cannot decide autonomously
- **Dynamic context:** Current task, phase, blockers, risk profile

## 2. Prompt Language Rules

| Pattern | Bad | Good |
|---------|-----|------|
| Hard rules | "Prefer TypeScript" | "MUST use TypeScript strict" |
| Prohibitions | "Try to avoid any" | "NEVER use `any`" |
| Specificity | "Format code properly" | "2-space indent, trailing comma" |
| Structure | Long narrative paragraph | Bullets, tables, or numbered steps |
| Verification | "Make sure it works" | "Run `pnpm typecheck` — must exit 0" |
| Closure | "Mark as done when finished" | "Mark IMPLEMENTED only after self-check passes" |

## 3. Skill Description Writing

Every skill description MUST include:

- **Use when...** — concrete triggers
- **Do NOT use when...** — explicit exclusions

Bad: `"Helps with code quality"`
Good: `"Use when reviewing code for accessibility, responsive design, or production readiness. Do NOT use for general implementation or debugging."`

## 4. Effective Prompting Patterns

| Pattern | Why It Works |
|---------|-------------|
| Scoped file/path references | Agent knows exactly where to look — no broad codebase scanning |
| Explicit success criteria | Agent knows when to stop — prevents runaway exploration |
| Verification steps with commands | Agent can self-check deterministically |
| References to existing patterns | Avoids re-describing whole systems |
| Concrete examples over abstract rules | Agent matches patterns, not prose |
| Tables over paragraphs | ~30% fewer tokens, ~40% better adherence |
| Specific task scope ("add validation to auth.ts") | Prevents broad scanning triggered by vague requests |
| "Choose an approach and commit to it" | Prevents overthinking in Opus 4.6 adaptive thinking mode |

**Context rot warning:** Model accuracy degrades as token count grows within a session. Long conversations with accumulated file reads, tool outputs, and explorations reduce effective reasoning quality. Compact proactively at logical breakpoints, not only when forced. A fresh context with well-structured HANDOFF.md outperforms a bloated context with full history.

## 5. CLAUDE.md Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| CLAUDE.md > 100 lines | Prune, move details to AGENTS.md / skills / docs |
| CLAUDE.md > 200 lines | Critical — split immediately |
| Tool-enforceable rules in prompts only | Move to hooks / scripts / lint |
| Vague quality statements | Replace with verifiable instructions |
| Inline long documentation | Link or summarize |
| Duplicated rules across CLAUDE.md + AGENTS.md + READMEs | Single source of truth, reference from others |
| Historical narrative in rules file | Keep only current state — history goes to progress.md |
| "DONE" as single status word | Replace with IMPLEMENTED / VERIFIED / CLOSED |

## 6. Prompt System Contract

Use a stable structure for system prompts and agent definitions:

```text
ROLE
SUCCESS CRITERIA
CONSTRAINTS
UNCERTAINTY POLICY ("when unsure, ask" vs "when unsure, choose conservatively")
CONTEXT
TASK
OUTPUT FORMAT
VERIFICATION
```

## 7. Audit Checklists

### 7.1 CLAUDE.md Health

| Check | Severity |
|-------|----------|
| Line count > 100 | High |
| Line count > 200 | Critical |
| Estimated token count > 5,000 | High |
| No session protocol section | High |
| No verification section | High |
| Tool-enforceable rules trapped in prompts | High |
| Vague / unverifiable instructions | Medium |
| Duplicated rules also in AGENTS.md | Medium |
| Contains detailed workflow docs that belong in skills | Medium |
| Contains phase/task-specific instructions not needed every session | Medium |

### 7.2 AGENTS.md Health

| Check | Severity |
|-------|----------|
| No completion gates defined | Critical |
| No iron laws / hard rules | High |
| Missing agent roles for active modules | High |
| No decision log | Medium |
| Line count > 150 without justification | Medium |

### 7.3 Skills Architecture

| Check | Severity |
|-------|----------|
| No progressive disclosure — everything in top-level files | Critical |
| Overlapping skills with unclear boundaries | Medium |
| No clear trigger language in skill descriptions | High |
| Skill > 500 lines without supporting reference files | Medium |
| Action skills (deploy, commit) missing `disable-model-invocation: true` | High |
| Heavy research/audit skills missing `context: fork` | Medium |
| Skills with identical content to CLAUDE.md sections | Medium |

### 7.4 Session Continuity

| Check | Severity |
|-------|----------|
| `progress.md` missing | High |
| `progress.md` > 40 lines (bloated) | Medium |
| `todo.md` missing | Medium |
| `todo.md` > 20 lines (bloated) | Medium |
| `HANDOFF.md` protocol missing | Medium |
| Session continuity documented but not enforced | High |
| Project claims automation without hooks/scripts | Critical |
| Handoff deleted on read without disposable workflow | High |

### 7.5 Hooks / Enforcement

| Check | Severity |
|-------|----------|
| No PreCompact preservation path | Medium |
| No end-of-session verification path | High |
| Hook examples unsafe or overly destructive | High |
| Hook claims not verified with `/hooks` | Medium |
| Truth-gate script missing when project has "NEVER" rules | Critical |
| MCP servers configured but never used (idle token waste) | Medium |
| MCP tool definitions exceed 10% of context window | High |

### 7.6 Verification Architecture

| Check | Severity |
|-------|----------|
| No task-level self-check in task card format | Critical |
| No subphase verification gate in subphase READMEs | Critical |
| No phase verification subphase in roadmap | Critical |
| No truth-gate definitions for project risk profile | Critical |
| Status uses single "DONE" instead of IMPLEMENTED/VERIFIED/CLOSED | High |
| Status documents advance before verification passes | Critical |
| No adversarial self-audit before closure claims | High |

### 7.7 Closure Integrity

| Check | Severity |
|-------|----------|
| "DONE" used as single overloaded status | High |
| Roadmap status does not match code reality | Critical |
| Memory/status files overstate completion | Critical |
| No adversarial audit pass exists in workflow | High |
| Lint/typecheck/build treated as sufficient closure evidence | High |
| Closure allowed without functional end-to-end verification | High |
| Project forbids fake/placeholder but has no deterministic scan | Critical |
| Truth-gate script exists but is not wired into closure workflow | High |

### 7.8 Roadmap Architecture

| Check | Severity |
|-------|----------|
| Phases lack verification subphase as final subphase | Critical |
| Subphases lack exit criteria with truth-gate definitions | High |
| Task cards lack self-check section | High |
| Phase README lacks DO / DON'T / EXIT CHECK sections | Medium |
| Roadmap drift: status does not match git history | High |
| Planning and execution mixed in same session/phase | Medium |

## 8. Audit Output Requirements

Every audit MUST classify the system on two axes:

### Axis 1: Enforcement Level

- `documented only` — prompt/readme instructions exist, no deterministic check
- `partially enforced` — some hooks/scripts exist, but gaps remain
- `fully enforced` — deterministic checks verify the critical workflow

### Axis 2: Closure Integrity

- `no closure protocol` — no structured verification before status advances
- `partial closure protocol` — some checks exist, but not all 3 levels
- `full closure protocol` — 3-level verification with truth-gates and adversarial audit

### Finding Format

Every finding MUST include:

1. **What** is wrong — concrete observation
2. **Why** it matters — consequence if not fixed
3. **Where** — exact file or mechanism that should change
4. **How to fix** — specific action
5. **How to verify** — command or check that confirms the fix

For projects with strict constraints (no fake data, no UI drift, no premature closure), every audit MUST also answer:

6. Is closure blocked by deterministic checks or only by prompt wording?
7. Are status files reflecting verified truth or implementation intent?
8. Is there a mandatory adversarial self-audit pass before closure?

## 9. Audit Report Template

```markdown
# Architecture Audit

## Date
[date]

## Health
[GREEN / YELLOW / RED]

## Enforcement Level
[documented only / partially enforced / fully enforced]

## Closure Integrity
[no closure protocol / partial closure protocol / full closure protocol]

## Findings

### Critical
1. [Finding] → [Fix] → [Verify]

### High
1. [Finding] → [Fix] → [Verify]

### Medium
1. [Finding] → [Fix] → [Verify]

## Recommendations
1. [What to do first]
2. [What to do next]

## Verification Checklist
- [ ] All critical findings addressed
- [ ] Enforcement level improved
- [ ] Closure protocol covers all 3 levels
- [ ] Truth-gates designed for project risk profile
```
