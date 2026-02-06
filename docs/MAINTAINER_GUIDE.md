# Maintainer Guide

This guide is for skill repository maintainers.

## 1) Repository Health Workflow

Run full quality gate:

```bash
node scripts/quality-gate.js
```

Manual sequence:

```bash
node scripts/generate-openai-yaml.js
node scripts/validate-skills.js
node scripts/run-trigger-evals.js
```

## 2) Updating Existing Skills

1. Edit `SKILL.md` with concise workflow-first content.
2. Move heavy examples into `references/` when needed.
3. Keep frontmatter limited to `name` and `description`.
4. Re-generate metadata.
5. Run full quality gate.

## 3) Metadata Rules

- Each skill must include `agents/openai.yaml`.
- Metadata is generated from `SKILL.md`.
- Do not hand-edit metadata unless you re-run generator.

## 4) Trigger Quality

- Keep descriptions explicit and scoped.
- Avoid overlapping vague descriptions across skills.
- Extend `evals/trigger-evals.json` when adding or changing triggers.

## 5) CI and Hooks

CI file:
- `.github/workflows/skills-ci.yml`

Local hooks:

```bash
node scripts/setup-hooks.js
```

Hooks run generation, validation, and trigger evals before commit/push.

## 6) Release Process

1. Ensure branch is up to date.
2. Run `node scripts/quality-gate.js`.
3. Review `git diff --stat` and changed skill scope.
4. Commit with conventional message.
5. Push and confirm CI green.

## 7) Governance Rules

- Keep large skills reference-driven.
- Avoid duplicate catalogs across files.
- Keep bundle/config/wizard outputs consistent.
- Treat failing evals as release blockers.
