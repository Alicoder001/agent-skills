# Agent Skills — Project Rules

## Hard Rules

### New skill checklist — ALL required before commit:
1. `SKILL.md` created in correct category folder
2. `agents/openai.yaml` created
3. `bundles.json` updated (skill added to category + relevant bundles)
4. **`INSTALL.md` updated** — install command added under correct section

Skipping `INSTALL.md` update is not allowed. No exceptions.

## Commands

```bash
# Validate all skills
node scripts/validate-skills.js

# Quality gate (run before every commit)
node scripts/quality-gate.js

# Generate openai.yaml files
node scripts/generate-openai-yaml.js
```

## Structure

```
<category>/<skill-name>/
  SKILL.md          ← required
  agents/
    openai.yaml     ← required
  references/       ← optional
```

Categories: `agent/`, `core/`, `frontend/`, `backend/`, `arch/`, `infra/`, `perf/`
