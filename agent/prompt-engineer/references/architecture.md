# Architecture & Enforcement

## 1. The Enforcement Pyramid

```text
Hooks / scripts / settings   100% deterministic when correctly configured
CLAUDE.md / AGENTS.md        project-wide default behavior
Skills                       on-demand knowledge and templates
Docs                         reference material
```

| Behavior | Correct Level | Why |
|----------|---------------|-----|
| Run formatting after file edits | Hook | deterministic |
| Read progress/todo at session start | CLAUDE.md + optional SessionStart hook | expected every session |
| Preserve state before compaction | PreCompact hook | deterministic |
| Prevent stale handoff claims | SessionEnd/Stop hook or verification script | deterministic |
| How to design prompt files | Skill | on-demand knowledge |

## 2. Progressive Disclosure Stack

### Layer 1: CLAUDE.md

Keep short. Include:

- stack
- commands
- hard rules
- session protocol
- compaction rules
- references to docs/skills

### Layer 2: Docs

Put domain gotchas and implementation details here.

### Layer 3: Skills

Use for design knowledge, audit logic, and reusable templates.

### Layer 4: Hooks / scripts

Use for behavior that must happen consistently.

## 3. Hook Templates

### PreCompact - Preserve Current State

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -NoProfile -Command \"Write-Output '---PROGRESS---'; if (Test-Path _memory/progress.md) { Get-Content _memory/progress.md -TotalCount 40 }; Write-Output '---TODO---'; if (Test-Path _memory/todo.md) { Get-Content _memory/todo.md -TotalCount 40 }; Write-Output '---HANDOFF---'; if (Test-Path HANDOFF.md) { Get-Content HANDOFF.md -TotalCount 60 }\""
          }
        ]
      }
    ]
  }
}
```

### SessionStart - Re-inject Lightweight Context

Use only concise context, not whole documents.

### Stop / SessionEnd - Validate Session State

Use a script that checks whether `progress.md`, `todo.md`, and `HANDOFF.md` are in sync with the current task before declaring automation reliable.

## 4. Verification Script Pattern

Recommended files:

- `scripts/check-session-state.mjs`
- `.claude/settings.json`
- `package.json`

Recommended command:

```json
{
  "scripts": {
    "check:session-state": "node scripts/check-session-state.mjs"
  }
}
```

The script should verify:

- required files exist
- current task appears consistently
- `HANDOFF.md` is not stale relative to progress/todo
- required sections are present

## 5. AGENTS.md as SSOT

Use `AGENTS.md` as the cross-tool single source of truth for workflow and responsibilities. Keep CLAUDE.md shorter and point to AGENTS.md where appropriate.

## 6. Token Budget

| File | Max Lines | Goal |
|------|-----------|------|
| CLAUDE.md | 60-100 | high signal only |
| AGENTS.md | 80-120 | workflow + roles |
| Skill file | 50-120 | compact but actionable |
| progress.md | ~40 | current reality |
| todo.md | <= 20 lines preferred | active queue |

## 7. Bootstrap Templates

### CLAUDE.md Session Protocol

```markdown
## Session Protocol
1. START: Read _memory/progress.md + _memory/todo.md if they exist
2. DURING: Update todo.md at meaningful milestones
3. AT 50% CONTEXT: Refresh HANDOFF.md then /compact
4. END: Update progress.md + todo.md and verify session state
```

### .claude/settings.json Template

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

## 8. Automation Classification

Use these exact labels in audits:

- `documented only`: prompt instructions exist, no deterministic verification
- `partially enforced`: some hooks/scripts exist, but gaps remain
- `fully enforced`: hooks/scripts/settings verify the critical workflow

Do not label a system "automatic" unless it is at least `partially enforced`, and reserve "reliable automation" for `fully enforced`.
