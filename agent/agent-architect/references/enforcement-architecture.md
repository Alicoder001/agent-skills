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
| Phase entry verification | Layer 0 (check-phase-entry.mjs) | Must block at script level — prompt alone fails |
| Status advancement to CLOSED/VERIFIED | Layer 0 (check-status-advance.mjs via PreToolUse) | Agent cannot self-certify closure |
| Module responsibility rules | Layer 1 (AGENTS.md) | Read every session, guides behavior |
| Phase-specific DO/DON'T rules | Layer 2 (README) | Scoped to current work |
| How to design prompts | Layer 3 (skill) | On-demand knowledge |
| API spec, design mockups | Layer 4 (docs) | Reference only |

**Critical Rule:** If a rule appears ONLY in Layer 1-4 and can be checked by a script/hook/linter, it is NOT enforced — it is only documented. This distinction must be explicit in every architecture.

## 2. Progressive Disclosure

### Layer 1: CLAUDE.md (target < 100 lines, optimal ~72 lines / ~1,900 tokens)

Include only:
- Stack overview (5-10 lines)
- Key commands (5-10 lines)
- Hard rules — max 15, each verifiable (15-20 lines)
- Session protocol (5-7 lines)
- Verification summary (5 lines)
- References to deeper docs/skills (5 lines)

**Anti-pattern:** CLAUDE.md > 100 lines. Move details to AGENTS.md, phase READMEs, skills, or docs.

**CLAUDE.md vs AGENTS.md overlap:** Never duplicate rules across both files. CLAUDE.md holds project-wide hard rules. AGENTS.md holds workflow, roles, and gates. If a rule appears in both, remove it from the lower-priority file (keep in CLAUDE.md, reference from AGENTS.md).

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

### PreToolUse — Block Premature Status Advancement

Fires before every `Write` or `Edit` tool call. Reads tool input from stdin (JSON). Blocks if agent attempts to write `CLOSED` status without truth-gates passing.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/check-status-advance.mjs"
          }
        ]
      }
    ]
  }
}
```

**Effect:** If `check-status-advance.mjs` exits 1, the Write/Edit is cancelled and the agent sees the error message. The agent cannot write `CLOSED` to any planning or memory file unless truth-gates pass.

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

### Bootstrap Checklist — What Must Exist Before Any Execution

When bootstrapping a project, verify ALL of these are present. Missing any = `partially enforced` at best.

```
scripts/
  check-phase-entry.mjs      ← entry gate — universal (Node.js)
  check-status-advance.mjs   ← CLOSED write blocker — Claude Code only (PreToolUse)
  check-truth-gates.mjs      ← forbidden pattern scan — universal (Node.js)
  check-session-state.mjs    ← memory file validator — universal (Node.js)
  plan-phase.sh              ← planning lockdown — universal (post-flight + --allowedTools for Claude)
  execute-phase.sh           ← execution gate — universal (entry gate before any AI starts)
  audit-phase.sh             ← closure gate — universal (truth-gates before CLOSED)

