---
name: forms
description: React form handling with React Hook Form and Zod validation. Use when building complex forms, multi-step forms, or any form with validation requirements.
---

# React Form Patterns

> Standard stack: React Hook Form + Zod. Keep schema and UI behavior aligned.

## Use This Skill When

- Building new forms with validation.
- Refactoring unstable form state logic.
- Implementing multi-step, dynamic, or async-validated forms.

## Core Contract

1. Keep schema as source of truth (Zod).
2. Use typed form values inferred from schema.
3. Validate at client and server boundaries.
4. Separate field rendering from submit side effects.
5. Keep form loading/error states explicit.

## Implementation Workflow

### 1) Baseline Form

- Create Zod schema.
- Infer TypeScript type from schema.
- Initialize RHF with resolver and defaults.
- Render errors at field-level and form-level.

### 2) Advanced Patterns

- Multi-step:
- separate per-step schema
- aggregate typed payload
- explicit next/back transitions
- Dynamic arrays:
- use `useFieldArray`
- stable keys and predictable remove/append behavior
- Async validation:
- debounce expensive validators
- isolate network errors from sync schema errors
- File upload:
- validate type/size before submit
- keep upload state and retry logic explicit

### 3) Server Integration

- Normalize server errors to RHF-compatible shape.
- Keep optimistic UI optional and reversible.
- For server actions, preserve idempotent submit behavior.

## UX and Accessibility Checklist

- Keyboard navigation works for all inputs.
- Error messages are specific and linked to fields.
- Submit button state reflects in-flight operations.
- Success and failure feedback is visible and deterministic.

## Output Requirements for Agent

- Schema design.
- Form state model.
- Validation and submission flow.
- Error handling and accessibility checks.

## References

- Detailed code templates (basic, shadcn, multi-step, arrays, uploads): `references/guide.md`
