# Legacy Detailed Guide

This file preserves the previous detailed version of `SKILL.md` for deep reference.


# Enterprise DDD Architecture

> Domain-Driven Design + Feature-Sliced Design + Microservices

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        APPS LAYER                          │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│    │   Web   │  │  Admin  │  │ Mobile  │  │  Docs   │     │
│    └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘     │
└─────────┼────────────┼───────────┼───────────┼────────────┘
          │            │           │           │
          ▼            ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────┐
│                    MODULES LAYER (DDD)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  @user   │ │  @order  │ │ @payment │ │ @catalog │       │
│  │  (FSD)   │ │  (FSD)   │ │  (FSD)   │ │  (FSD)   │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
└───────┼────────────┼───────────┼───────────┼───────────────┘
        │ Events     │ Events    │ Events    │
        ▼            ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICES LAYER (Backend)                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │user-service│ │order-service│ │payment-svc │               │
│  └────────────┘ └────────────┘ └────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## Instructions

### 1. Monorepo Structure

```
enterprise-project/
├── apps/                          # Deployable applications
│   ├── web/                      # Next.js main app
│   ├── admin/                    # Admin dashboard
│   ├── mobile/                   # React Native
│   └── docs/                     # Documentation
│
├── modules/                       # DDD Bounded Contexts
│   ├── @user/                    # User domain (FSD inside)
│   ├── @order/                   # Order domain (FSD inside)
│   ├── @payment/                 # Payment domain (FSD inside)
│   ├── @catalog/                 # Catalog domain (FSD inside)
│   └── @notification/            # Notification domain (FSD inside)
│
├── packages/                      # Shared infrastructure
│   ├── ui/                       # Design system
│   ├── config/                   # Shared configs
│   ├── utils/                    # Common utilities
│   ├── types/                    # Shared types
│   └── api-client/               # API client factory
│
├── services/                      # Backend microservices
│   ├── api-gateway/              # API Gateway
│   ├── user-service/             # User microservice
│   ├── order-service/            # Order microservice
│   └── shared/                   # Shared service libs
│
├── infrastructure/                # DevOps
│   ├── docker/
│   └── k8s/
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 2. Module Structure (FSD per Domain)

```
modules/@user/
├── entities/                      # Domain entities
│   ├── user/
│   │   ├── model/
│   │   │   ├── user.types.ts     # User interface
│   │   │   ├── user.schema.ts    # Zod schema
│   │   │   └── user.store.ts     # Entity store
│   │   ├── api/
│   │   │   ├── user.api.ts       # API calls
│   │   │   └── user.queries.ts   # React Query hooks
│   │   └── ui/
│   │       ├── UserCard.tsx
│   │       └── UserAvatar.tsx
│   └── session/
│       ├── model/
│       ├── api/
│       └── ui/
│
├── features/                      # Use cases
│   ├── auth/
│   │   ├── model/
│   │   ├── api/
│   │   ├── ui/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── index.ts
│   ├── profile/
│   └── settings/
│
├── widgets/                       # Composite UI blocks
│   ├── user-header/
│   │   ├── UserHeader.tsx
│   │   └── index.ts
│   └── user-sidebar/
│
├── shared/                        # Module-specific shared
│   ├── api/
│   │   └── client.ts             # Module API client
│   ├── lib/
│   │   └── permissions.ts        # Permission helpers
│   ├── config/
│   │   └── routes.ts             # Module routes
│   └── events/
│       └── user.events.ts        # Domain events
│
├── index.ts                       # Public API
└── package.json
```

### 3. Public API Pattern

```typescript
// modules/@user/index.ts
// ONLY export what other modules can use

// Entities (read-only)
export type { User, UserRole } from './entities/user/model';
export { UserCard, UserAvatar } from './entities/user/ui';

// Features (actions)
export { LoginForm, RegisterForm } from './features/auth';
export { useAuth, useCurrentUser } from './features/auth';

// Widgets (composite)
export { UserHeader } from './widgets/user-header';

// Events (communication)
export { userEvents } from './shared/events';

// DO NOT export internal implementation details
```

### 4. Cross-Module Communication

```typescript
// ❌ FORBIDDEN: Direct cross-module imports
import { Order } from '@order/entities'; // NO!

// ✅ ALLOWED: Event-based communication
// modules/@user/shared/events/user.events.ts
import { createEventBus } from '@repo/utils/events';

export const userEvents = createEventBus<{
  'user:created': { userId: string; email: string };
  'user:updated': { userId: string; changes: Partial<User> };
  'user:deleted': { userId: string };
}>();

// modules/@order/features/create-order/model/useCreateOrder.ts
import { userEvents } from '@user/shared/events';

