# Enforcement Architecture

## 1. The Enforcement Pyramid

```text
Layer 0: Hooks / scripts / settings   → 100% deterministic when configured
Layer 1: CLAUDE.md / AGENTS.md        → project-wide default behavior
Layer 2: Phase / subphase READMEs     → scoped guidance per execution unit
Layer 3: Skills                       → on-demand knowledge and templates
Layer 4: Docs                         → reference material
```

### Placement Rules

| Behavior | Correct Layer | Why |
|----------|--------------|-----|
| Forbidden pattern scan before closure | Layer 0 (script) | Must never be skipped |
| Session state preservation | Layer 0 (hook) | Must fire automatically |
| "No fake data" constraint | Layer 0 (truth-gate) + Layer 1 (reminder) | Script enforces, prompt reminds |
| Architecture import boundaries | Layer 0 (lint rule or script) | Deterministic check |
| Module responsibility rules | Layer 1 (AGENTS.md) | Read every session, guides behavior |
| Phase-specific DO/DON'T rules | Layer 2 (README) | Scoped to current work |
| How to design prompts | Layer 3 (skill) | On-demand knowledge |
| API spec, design mockups | Layer 4 (docs) | Reference only |

**Critical Rule:** If a rule appears ONLY in Layer 1-4 and can be checked by a script/hook/linter, it is NOT enforced — it is only documented. This distinction must be explicit in every architecture.

## 2. Progressive Disclosure

### Layer 1: CLAUDE.md (target < 100 lines)

Include only:
- Stack overview (5-10 lines)
- Key commands (5-10 lines)
- Hard rules — max 15, each verifiable (15-20 lines)
- Session protocol (5-7 lines)
- Verification summary (5 lines)
- References to deeper docs/skills (5 lines)

**Anti-pattern:** CLAUDE.md > 100 lines. Move details to AGENTS.md, phase READMEs, skills, or docs.

### Layer 2: AGENTS.md (target < 150 lines)

Include:
- Project overview (3 lines)
- Iron laws (5-10 rules)
- Agent roles with scope, stack, and rules
- Execution pipeline
- Completion gates
- Decision log

### Layer 2: Phase READMEs (target 60-120 lines each)

Include:
- Phase overview and scope
- Agent Rules: DO list, DON'T list
- Subphase breakdown with dependencies
- Exit criteria with truth-gate definitions
- Verification subphase specification

### Layer 3: Skills

Use for design knowledge, audit logic, reusable templates. Skills are loaded on-demand — they do not consume startup tokens.

### Layer 4: Docs

Domain specs, design mockups, reference implementations. Never inline these into CLAUDE.md — link or summarize.

## 3. Hook Templates

### PreCompact — Preserve Current State

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/check-session-state.mjs --print-context"
          }
        ]
      }
    ]
  }
}
```

### SessionStart — Re-inject Context

Inject only concise state (progress summary, current task, blockers). Never inject whole documents.

### SessionEnd / Stop — Validate Session State

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/check-session-state.mjs"
          }
        ]
      }
    ]
  }
}
```

### Windows Variant (PowerShell)

```json
{
  "type": "command",
  "command": "powershell -NoProfile -Command \"Write-Output '---PROGRESS---'; if (Test-Path _memory/progress.md) { Get-Content _memory/progress.md -TotalCount 40 }; Write-Output '---TODO---'; if (Test-Path _memory/todo.md) { Get-Content _memory/todo.md -TotalCount 20 }; Write-Output '---HANDOFF---'; if (Test-Path HANDOFF.md) { Get-Content HANDOFF.md -TotalCount 50 }\""
}
```

## 4. Truth-Gate Design

A truth-gate is a deterministic check that blocks false closure. Design truth-gates based on the project's specific risk profile — never use a generic template without customization.

### Identification Process

1. List every "NEVER" rule and hard constraint in the project.
2. For each rule, ask: "Can this be checked by searching code, checking imports, or running a script?"
3. If YES → it MUST become a truth-gate in a script at Layer 0.
4. If NO → it stays as prompt-level guidance at Layer 1-2.

### Common Truth-Gate Categories

| Project Risk | What to Scan | Example Pattern |
|-------------|-------------|-----------------|
| Fake/demo data | Active route files for forbidden imports/variables | `demo-data`, `placeholder`, `fallback`, `mock` |
| UI drift | Active pages for local UI forks vs shared package | Import sources not from `packages/ui` |
| Text integrity | Active copy for encoding errors | Mojibake byte sequences, `???`, `â€` |
| Architecture boundaries | Import graph violations | Cross-module or cross-app imports |
| Premature closure | Status files advancing before verification | Status mismatch between roadmap and truth-gate results |
| Security | Source files for exposed secrets | `.env` values, API keys, hardcoded credentials |
| Placeholder content | Active routes for stub text | `TODO`, `FIXME`, `Coming soon`, `Lorem ipsum` |

### Truth-Gate Script Skeleton

