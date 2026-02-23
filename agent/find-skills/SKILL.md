---
name: find-skills
description: Skill discovery and selection utility. Use when you need to find relevant skills from the Alicoder001/agent-skills repository based on project needs and technology stack.
---

# Find Skills

> Discover and install relevant skills for your project.

## Quick Install

All skills:
`npx skills add Alicoder001/agent-skills`

Single skill:
`npx skills add Alicoder001/agent-skills --skill <name>`

## Available Skills

### Core Skills
| Skill | Description | Install |
|-------|-------------|---------|
| global-config | Global defaults and interaction rules | `npx skills add Alicoder001/agent-skills --skill global-config` |
| typescript | TypeScript strict patterns | `npx skills add Alicoder001/agent-skills --skill typescript` |
| git | Conventional commits | `npx skills add Alicoder001/agent-skills --skill git` |
| solid | Clean code principles | `npx skills add Alicoder001/agent-skills --skill solid` |
| errors | Error handling | `npx skills add Alicoder001/agent-skills --skill errors` |
| validation | Zod schemas | `npx skills add Alicoder001/agent-skills --skill validation` |
| security | Security practices | `npx skills add Alicoder001/agent-skills --skill security` |
| testing | Testing strategies | `npx skills add Alicoder001/agent-skills --skill testing` |

### Frontend Skills
| Skill | Description | Install |
|-------|-------------|---------|
| react-core | React patterns | `npx skills add Alicoder001/agent-skills --skill react-core` |
| react-nextjs | Next.js App Router | `npx skills add Alicoder001/agent-skills --skill react-nextjs` |
| react-vite | Vite SPA | `npx skills add Alicoder001/agent-skills --skill react-vite` |
| react-hooks | Custom hooks | `npx skills add Alicoder001/agent-skills --skill react-hooks` |
| design | UI design guidelines | `npx skills add Alicoder001/agent-skills --skill design` |
| tailwind | Tailwind CSS | `npx skills add Alicoder001/agent-skills --skill tailwind` |
| shadcn | shadcn/ui | `npx skills add Alicoder001/agent-skills --skill shadcn` |
| forms | React Hook Form | `npx skills add Alicoder001/agent-skills --skill forms` |
| tanstack-query | Server state | `npx skills add Alicoder001/agent-skills --skill tanstack-query` |
| zustand | Client state | `npx skills add Alicoder001/agent-skills --skill zustand` |
| redux | RTK Query | `npx skills add Alicoder001/agent-skills --skill redux` |

### Backend Skills
| Skill | Description | Install |
|-------|-------------|---------|
| nestjs | NestJS modular | `npx skills add Alicoder001/agent-skills --skill nestjs` |
| api-patterns | REST, GraphQL, WebSocket, tRPC | `npx skills add Alicoder001/agent-skills --skill api-patterns` |

### Architecture Skills
| Skill | Description | Install |
|-------|-------------|---------|
| enterprise-ddd | DDD + FSD + Microservices | `npx skills add Alicoder001/agent-skills --skill enterprise-ddd` |

### Infrastructure Skills
| Skill | Description | Install |
|-------|-------------|---------|
| monorepo | Turborepo + pnpm | `npx skills add Alicoder001/agent-skills --skill monorepo` |

### Performance Skills
| Skill | Description | Install |
|-------|-------------|---------|
| javascript | JS optimizations | `npx skills add Alicoder001/agent-skills --skill javascript` |

### Agent Skills
| Skill | Description | Install |
|-------|-------------|---------|
| reasoning | Chain-of-thought patterns | `npx skills add Alicoder001/agent-skills --skill reasoning` |
| planning | Task decomposition | `npx skills add Alicoder001/agent-skills --skill planning` |
| memory | Context management | `npx skills add Alicoder001/agent-skills --skill memory` |
| tools | Tool usage patterns | `npx skills add Alicoder001/agent-skills --skill tools` |
| collaboration | Multi-agent collaboration | `npx skills add Alicoder001/agent-skills --skill collaboration` |
| senior | Senior practices | `npx skills add Alicoder001/agent-skills --skill senior` |
| workflow | Agent workflow | `npx skills add Alicoder001/agent-skills --skill workflow` |
| notion-ops | Notion control-plane operations | `npx skills add Alicoder001/agent-skills --skill notion-ops` |
| find-skills | Skill discovery | `npx skills add Alicoder001/agent-skills --skill find-skills` |
| project-init | Project wizard | `npx skills add Alicoder001/agent-skills --skill project-init` |
| skill-update | Skill versioning | `npx skills add Alicoder001/agent-skills --skill skill-update` |

## Recommended Bundles

### React + Next.js Project
```bash
npx skills add Alicoder001/agent-skills --skill typescript
npx skills add Alicoder001/agent-skills --skill react-core
npx skills add Alicoder001/agent-skills --skill react-nextjs
npx skills add Alicoder001/agent-skills --skill design
npx skills add Alicoder001/agent-skills --skill tailwind
npx skills add Alicoder001/agent-skills --skill shadcn
```

### Full Stack Project
```bash
npx skills add Alicoder001/agent-skills --skill typescript
npx skills add Alicoder001/agent-skills --skill react-nextjs
npx skills add Alicoder001/agent-skills --skill nestjs
npx skills add Alicoder001/agent-skills --skill api-patterns
npx skills add Alicoder001/agent-skills --skill security
```

### Vite SPA Project
```bash
npx skills add Alicoder001/agent-skills --skill typescript
npx skills add Alicoder001/agent-skills --skill react-core
npx skills add Alicoder001/agent-skills --skill react-vite
npx skills add Alicoder001/agent-skills --skill redux
```

## References

- [skills.sh](https://skills.sh)
- [Agent Skills Specification](https://agentskills.io)
