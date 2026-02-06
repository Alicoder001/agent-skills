---
name: tools
description: Dynamic tool selection, composition, and error handling patterns for AI agents. Use to efficiently leverage available tools and handle failures gracefully.
---

# Tool Usage Patterns

> Efficient and reliable tool utilization.

## Instructions

### 1. Tool Selection Matrix

Choose the right tool for the task:

| Task | Primary Tool | Fallback |
|------|-------------|----------|
| Find file by name | `find_by_name` | `list_dir` recursive |
| Search code content | `grep_search` | `view_file` + manual |
| Understand structure | `view_file_outline` | `view_file` |
| Read specific lines | `view_file` with range | Full file view |
| Edit single location | `replace_file_content` | `write_to_file` |
| Edit multiple locations | `multi_replace_file_content` | Sequential edits |
| Run command | `run_command` | N/A |
| Web research | `search_web` | `read_url_content` |

### 2. Tool Composition

Chain tools efficiently:

```markdown
## File Exploration Flow

1. `list_dir` → Get directory structure
2. `find_by_name` → Locate specific files
3. `view_file_outline` → Understand file structure
4. `view_file` → Read specific sections
5. `view_code_item` → Deep dive into functions

## Edit Flow

1. `view_file` → Understand current state
2. Plan changes mentally
3. `replace_file_content` → Make targeted edit
4. `run_command` → Verify (lint, test)
```

### 3. Parallel Tool Calls

When tasks are independent:

```markdown
## ✅ Parallelize

- Reading multiple files
- Searching different directories
- Independent file edits

## ❌ Don't Parallelize

- Edit then verify (sequential)
- Read then edit same file
- Dependent operations
```

### 4. Error Handling

```markdown
## Tool Failure Response

| Error Type | Response |
|------------|----------|
| File not found | Check path, try alternatives |
| Command failed | Read error, fix issue, retry |
| Edit conflict | Re-read file, adjust edit |
| Timeout | Retry with smaller scope |
| Permission denied | Notify user |

## Retry Strategy

1. First failure: Retry immediately
2. Second failure: Analyze error
3. Third failure: Try alternative
4. Still failing: Ask user
```

### 5. Tool Efficiency

```markdown
## Minimize Tool Calls

❌ Inefficient:
- Read file A
- Read file B
- Read file C
(3 sequential calls)

✅ Efficient:
- Read files A, B, C in parallel
(1 parallel call)

## Read Minimum Necessary

❌ Wasteful:
- View entire 1000-line file

✅ Efficient:
- View outline first
- Read only relevant sections (lines 50-100)
```

### 6. Command Execution

```markdown
## Safe Command Practices

### Always Safe (SafeToAutoRun: true)
- `ls`, `dir`, `cat`, `type`
- `npm run lint`, `npm run build`
- `git status`, `git diff`
- `npx tsc --noEmit`

### Requires Approval (SafeToAutoRun: false)
- `npm install <package>`
- `rm`, `del`, file deletion
- `git push`, `git commit`
- Database operations
- Network requests
```

### 7. Search Strategies

```markdown
## Finding Code

1. **Know exact text**: `grep_search` with literal
2. **Know pattern**: `grep_search` with regex
3. **Know file name**: `find_by_name`
4. **Exploring**: `list_dir` + `view_file_outline`

## Search Tips

- Use specific queries
- Include file type filters
- Start broad, narrow down
- Check multiple directories
```

### 8. File Edit Best Practices

```markdown
## Edit Accuracy

1. Always view file first
2. Use exact line numbers
3. Copy target content precisely
4. Verify edit was successful

## Common Edit Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Target not found | Wrong content | Re-copy from file |
| Multiple matches | Content not unique | Use line range |
| Wrong location | Stale line numbers | Re-read file |
```

## References

- [Tool Learning with LLMs](https://arxiv.org/abs/2304.08354)
- [ReAct: Synergizing Reasoning and Acting](https://arxiv.org/abs/2210.03629)
