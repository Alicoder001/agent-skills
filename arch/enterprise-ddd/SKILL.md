---
name: enterprise-ddd
description: Enterprise-grade architecture combining DDD bounded contexts with Feature-Sliced Design. Use for large-scale monorepos with multiple domains, microservices, event-driven communication, and scalable frontend modules.
---

# Enterprise DDD Architecture

> Use this skill for large systems where domain boundaries, ownership, and cross-team scaling matter more than local feature speed.

## Use This Skill When

- Multiple domains must be isolated (billing, auth, catalog, attendance, etc.).
- You need explicit module contracts across frontend and backend.
- Event-driven integration is preferred over direct cross-module coupling.
- Monorepo governance and release boundaries are required.

## Do Not Use When

- Project is small or single-team with low domain complexity.
- A simple layered architecture is sufficient.

## Architecture Contract

1. Model domain boundaries first (bounded contexts).
2. Keep each domain module internally FSD-like and externally contract-based.
3. Forbid deep cross-module imports.
4. Communicate across modules/services with events or stable APIs.
5. Maintain separate deployable apps and services.
6. Keep shared packages infra-only (`types`, `ui`, `config`, `utils`).

## Recommended Structure

```text
apps/              deployable apps
modules/           bounded-context frontend modules
services/          bounded-context backend services
packages/          shared infrastructure packages
infrastructure/    deployment and platform resources
```

## Implementation Workflow

### 1) Domain Modeling

- List domains and ownership.
- Define each module public API (`index.ts`) first.
- Define event contracts and versioning.

### 2) Module Design (Frontend)

- Apply FSD inside a domain module:
- `entities`, `features`, `widgets`, `shared`.
- Export only public APIs from module root.
- Keep domain state and API hooks inside module boundary.

### 3) Service Design (Backend)

- Keep domain, application, infrastructure, presentation separation.
- Use repository interfaces in domain layer and implementations in infrastructure.
- Emit domain events for cross-service actions.

### 4) Integration Rules

- Allowed: event bus, API client boundary, declared public exports.
- Forbidden: direct imports into other module internals.
- Enforce via lint/import rules in CI.

### 5) Rollout

- Start with 1-2 high-value domains.
- Add generators/templates for new domain modules.
- Track coupling metrics and refactor hot paths.

## Decision Matrix

- Need independent scaling per domain: choose DDD.
- Need strict module ownership across teams: choose DDD.
- Need fastest delivery on small scope: avoid DDD for now.

## Output Requirements for Agent

- Propose target domain map.
- Provide import/event boundary rules.
- Provide migration plan from current structure to target structure.
- Include risks, rollback plan, and testing strategy.

## References

- Detailed structures, code templates, generators, and examples: `references/guide.md`
