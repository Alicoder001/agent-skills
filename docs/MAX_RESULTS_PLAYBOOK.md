# Max Results Playbook

This playbook focuses on quality, speed, and consistency.

## 1) Session Start Template

Use this at the beginning of a task:

```text
Goal: <what must be true at the end>
Scope: <files/modules in scope>
Constraints: <stack, style, deadline, risks>
Quality bar: <tests, lint, security, perf>
```

## 2) Prompt Quality Rules

1. Ask for outcome, not implementation details first.
2. Add acceptance criteria.
3. Add non-goals to prevent drift.
4. Ask for verification commands after changes.

## 3) Skill Selection Rules

- Broad architecture task:
- use `enterprise-ddd`, `monorepo`, `solid`
- API and data flow:
- use `api-patterns`, `validation`, `security`, `errors`
- Frontend feature:
- use `react-core` + framework skill + state skill
- Operational quality:
- use `testing`, `git`, `workflow`

## 4) Multi-Turn Execution Pattern

1. Plan and confirm assumptions.
2. Implement smallest safe increment.
3. Validate and report factual results.
4. Continue with next increment.

## 5) Review Pattern

When asking for review, request this order:

1. Critical bugs and regressions.
2. Security and data integrity risks.
3. Missing tests and edge cases.
4. Secondary improvements.

## 6) Definition Of Done

A task is done when:

- Required behavior works.
- Validation scripts pass.
- Trigger/eval checks are green where relevant.
- Output summary includes changed files and checks run.

## 7) Anti-Patterns To Avoid

- Very broad requests without acceptance criteria.
- Asking multiple unrelated goals in one turn.
- Skipping validation after structural changes.
- Keeping local conventions only in chat memory.