userEvents.on('user:created', async ({ userId }) => {
  // Create welcome cart for new user
  await createWelcomeCart(userId);
});
```

### 5. Backend Service Structure (DDD)

```
services/user-service/
├── src/
│   ├── domain/                    # Domain Layer (Pure)
│   │   ├── entities/
│   │   │   └── User.ts           # User aggregate root
│   │   ├── value-objects/
│   │   │   ├── Email.ts
│   │   │   └── Password.ts
│   │   ├── events/
│   │   │   ├── UserCreated.ts
│   │   │   └── UserUpdated.ts
│   │   └── repositories/
│   │       └── IUserRepository.ts # Interface only
│   │
│   ├── application/               # Application Layer
│   │   ├── commands/
│   │   │   ├── CreateUser.ts
│   │   │   └── UpdateUser.ts
│   │   ├── queries/
│   │   │   ├── GetUser.ts
│   │   │   └── ListUsers.ts
│   │   └── services/
│   │       └── AuthService.ts
│   │
│   ├── infrastructure/            # Infrastructure Layer
│   │   ├── persistence/
│   │   │   ├── UserRepository.ts # Implementation
│   │   │   └── prisma/
│   │   ├── messaging/
│   │   │   └── RabbitMQPublisher.ts
│   │   └── external/
│   │       └── StripeClient.ts
│   │
│   └── presentation/              # Presentation Layer
│       ├── controllers/
│       │   └── UserController.ts
│       ├── dtos/
│       │   ├── CreateUserDto.ts
│       │   └── UserResponseDto.ts
│       └── mappers/
│           └── UserMapper.ts
│
├── prisma/
│   └── schema.prisma
├── Dockerfile
└── package.json
```

### 6. Event-Driven Architecture

```typescript
// services/shared/events/index.ts
export const DomainEvents = {
  User: {
    Created: 'user.created',
    Updated: 'user.updated',
    Deleted: 'user.deleted',
  },
  Order: {
    Created: 'order.created',
    Completed: 'order.completed',
    Cancelled: 'order.cancelled',
  },
  Payment: {
    Processed: 'payment.processed',
    Failed: 'payment.failed',
  },
} as const;

// services/user-service/src/application/commands/CreateUser.ts
import { EventPublisher } from '@services/shared/messaging';

export class CreateUserHandler {
  constructor(
    private userRepo: IUserRepository,
    private eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const user = User.create(command);
    await this.userRepo.save(user);

    // Publish domain event
    await this.eventPublisher.publish(DomainEvents.User.Created, {
      userId: user.id,
      email: user.email.value,
      createdAt: new Date(),
    });

    return user;
  }
}
```

### 7. Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "modules/*"
  - "packages/*"
  - "services/*"
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 8. Import Rules

```typescript
// eslint-plugin-import rules
const importRules = {
  // Apps can import from modules and packages
  'apps/*': ['modules/*', 'packages/*'],
  
  // Modules can import from packages, NOT from other modules
  'modules/*': ['packages/*', '@repo/*'],
  
  // FSD layer rules within module
  'entities': ['shared'],
  'features': ['entities', 'shared'],
  'widgets': ['features', 'entities', 'shared'],
  
  // Services can import from shared only
  'services/*': ['services/shared'],
};
```

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@order/*', '@payment/*', '@catalog/*'],
            message: 'Cross-module imports forbidden. Use events.',
          },
        ],
      },
    ],
  },
};
```

### 9. Code Generator Commands

```bash
# Create new domain module
pnpm generate:module @inventory

# Create new feature in module
pnpm generate:feature @user/password-reset

# Create new entity
pnpm generate:entity @order/order-item

# Create new backend service
pnpm generate:service inventory-service
```

### 10. Database Strategy

```
┌─────────────────────────────────────────────┐
│           Database per Service              │
├─────────────────────────────────────────────┤
│ user-service     → PostgreSQL (users)       │
│ order-service    → PostgreSQL (orders)      │
│ payment-service  → PostgreSQL (payments)    │
│ catalog-service  → PostgreSQL (products)    │
│ notification-svc → MongoDB (notifications)  │
│ analytics-svc    → ClickHouse (events)      │
└─────────────────────────────────────────────┘

Communication: Events via RabbitMQ/Kafka
```

## Decision Matrix

| Decision | Choice | Reason |
|----------|--------|--------|
| Monorepo Tool | Turborepo | Speed, caching |
| Package Manager | pnpm | Disk space, speed |
| Frontend | Next.js 14+ | RSC, performance |
| State (Server) | TanStack Query | Caching, sync |
| State (Client) | Zustand | Simplicity |
| Backend | NestJS | DDD support |
| Database | PostgreSQL | ACID, reliability |
| Events | RabbitMQ | Reliability |
| API Gateway | Kong/NestJS | Flexibility |
| Auth | Keycloak | Enterprise ready |

## Quick Start

```bash
# Clone template
npx degit Alicoder001/enterprise-template my-project

# Install dependencies
cd my-project && pnpm install

# Start development
pnpm dev
```

## References

- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Turborepo](https://turbo.build/repo)
- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)



