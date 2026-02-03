---
name: workflow
description: AI agent operational rules including token discipline, navigation-first approach, and output contracts. Use to ensure efficient and predictable agent behavior during development tasks.
---

# Agent Workflow Rules

> Efficient AI agent operation patterns.

## Instructions

### 1. Hard Ignore Rules

Never modify or include in context:

```
- node_modules/
- dist/
- build/
- .git/
- *.lock files
- Binary files
- Generated files
```

### 2. Navigation-First Workflow

```
1. Understand the request
2. Navigate to relevant files FIRST
3. Read existing code
4. Plan changes
5. Implement
6. Verify
```

### 3. Token Discipline

```
✅ DO:
- Read only necessary files
- Stop when task is complete
- Use targeted searches
- Summarize long outputs

❌ DON'T:
- Read entire codebase
- Include unnecessary context
- Repeat information
- Over-explain simple changes
```

### 4. Output Contract

Always structure responses:

```markdown
## Summary
Brief description of what was done

## Changes
- file1.ts: Added X
- file2.ts: Modified Y

## Next Steps (if applicable)
- Remaining tasks
```

### 5. Backend/Frontend Split

When working on full-stack:

```
1. Identify which layer the change affects
2. Start with the data layer (backend)
3. Then update the presentation layer (frontend)
4. Test integration points
```

### 6. Type Checking

Before completing TypeScript tasks:

```
✅ Run: npx tsc --noEmit
✅ Fix all type errors
✅ Ensure no implicit any
```

### 7. Linting

Before completing tasks:

```
✅ Run: npm run lint
✅ Fix all errors
✅ Fix warnings if quick
```

### 8. File Size Limits

```
Components: Max 200 lines
Utilities: Max 100 lines
Services: Max 300 lines

If larger, split into smaller modules.
```

### 9. Commit Messages

After completing tasks, suggest:

```
feat(scope): add feature description
fix(scope): fix bug description
refactor(scope): improve code structure
```

## References

- [Clean Code](https://www.oreilly.com/library/view/clean-code/9780136083238/)
- [The Pragmatic Programmer](https://pragprog.com/titles/tpp20/)