```javascript
// scripts/check-truth-gates.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// ============================================================
// PROJECT-SPECIFIC: Define these during architecture phase
// ============================================================
const ACTIVE_ROUTE_DIRS = [
  // e.g., 'apps/web/src/pages', 'apps/web/src/features'
];

const FORBIDDEN_PATTERNS = [
  // e.g., { regex: /demo-data/i, message: 'Forbidden demo-data import' }
];

const REQUIRED_IMPORT_SOURCES = [
  // e.g., { component: 'Button', from: '@project/ui' }
];
// ============================================================

function scanFiles(dir, patterns) { /* recursive scan logic */ }
function checkImportSources(dir, rules) { /* import check logic */ }

const violations = [];
// ... scan and collect violations ...

if (violations.length > 0) {
  console.error(`TRUTH-GATE FAILED: ${violations.length} violation(s)`);
  violations.forEach(v => console.error(`  - ${v.file}: ${v.message}`));
  process.exit(1);
} else {
  console.log('TRUTH-GATE PASSED');
}
```

### Wiring Truth-Gates

Add to `package.json`:
```json
{ "scripts": { "check:truth-gates": "node scripts/check-truth-gates.mjs" } }
```

Add to `.claude/settings.json` as part of closure workflow or SessionEnd hook.

## 5. Status Semantics

NEVER use "DONE" or "COMPLETE" as a single status. Always use:

| Status | Meaning | Required Evidence | Who Sets |
|--------|---------|------------------|----------|
| `NOT STARTED` | No implementation exists | — | Default |
| `IN PROGRESS` | Implementation underway | — | Agent |
| `IMPLEMENTED` | Code exists, lint/typecheck/build pass | Task self-check passed | Agent after task |
| `VERIFIED` | Functional + truth-gate checks pass | Subphase gate checklist | Agent after subphase |
| `CLOSED` | Adversarial audit confirmed, status docs aligned | Phase audit evidence | Agent after phase audit |

### Transition Rules

- `NOT STARTED` → `IN PROGRESS`: Agent begins work.
- `IN PROGRESS` → `IMPLEMENTED`: Task self-check passes (5 adversarial questions answered).
- `IMPLEMENTED` → `VERIFIED`: Subphase verification gate passes (functional + truth-gate).
- `VERIFIED` → `CLOSED`: Phase verification subphase passes (full adversarial audit + roadmap alignment).
- Status documents (roadmap, progress, handoff) update ONLY at `VERIFIED` or `CLOSED` transitions.
- Any failed check: status stays at current level, remediation tasks created.

## 6. AGENTS.md as Workflow SSOT

Use AGENTS.md as the single source of truth for:
- Agent roles and responsibilities per module
- Execution pipeline (phase order)
- Iron laws / completion gates
- Decision log

Keep CLAUDE.md shorter by pointing to AGENTS.md for workflow details.

## 7. Bootstrap Templates

### Minimal CLAUDE.md

```markdown
# [Project Name]

## Stack
[concise stack summary — 5-10 lines]

## Commands
[key dev/build/test commands — 5-10 lines]

## Hard Rules
[max 15 verifiable rules]

## Session Protocol
1. START: Read HANDOFF.md if exists, then _memory/progress.md + _memory/todo.md
2. DURING: Update todo.md at meaningful milestones
3. AT 50% CONTEXT: Refresh HANDOFF.md, then /compact
4. END: Update progress.md + todo.md

## Verification
- Task: Self-check before marking IMPLEMENTED
- Subphase: Gate check before marking VERIFIED
- Phase: Audit subphase before marking CLOSED
- Truth-gates: `pnpm check:truth-gates` before any closure claim

## Key References
- Workflow: AGENTS.md
- Planning: _planning/roadmap.md
- Spec: [link]
```

### settings.json Template

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/check-session-state.mjs --print-context"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/check-session-state.mjs"
          }
        ]
      }
    ]
  }
}
```

### Session State Check Script Skeleton

```javascript
// scripts/check-session-state.mjs
import { existsSync, readFileSync } from 'node:fs';

const REQUIRED = ['_memory/progress.md', '_memory/todo.md'];
const OPTIONAL = ['HANDOFF.md'];

const missing = REQUIRED.filter(f => !existsSync(f));
if (missing.length > 0) {
  console.error(`SESSION STATE ERROR: Missing ${missing.join(', ')}`);
  process.exit(1);
}

if (process.argv.includes('--print-context')) {
  REQUIRED.concat(OPTIONAL.filter(existsSync)).forEach(f => {
    console.log(`--- ${f} ---`);
    console.log(readFileSync(f, 'utf8').split('\n').slice(0, 40).join('\n'));
  });
}
console.log('SESSION STATE OK');
```

## 8. Token Budget

| File | Target Lines | Purpose |
|------|-------------|---------|
| CLAUDE.md | 60-100 | High signal only |
| AGENTS.md | 80-150 | Workflow + roles + gates |
| Phase README | 60-120 | Scoped phase guidance |
| Subphase README | 40-80 | Task scope + exit criteria |
| Skill file | 50-180 | Compact but actionable |
| progress.md | ≤ 40 | Current state only |
| todo.md | ≤ 20 | Active queue only |
| HANDOFF.md | 30-50 | Session bridge only |

## 9. Automation Classification

Use these exact labels in all assessments:

| Label | Meaning | Evidence Required |
|-------|---------|------------------|
| `documented only` | Prompt/readme instructions exist, no deterministic check | Only prose rules found |
| `partially enforced` | Some hooks/scripts exist, but gaps remain | Some Layer 0, missing coverage |
| `fully enforced` | Deterministic checks verify the critical workflow | Layer 0 covers all critical rules |

Do not label a system "automatic" unless it is at least `partially enforced`.
Reserve "reliable automation" for `fully enforced`.