.claude/settings.json        ← PreToolUse + PreCompact + SessionEnd hooks (Claude Code only)
package.json                 ← plan:phase, exec:phase, audit:phase, check:* scripts
_memory/progress.md          ← ≤ 40 lines
_memory/todo.md              ← ≤ 20 lines
docs/SPEC.md                 ← Tier 1 discovery output
_planning/roadmap.md         ← Tier 2 strategic skeleton
```

**Codex projects:** `.claude/settings.json` hooks are optional. Enforce `audit:phase` as mandatory closure workflow in `AGENTS.md` iron laws instead.

**Bootstrap command — agent installs everything:**

```
bootstrap mode: "Set up enforcement layer for [project]"
→ Agent creates all 6 scripts + settings.json + package.json entries
→ No manual file creation needed after bootstrap
```

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
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/check-status-advance.mjs"
          }
        ]
      }
    ],
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

**Full enforcement coverage — Claude Code vs Codex:**

| Trigger | Script | Claude Code | Codex |
|---------|--------|------------|-------|
| `pnpm exec:phase N [ai]` | execute-phase.sh → check-phase-entry.mjs | ✅ Blocked | ✅ Blocked |
| `pnpm plan:phase N [ai]` | plan-phase.sh → post-flight git diff | ✅ Tool-locked + post-flight | ✅ Post-flight only |
| `pnpm audit:phase N [ai]` | audit-phase.sh → check-truth-gates.mjs | ✅ Required | ✅ Required |
| `PHASE_ENTRY_CHECKS` empty (phase > 1) | check-phase-entry.mjs exit(1) | ✅ Blocked | ✅ Blocked |
| `PreToolUse` (Write\|Edit) | check-status-advance.mjs | ✅ Auto hook | ❌ No hook system |
| `PreCompact` | check-session-state.mjs | ✅ Auto hook | ❌ Manual |
| `SessionEnd` | check-session-state.mjs | ✅ Auto hook | ❌ Manual |

**Codex gap:** No PreToolUse hook → agent CAN write CLOSED without `audit-phase.sh` if called directly. Mitigation: enforce `audit:phase` as the only permitted closure workflow in AGENTS.md.

**Enforcement classification:**

| Setup | Claude Code | Codex |
|-------|------------|-------|
| All scripts + hooks + shell scripts | `fully enforced` | `partially enforced` |
| Scripts + shell scripts, no hooks | `partially enforced` | `partially enforced` |
| Scripts only, no shell scripts | `partially enforced` | `partially enforced` |
| Prompt instructions only | `documented only` | `documented only` |

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

| File | Target Lines | Approx Tokens | Loaded When | Purpose |
|------|-------------|--------------|-------------|---------|
| CLAUDE.md | 60-100 (~72 optimal) | ~1,900 | Every message | High signal only |
| AGENTS.md | 80-150 | ~3,500 | Every message (if in session protocol) | Workflow + roles + gates |
| Skill description | 1-3 lines | ~50 per skill | Every message | Progressive disclosure index |
| Skill full content | 50-500 | varies | On invocation only | On-demand knowledge |
| Phase README | 60-120 | ~2,500 | At phase start | Scoped phase guidance |
| Subphase README | 40-80 | ~1,500 | At subphase start | Task scope + exit criteria |
| progress.md | ≤ 40 | ~800 | Session start | Current state only |
| todo.md | ≤ 20 | ~400 | Session start | Active queue only |
| HANDOFF.md | 30-50 | ~1,000 | Session start | Session bridge only |

**Token economics:**
- A CLAUDE.md of 1,200 lines (~42,000 tokens) costs ~42K tokens on EVERY message, even trivial ones.
- A CLAUDE.md of 72 lines (~1,900 tokens) benefits from **prompt caching** — Anthropic caches repeated system prompt content, reducing cost by up to 90% on subsequent messages.
- Skills NOT invoked cost ~50 tokens each (description only). A 500-line skill not needed today = 0 wasted tokens.
- MCP servers add tool definitions to context even when idle. Each inactive MCP server wastes tokens on every message. Prefer CLI tools when available.

## 9. Phase Entry Protocol

The entry gate is the single most important blocker for preventing false foundations. It runs before Phase N execution begins and verifies Phase N-1's exit criteria against actual code — not roadmap claims.

### check-phase-entry.mjs Skeleton

```javascript
// scripts/check-phase-entry.mjs
// Usage: node scripts/check-phase-entry.mjs --phase=N
// Exits 0 = PASS (Phase N may begin). Exits 1 = BLOCK (Phase N-1 not verified).

import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const phaseArg = process.argv.find(a => a.startsWith('--phase='));
if (!phaseArg) { console.error('Usage: node check-phase-entry.mjs --phase=N'); process.exit(1); }

const phase = parseInt(phaseArg.split('=')[1]);
const prevPhase = phase - 1;

// ============================================================
// PROJECT-SPECIFIC: Define entry checks per phase transition.
// Each check must map directly to the previous phase's exit criteria.
// Use grep (expectEmpty) or ls (expectNonEmpty) — deterministic only.
// ============================================================
const PHASE_ENTRY_CHECKS = {
  // Example — customize per project:
  // 3: [
  //   { description: 'No demo data in product pages',
  //     command: 'grep -rl "demo-data" apps/web/src/pages/',
  //     expectEmpty: true },
  //   { description: 'Auth endpoints exist',
  //     command: 'ls apps/backend/src/modules/auth/interfaces/auth.controller.ts',
  //     expectNonEmpty: true },
  // ],
};
// ============================================================

const checks = PHASE_ENTRY_CHECKS[phase];
if (!checks || checks.length === 0) {
  // Phase 1 has no predecessor — allow by default.
  if (phase <= 1) {
    console.log('ENTRY GATE: Phase 1 — no predecessor. PASS.');
    process.exit(0);
  }
  // Phase 2+ MUST have checks. No checks = BLOCKED. This is not optional.
  console.error(`\n╔══════════════════════════════════════════════════╗`);
  console.error(`║  ENTRY GATE BLOCKED — Phase ${phase} checks not defined`);
  console.error(`╚══════════════════════════════════════════════════╝`);
  console.error(`  PHASE_ENTRY_CHECKS[${phase}] is empty.`);
  console.error(`  You MUST define entry checks during Phase ${prevPhase} documentation (Tier 3).`);
  console.error(`  Add checks to scripts/check-phase-entry.mjs before Phase ${phase} begins.\n`);
  process.exit(1);
}

