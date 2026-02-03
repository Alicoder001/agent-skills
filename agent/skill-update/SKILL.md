---
name: skill-update
description: Skill versioning and update management. Use when updating existing skills, following semantic versioning, and maintaining changelogs.
---

# Skill Update Manager

> Versioning and changelog management for skills.

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
```

## References

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
