# User Guide

This guide is for users who want to use skills effectively in daily AI-assisted coding.

## 1) What Skills Do

- Skills give the assistant reusable domain workflows.
- Good skill usage reduces repeated explanations.
- The assistant picks skills based on your request and skill descriptions.

## 2) Install Options

Install one skill:

```bash
npx skills add Alicoder001/agent-skills --skill project-init
```

Install a recommended set interactively:

```bash
node scripts/skills-wizard.js
```

Install from config:

```bash
node scripts/install-from-config.js
```

## 3) First Session Workflow

1. Start with `project-init` for project context setup.
2. Confirm detected stack and only fix wrong assumptions.
3. Let the assistant proceed with inferred answers.
4. Keep requests task-specific and outcome-first.

## 4) Prompt Patterns That Work

Use direct prompts with result target:

- `Set up CONTEXT.md and map required skills for this repo.`
- `Use api-patterns and design REST endpoints for attendance sync.`
- `Refactor this module with solid and testing constraints.`
- `Review this PR with security and errors focus.`

## 5) How To Get Maximum Results

1. Give concrete objective, scope, and constraints.
2. Mention file paths when possible.
3. Ask for verification after edits.
4. Keep one main goal per turn.
5. Reuse stable vocabulary across sessions.

## 6) Local Knowledge Capture

If you want the assistant to save project-specific rules:

- Use `@save-skill`
- Or write `skillga saqla`

The assistant should confirm before persisting local skill content.

## 7) Troubleshooting

- Wrong skill triggered:
- Ask explicitly: `Use <skill-name> for this task.`
- Context looks stale:
- Re-run `project-init` and confirm checklist updates.
- Quality not stable:
- Ask for validation output and failing checks.

## 8) Recommended Daily Flow

1. Start task with a clear objective.
2. Let assistant pick or confirm skill(s).
3. Execute change.
4. Run validation/checks.
5. Close with short summary and next action.