const failures = [];
for (const check of checks) {
  try {
    const result = execSync(check.command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    if (check.expectEmpty && result.length > 0) {
      failures.push(`FAIL [${check.description}]:\n    Expected empty. Found:\n    ${result.split('\n').slice(0, 5).join('\n    ')}`);
    } else if (check.expectNonEmpty && result.length === 0) {
      failures.push(`FAIL [${check.description}]: Expected output, got empty.`);
    }
  } catch {
    // grep exits 1 when nothing found — that is a PASS for expectEmpty
    if (!check.expectEmpty) {
      failures.push(`FAIL [${check.description}]: Command failed or not found.`);
    }
  }
}

if (failures.length > 0) {
  console.error(`\n╔══════════════════════════════════════════════════╗`);
  console.error(`║  ENTRY GATE FAILED — Phase ${prevPhase} exit criteria NOT met`);
  console.error(`╚══════════════════════════════════════════════════╝`);
  failures.forEach(f => console.error(`\n  ${f}`));
  console.error(`\n  ▶ Fix Phase ${prevPhase} violations before Phase ${phase} begins.\n`);
  process.exit(1);
}

console.log(`ENTRY GATE PASSED — Phase ${prevPhase} verified. Phase ${phase} may begin.`);
```

### Wiring Entry Gate — Shell Scripts (Mandatory)

Do not call `check-phase-entry.mjs` manually. Wire it into execution scripts so it cannot be skipped:

**`scripts/plan-phase.sh`** — Planning lockdown. Universal: works for Claude Code and Codex.

```bash
#!/usr/bin/env bash
# Usage: ./scripts/plan-phase.sh N [claude|codex]
# Tier 3: Plan ONE phase with tool lockdown. Post-flight validates no source code written.
set -e
PHASE=${1:?Usage: plan-phase.sh N [claude|codex]}
AI=${2:-claude}
PROMPT="PLANNING MODE — Phase $PHASE only.
Write: _planning/phase-$PHASE/README.md and subphase READMEs.
MANDATORY: Update PHASE_ENTRY_CHECKS[$((PHASE+1))] in scripts/check-phase-entry.mjs.
Do NOT write source code. Do NOT plan Phase $((PHASE+1)) or beyond."

echo "Planning Phase $PHASE (AI: $AI) — lockdown active"

case "$AI" in
  claude)
    claude --allowedTools "Read,Write,Glob,Grep" --system "$PROMPT" \
      "Plan Phase $PHASE per _planning/roadmap.md."
    ;;
  codex)
    # Codex has no --allowedTools → use post-flight validation instead
    codex "$PROMPT Plan Phase $PHASE per _planning/roadmap.md."
    ;;
  *)
    echo "Unknown AI: $AI. Use 'claude' or 'codex'"; exit 1
    ;;
esac

# POST-FLIGHT: detect source code written during planning (universal)
VIOLATIONS=$(git diff --name-only HEAD 2>/dev/null \
  | grep -vE "\.(md)$|check-phase-entry\.mjs$" | wc -l | tr -d ' ')
if [ "$VIOLATIONS" -gt 0 ]; then
  echo "╔══════════════════════════════════════════════════╗"
  echo "║  PLANNING VIOLATION — source code was modified  ║"
  echo "╚══════════════════════════════════════════════════╝"
  git diff --name-only HEAD | grep -vE "\.(md)$|check-phase-entry\.mjs$"
  echo "Reverting violations..."
  git diff --name-only HEAD \
    | grep -vE "\.(md)$|check-phase-entry\.mjs$" \
    | xargs git checkout HEAD -- 2>/dev/null || true
  exit 1
fi
echo "Planning session CLEAN — only .md files written."
```

**`scripts/execute-phase.sh`** — Entry gate + execution. Universal.

```bash
#!/usr/bin/env bash
# Usage: ./scripts/execute-phase.sh N [claude|codex]
# Entry gate runs first. If it exits 1, AI never opens.
set -e
PHASE=${1:?Usage: execute-phase.sh N [claude|codex]}
AI=${2:-claude}

echo "Running entry gate for Phase $PHASE..."
node scripts/check-phase-entry.mjs --phase=$PHASE
echo "Entry gate PASSED. Starting Phase $PHASE execution (AI: $AI)."

PROMPT="Execute Phase $PHASE per _planning/phase-$PHASE/README.md.
Read _memory/progress.md first. Run self-check after each task."

case "$AI" in
  claude) claude "$PROMPT" ;;
  codex)  codex  "$PROMPT" ;;
  *)      echo "Unknown AI: $AI"; exit 1 ;;
esac

node scripts/check-session-state.mjs
```

**`scripts/audit-phase.sh`** — Explicit closure gate. **Required for Codex** (replaces PreToolUse hook). Also useful for Claude.

```bash
#!/usr/bin/env bash
# Usage: ./scripts/audit-phase.sh N [claude|codex]
# Runs truth-gates, then starts adversarial audit session.
# CLOSED status MUST NOT be written before this script passes.
# For Codex: this is the ONLY closure blocker (no PreToolUse hook).
# For Claude: supplements the PreToolUse hook.
set -e
PHASE=${1:?Usage: audit-phase.sh N [claude|codex]}
AI=${2:-claude}

