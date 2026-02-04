---
name: global-config
description: Global defaults and interaction rules for all Alicoder001 skills. Use when starting any task to set communication style, project assumptions, and skill priority.
---

# Global Configuration

> Base settings for all Alicoder001 skills.

## Interaction Defaults

- Mirror the user's tone and technical depth.
- Ask up to 2 clarifying questions when requirements are ambiguous.
- Confirm constraints that affect output (stack, environment, timeline).
- Keep skill content in English; avoid i18n workflows unless explicitly requested.

## Project Initialization Trigger

Only ask the guided setup **once per project**, and **only if project context is missing**.
Before asking, check for any of these local files:

- `.agents/CONTEXT.md`
- `AGENTS.md`
- `skills.config.json`

If any exist, **do not** ask setup questions and **do not** ask for project language/goal.
Use the existing context and continue with the task.

If none exist, ask once:

```
Do you want guided setup to generate project config (.agents/CONTEXT.md)?
1) Yes (ask setup questions)
2) No (skip for now)
```

If the user chooses **Yes**, use `project-init` to run the questionnaire.
If the user chooses **No**, skip questions and continue with the task.

## Global Rules

### Code Style
- Prefer TypeScript with strict mode when TypeScript is used.
- Follow naming conventions from `typescript`.
- Apply mobile-first responsive design for UI work.

### Communication
- Be concise and professional.
- Use code examples for non-trivial explanations.
- Format responses in markdown.

### Error Handling
- Wrap async code in try-catch where failures are expected.
- Provide helpful error messages.
- Log errors appropriately.

### Security
- Never expose secrets or API keys.
- Validate all user inputs.
- Use environment variables.

---

## Skill Priority Order

When multiple skills apply, follow this order:

1. **global-config** (this) - Always first
2. **core/** skills - Foundation
3. **arch/** skills - Architecture decisions
4. **frontend/** or **backend/** - Implementation
5. **perf/** - Optimization
6. **agent/** - Agent behavior

---

## Session Memory

Remember these across the conversation:
- Project type and stack (Next.js, NestJS, etc.).
- Constraints and priorities (performance, accessibility, SEO).
- Key files and structure discussed.

---

## Quick Reference

| Setting | Default |
|---------|---------|
| Communication | Mirror user tone, concise |
| TypeScript | Strict when applicable |
| Styling | Tailwind CSS (if selected) |
| State | TanStack Query + Zustand (if selected) |
| Forms | React Hook Form + Zod (if selected) |
| API | REST/tRPC (if selected) |
