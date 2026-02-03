---
name: git
description: Conventional Commits standard for consistent commit messages. Use when committing code, reviewing commit history, or setting up git workflows. Includes commit types, scopes, and breaking change format.
---

# Git Conventional Commits

> Standardized commit message format for clean git history.

## Instructions

### 1. Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 2. Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add login form` |
| `fix` | Bug fix | `fix(api): handle null response` |
| `docs` | Documentation | `docs: update README` |
| `style` | Formatting | `style: fix indentation` |
| `refactor` | Code restructure | `refactor(utils): simplify logic` |
| `perf` | Performance | `perf: optimize image loading` |
| `test` | Tests | `test: add unit tests for auth` |
| `build` | Build system | `build: update dependencies` |
| `ci` | CI/CD | `ci: add GitHub Actions` |
| `chore` | Maintenance | `chore: clean up old files` |

### 3. Scope (Optional)

Scope indicates the affected area:

```
feat(auth): add OAuth support
fix(cart): correct total calculation
refactor(api): restructure endpoints
```

### 4. Breaking Changes

```
feat(api)!: change response format

BREAKING CHANGE: API response now uses camelCase keys
```

### 5. Examples

```bash
# ✅ Good
feat(user): add profile picture upload
fix(checkout): resolve payment validation error
docs(api): add authentication endpoints
refactor(components): extract common button styles

# ❌ Bad
update code
fixed bug
WIP
misc changes
```

### 6. Multi-line Commits

```
feat(dashboard): add analytics widget

- Add chart component for daily stats
- Integrate with analytics API
- Add loading skeleton

Closes #123
```

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md)
