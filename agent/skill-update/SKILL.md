---
name: skill-update
description: Skill creation, versioning, and update management. Use when adding a new skill or updating an existing skill, following semantic versioning, maintaining catalogs, and keeping repository-wide skill metadata consistent.
---

# Skill Update Manager

> Skill creation, versioning, and repository consistency management.

## Semantic Versioning

| Change Type | Version | Example |
|-------------|---------|---------|
| Breaking changes | MAJOR | 1.0.0 -> 2.0.0 |
| New features | MINOR | 1.0.0 -> 1.1.0 |
| Bug fixes | PATCH | 1.0.0 -> 1.0.1 |

### When to Increment

```
MAJOR (2.0.0):
- Skill name changes
- Moving a skill between categories or folders
- Core rules fundamentally change

MINOR (1.1.0):
- New rules added
- New sections added
- New examples or references added

PATCH (1.0.1):
- Typos and wording fixes
- Example tweaks
- Reference updates
```

## Update Process

### Step 1: Read Current Skill

```bash
C:\Users\coder\agent-skills\<category>\<skill>\SKILL.md
```

### Step 2: Validate Format

| Check | Status |
|-------|--------|
| YAML frontmatter includes only `name` and `description` | OK / Fix |
| `name` matches the skill folder | OK / Fix |
| Description includes trigger/when-to-use info | OK / Fix |
| Examples still accurate | OK / Fix |

### Step 3: Apply Changes

1. Update content
2. If significant, bump repo version in `bundles.json`
3. Update README changelog entry

### Step 4: Verify Consistency

- Search for old skill names in docs
- Ensure install commands use `--skill <name>`
- Confirm bundles and tables still match actual folders

## New Skill and Catalog Impact Checklist

When adding a new skill, do not stop at creating the skill folder.

Check and update the relevant repository surfaces:
- `agent/<skill>/SKILL.md`
- `agent/<skill>/agents/openai.yaml`
- `README.md` skill counts and install examples if affected
- `bundles.json` if the skill belongs in a bundle or category
- `agent/find-skills/SKILL.md` if the discoverability table should include it
- `evals/trigger-evals.json` if trigger coverage needs to be extended
- Any repo-specific config or catalog files that drive installation or discovery

If one of these does not need a change, say so explicitly in the final summary.

## Final Response Contract

When finishing a skill creation or skill update task, always end with:

1. The install command for the new or updated skill
2. The list of repository files and catalogs that were updated
3. The list of repository files and catalogs that were checked but did not need changes
4. Any follow-up update the maintainer may still want to make

Use concrete paths and commands. Do not end with a vague "done" summary.

## Skill Format Standard

```yaml
---
name: skill-name              # lowercase, hyphens only
description: Description...   # include when-to-use triggers
---

# Skill Title

> Brief description

## Instructions
...

## References
...
```

## Example Update

**User request:** "Add Suspense pattern to react-core"

**Response:**
```
Change type: New feature (MINOR)
Update repo version: 2.0.0 -> 2.1.0

Changes:
1. Add Suspense section
2. Add Error Boundary examples
3. Update README changelog

Install:
- npx skills add Alicoder001/agent-skills --skill react-core

Updated catalogs:
- README.md
- agent/find-skills/SKILL.md
- bundles.json

Checked, no change needed:
- evals/trigger-evals.json
```

## References

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
