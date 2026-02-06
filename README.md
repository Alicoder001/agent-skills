# Agent Skills

Professional AI agent skills for modern software development.

[![skills.sh](https://img.shields.io/badge/skills.sh-published-blue)](https://skills.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Skills: 34](https://img.shields.io/badge/skills-34-green)](.)

## Quick Start

```bash
# Install one skill
npx skills add Alicoder001/agent-skills --skill project-init

# Or install everything
npx skills add Alicoder001/agent-skills
```

## Guides

- User guide: `docs/USER_GUIDE.md`
- Max results playbook: `docs/MAX_RESULTS_PLAYBOOK.md`
- Maintainer guide: `docs/MAINTAINER_GUIDE.md`

### Interactive Wizard

```bash
node scripts/skills-wizard.js
```

### Config-Based Install

```bash
node scripts/install-from-config.js
```

Edit `skills.config.json` to choose variants and defaults.

## Metadata

Generate UI metadata for all skills:

```bash
node scripts/generate-openai-yaml.js
```

Each skill should contain:
- `SKILL.md`
- `agents/openai.yaml`

## Validation

```bash
node scripts/validate-skills.js
```

This validates:
- Frontmatter rules (`name`, `description` only)
- Skill file line and word budgets
- `agents/openai.yaml` presence and required keys
- Catalog drift (`bundles.json` vs `skills.config.json` vs wizard)
- Agent table drift in `agent/find-skills/SKILL.md`
- Local markdown link integrity inside `SKILL.md` and `references/*.md`
- Encoding issues (NUL bytes)

## Trigger Evals

Run trigger precision checks:

```bash
node scripts/run-trigger-evals.js
```

Eval dataset:
- `evals/trigger-evals.json`

## One-Command Quality Gate

```bash
node scripts/quality-gate.js
```

## Git Hooks

Install local git hooks:

```bash
node scripts/setup-hooks.js
```

Hooks run on commit/push:
- `scripts/generate-openai-yaml.js`
- `scripts/validate-skills.js`
- `scripts/run-trigger-evals.js`

## Bundles

### Essential (5 skills)

```bash
npx skills add Alicoder001/agent-skills --skill global-config
npx skills add Alicoder001/agent-skills --skill typescript
npx skills add Alicoder001/agent-skills --skill git
npx skills add Alicoder001/agent-skills --skill solid
npx skills add Alicoder001/agent-skills --skill errors
```

### Frontend Developer

Start with Essential, then add:

```bash
npx skills add Alicoder001/agent-skills --skill validation
npx skills add Alicoder001/agent-skills --skill react-core
npx skills add Alicoder001/agent-skills --skill react-nextjs
npx skills add Alicoder001/agent-skills --skill react-vite
npx skills add Alicoder001/agent-skills --skill react-hooks
npx skills add Alicoder001/agent-skills --skill design
npx skills add Alicoder001/agent-skills --skill tailwind
npx skills add Alicoder001/agent-skills --skill shadcn
npx skills add Alicoder001/agent-skills --skill forms
npx skills add Alicoder001/agent-skills --skill tanstack-query
npx skills add Alicoder001/agent-skills --skill zustand
npx skills add Alicoder001/agent-skills --skill redux
npx skills add Alicoder001/agent-skills --skill javascript
```

### Backend Developer

Start with Essential, then add:

```bash
npx skills add Alicoder001/agent-skills --skill validation
npx skills add Alicoder001/agent-skills --skill security
npx skills add Alicoder001/agent-skills --skill testing
npx skills add Alicoder001/agent-skills --skill nestjs
npx skills add Alicoder001/agent-skills --skill api-patterns
```

### Full Stack

Start with Frontend + Backend, then add:

```bash
npx skills add Alicoder001/agent-skills --skill monorepo
npx skills add Alicoder001/agent-skills --skill workflow
```

### Enterprise

Start with Full Stack, then add:

```bash
npx skills add Alicoder001/agent-skills --skill enterprise-ddd
npx skills add Alicoder001/agent-skills --skill senior
```

### Agent Professional

Start with Essential + Agent bundle:

```bash
npx skills add Alicoder001/agent-skills --skill reasoning
npx skills add Alicoder001/agent-skills --skill planning
npx skills add Alicoder001/agent-skills --skill memory
npx skills add Alicoder001/agent-skills --skill tools
npx skills add Alicoder001/agent-skills --skill collaboration
npx skills add Alicoder001/agent-skills --skill workflow
npx skills add Alicoder001/agent-skills --skill senior
npx skills add Alicoder001/agent-skills --skill find-skills
npx skills add Alicoder001/agent-skills --skill project-init
npx skills add Alicoder001/agent-skills --skill skill-update
```

## Categories

- `core`: global-config, typescript, git, solid, errors, validation, security, testing
- `frontend`: react-core, react-nextjs, react-vite, react-hooks, design, tailwind, shadcn, forms, tanstack-query, zustand, redux
- `backend`: nestjs, api-patterns
- `arch`: enterprise-ddd
- `infra`: monorepo
- `perf`: javascript
- `agent`: reasoning, planning, memory, tools, collaboration, senior, workflow, find-skills, project-init, skill-update

## Repository Health

- Skills: 34
- Categories: 7
- CI: `.github/workflows/skills-ci.yml`

## License

MIT - [Alicoder001](https://github.com/Alicoder001)
