---
name: shadcn
description: shadcn/ui component library patterns including installation, customization, theming, and composition. Use when building UI with shadcn/ui components in React/Next.js applications.
---

# shadcn/ui Patterns

> Use shadcn as a composable source-based UI system, not as a black-box dependency.

## Use This Skill When

- Setting up shadcn in Next.js or Vite.
- Building reusable UI primitives and design tokens.
- Implementing form/dialog/table workflows with shadcn components.

## Core Contract

1. Install only needed components.
2. Centralize theme tokens and semantic styles.
3. Prefer composition patterns over one-off custom wrappers.
4. Keep accessibility defaults intact.
5. Keep business logic outside UI primitives.

## Implementation Workflow

### 1) Setup

- Initialize shadcn for current framework.
- Confirm alias paths and `components.json` are correct.
- Add baseline primitives (`button`, `input`, `dialog`, etc.).

### 2) Theme and Tokens

- Define CSS variables for colors, spacing, radii.
- Keep component variants consistent with product semantics.
- Avoid ad-hoc style drift across screens.

### 3) Composition Patterns

- Forms: RHF + Zod + shadcn form primitives.
- Dialogs: controlled open state + focus management.
- Tables: server-state aware loading, empty, error states.
- Toasts: normalize success/error messaging patterns.

### 4) Quality Gate

- Keyboard support and focus traps verified.
- ARIA labels and roles validated.
- Component API consistency across feature modules.

## Output Requirements for Agent

- Installation and config steps.
- Token/theming plan.
- Component composition pattern.
- Accessibility and testing checklist.

## References

- Full setup commands, component examples, and advanced snippets: `references/guide.md`