echo "Running truth-gates for Phase $PHASE closure..."
node scripts/check-truth-gates.mjs
echo "Truth-gates PASSED. Starting adversarial audit."

PROMPT="Run adversarial closure audit for Phase $PHASE.
Truth-gates have passed externally. Now perform:
1. Adversarial self-audit — assume every claim is false until proven
2. Roadmap-code alignment check
3. Status documents match repo truth
Mark CLOSED only if ALL checks pass with evidence."

case "$AI" in
  claude) claude "$PROMPT" ;;
  codex)  codex  "$PROMPT" ;;
  *)      echo "Unknown AI: $AI"; exit 1 ;;
esac
```

Add to `package.json`:
```json
{
  "scripts": {
    "check:phase-entry": "node scripts/check-phase-entry.mjs",
    "plan:phase":        "bash scripts/plan-phase.sh",
    "exec:phase":        "bash scripts/execute-phase.sh",
    "audit:phase":       "bash scripts/audit-phase.sh"
  }
}
```

Usage:
```bash
# Claude Code
pnpm plan:phase 3           # Plan Phase 3 (tool-locked)
pnpm exec:phase 3           # Execute Phase 3 (entry gate first)
pnpm audit:phase 3          # Close Phase 3 (truth-gates first)

# Codex
pnpm plan:phase 3 codex     # Plan Phase 3 (post-flight validated)
pnpm exec:phase 3 codex     # Execute Phase 3 (entry gate first)
pnpm audit:phase 3 codex    # Close Phase 3 (truth-gates first)
```

---

## 10. Status Advancement Blocking

Blocks the agent from writing `CLOSED` status to any planning or memory file unless truth-gates pass. Implemented as a `PreToolUse` hook that intercepts every `Write` and `Edit` call.

### check-status-advance.mjs Skeleton

```javascript
// scripts/check-status-advance.mjs
// Called by PreToolUse hook on Write|Edit.
// Reads tool input JSON from stdin. Exits 1 to block if premature CLOSED detected.

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

let input = '';
try { input = readFileSync(0, 'utf8'); } catch { process.exit(0); }

let toolInput;
try { toolInput = JSON.parse(input); } catch { process.exit(0); }

const content  = String(toolInput.content || toolInput.new_string || '');
const filePath = String(toolInput.file_path || '');

// Only guard planning and memory files
const isStatusFile = /(_planning[\\/]|_memory[\\/]|HANDOFF\.md|roadmap\.md|progress\.md)/.test(filePath);
if (!isStatusFile) process.exit(0);

// Detect CLOSED being written
const attemptsClosed = /\|\s*CLOSED\b|\bStatus:\s*CLOSED\b|\bCLOSED\b/.test(content);
if (!attemptsClosed) process.exit(0);

// CLOSED requires truth-gates to pass
try {
  execSync('node scripts/check-truth-gates.mjs', { stdio: 'pipe' });
} catch {
  console.error('\n╔══════════════════════════════════════════════════╗');
  console.error('║  WRITE BLOCKED — Cannot mark CLOSED               ');
  console.error('╚══════════════════════════════════════════════════╝');
  console.error('  Truth-gate check failed. Fix violations first:');
  console.error('  node scripts/check-truth-gates.mjs\n');
  process.exit(1);
}

process.exit(0);
```

### What This Prevents

| Scenario | Without hook | With hook |
|----------|-------------|-----------|
| Agent writes `CLOSED` after implementation only | Allowed — silent false closure | BLOCKED — truth-gates must pass |
| Agent writes `CLOSED` with violations present | Allowed | BLOCKED with violation list |
| Agent writes `CLOSED` with all gates passing | Allowed | Allowed |
| Agent writes `IMPLEMENTED` or `VERIFIED` | Allowed | Allowed (not blocked — weaker claims) |

**Note on VERIFIED:** For maximum strictness, add a similar check for `VERIFIED` that runs the subphase-specific truth-gate scan. Tune per project risk profile.

---

## 11. Automation Classification

Use these exact labels in all assessments:

| Label | Meaning | Evidence Required |
|-------|---------|------------------|
| `documented only` | Prompt/readme instructions exist, no deterministic check | Only prose rules found |
| `partially enforced` | Some hooks/scripts exist, but gaps remain | Some Layer 0, missing coverage |
| `fully enforced` | Deterministic checks verify the critical workflow | Layer 0 covers all critical rules |

Do not label a system "automatic" unless it is at least `partially enforced`.
Reserve "reliable automation" for `fully enforced`.
