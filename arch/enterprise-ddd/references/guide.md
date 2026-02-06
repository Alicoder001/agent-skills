# Legacy Detailed Guide

This file preserves the previous detailed version of `SKILL.md` for deep reference.


# Enterprise DDD Architecture

> Domain-Driven Design + Feature-Sliced Design + Microservices

## Architecture Overview

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        APPS LAYER                          â”‚
â”‚    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”‚
â”‚    â”‚   Web   â”‚  â”‚  Admin  â”‚  â”‚ Mobile  â”‚  â”‚  Docs   â”‚     â”‚
â”‚    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
          â”‚            â”‚           â”‚           â”‚
          â–¼            â–¼           â–¼           â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    MODULES LAYER (DDD)                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚
â”‚  â”‚  @user   â”‚ â”‚  @order  â”‚ â”‚ @payment â”‚ â”‚ @catalog â”‚       â”‚
â”‚  â”‚  (FSD)   â”‚ â”‚  (FSD)   â”‚ â”‚  (FSD)   â”‚ â”‚  (FSD)   â”‚       â”‚
â”‚  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚ Events     â”‚ Events    â”‚ Events    â”‚
        â–¼            â–¼           â–¼           â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   SERVICES LAYER (Backend)                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”               â”‚
â”‚  â”‚user-serviceâ”‚ â”‚order-serviceâ”‚ â”‚payment-svc â”‚               â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## Instructions

### 1. Monorepo Structure

```
enterprise-project/
â”œâ”€â”€ apps/                          # Deployable applications
â”‚   â”œâ”€â”€ web/                      # Next.js main app
â”‚   â”œâ”€â”€ admin/                    # Admin dashboard
â”‚   â”œâ”€â”€ mobile/                   # React Native
â”‚   â””â”€â”€ docs/                     # Documentation
â”‚
â”œâ”€â”€ modules/                       # DDD Bounded Contexts
â”‚   â”œâ”€â”€ @user/                    # User domain (FSD inside)
â”‚   â”œâ”€â”€ @order/                   # Order domain (FSD inside)
â”‚   â”œâ”€â”€ @payment/                 # Payment domain (FSD inside)
â”‚   â”œâ”€â”€ @catalog/                 # Catalog domain (FSD inside)
â”‚   â””â”€â”€ @notification/            # Notification domain (FSD inside)
â”‚
â”œâ”€â”€ packages/                      # Shared infrastructure
â”‚   â”œâ”€â”€ ui/                       # Design system
â”‚   â”œâ”€â”€ config/                   # Shared configs
â”‚   â”œâ”€â”€ utils/                    # Common utilities
â”‚   â”œâ”€â”€ types/                    # Shared types
â”‚   â””â”€â”€ api-client/               # API client factory
â”‚
â”œâ”€â”€ services/                      # Backend microservices
â”‚   â”œâ”€â”€ api-gateway/              # API Gateway
â”‚   â”œâ”€â”€ user-service/             # User microservice
â”‚   â”œâ”€â”€ order-service/            # Order microservice
â”‚   â””â”€â”€ shared/                   # Shared service libs
â”‚
â”œâ”€â”€ infrastructure/                # DevOps
â”‚   â”œâ”€â”€ docker/
â”‚   â””â”€â”€ k8s/
â”‚
â”œâ”€â”€ turbo.json
â”œâ”€â”€ pnpm-workspace.yaml
â””â”€â”€ package.json
```

### 2. Module Structure (FSD per Domain)

```
modules/@user/
â”œâ”€â”€ entities/                      # Domain entities
â”‚   â”œâ”€â”€ user/
â”‚   â”‚   â”œâ”€â”€ model/
â”‚   â”‚   â”‚   â”œâ”€â”€ user.types.ts     # User interface
â”‚   â”‚   â”‚   â”œâ”€â”€ user.schema.ts    # Zod schema
â”‚   â”‚   â”‚   â””â”€â”€ user.store.ts     # Entity store
â”‚   â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”‚   â”œâ”€â”€ user.api.ts       # API calls
â”‚   â”‚   â”‚   â””â”€â”€ user.queries.ts   # React Query hooks
â”‚   â”‚   â””â”€â”€ ui/
â”‚   â”‚       â”œâ”€â”€ UserCard.tsx
â”‚   â”‚       â””â”€â”€ UserAvatar.tsx
â”‚   â””â”€â”€ session/
â”‚       â”œâ”€â”€ model/
â”‚       â”œâ”€â”€ api/
â”‚       â””â”€â”€ ui/
â”‚
â”œâ”€â”€ features/                      # Use cases
â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”œâ”€â”€ model/
â”‚   â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ ui/
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginForm.tsx
â”‚   â”‚   â”‚   â””â”€â”€ RegisterForm.tsx
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”œâ”€â”€ profile/
â”‚   â””â”€â”€ settings/
â”‚
â”œâ”€â”€ widgets/                       # Composite UI blocks
â”‚   â”œâ”€â”€ user-header/
â”‚   â”‚   â”œâ”€â”€ UserHeader.tsx
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â””â”€â”€ user-sidebar/
â”‚
â”œâ”€â”€ shared/                        # Module-specific shared
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â””â”€â”€ client.ts             # Module API client
â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â””â”€â”€ permissions.ts        # Permission helpers
â”‚   â”œâ”€â”€ config/
â”‚   â”‚   â””â”€â”€ routes.ts             # Module routes
â”‚   â””â”€â”€ events/
â”‚       â””â”€â”€ user.events.ts        # Domain events
â”‚
â”œâ”€â”€ index.ts                       # Public API
â””â”€â”€ package.json
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
// âŒ FORBIDDEN: Direct cross-module imports
import { Order } from '@order/entities'; // NO!

// âœ… ALLOWED: Event-based communication
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
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ domain/                    # Domain Layer (Pure)
â”‚   â”‚   â”œâ”€â”€ entities/
â”‚   â”‚   â”‚   â””â”€â”€ User.ts           # User aggregate root
â”‚   â”‚   â”œâ”€â”€ value-objects/
â”‚   â”‚   â”‚   â”œâ”€â”€ Email.ts
â”‚   â”‚   â”‚   â””â”€â”€ Password.ts
â”‚   â”‚   â”œâ”€â”€ events/
â”‚   â”‚   â”‚   â”œâ”€â”€ UserCreated.ts
â”‚   â”‚   â”‚   â””â”€â”€ UserUpdated.ts
â”‚   â”‚   â””â”€â”€ repositories/
â”‚   â”‚       â””â”€â”€ IUserRepository.ts # Interface only
â”‚   â”‚
â”‚   â”œâ”€â”€ application/               # Application Layer
â”‚   â”‚   â”œâ”€â”€ commands/
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateUser.ts
â”‚   â”‚   â”‚   â””â”€â”€ UpdateUser.ts
â”‚   â”‚   â”œâ”€â”€ queries/
â”‚   â”‚   â”‚   â”œâ”€â”€ GetUser.ts
â”‚   â”‚   â”‚   â””â”€â”€ ListUsers.ts
â”‚   â”‚   â””â”€â”€ services/
â”‚   â”‚       â””â”€â”€ AuthService.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ infrastructure/            # Infrastructure Layer
â”‚   â”‚   â”œâ”€â”€ persistence/
â”‚   â”‚   â”‚   â”œâ”€â”€ UserRepository.ts # Implementation
â”‚   â”‚   â”‚   â””â”€â”€ prisma/
â”‚   â”‚   â”œâ”€â”€ messaging/
â”‚   â”‚   â”‚   â””â”€â”€ RabbitMQPublisher.ts
â”‚   â”‚   â””â”€â”€ external/
â”‚   â”‚       â””â”€â”€ StripeClient.ts
â”‚   â”‚
â”‚   â””â”€â”€ presentation/              # Presentation Layer
â”‚       â”œâ”€â”€ controllers/
â”‚       â”‚   â””â”€â”€ UserController.ts
â”‚       â”œâ”€â”€ dtos/
â”‚       â”‚   â”œâ”€â”€ CreateUserDto.ts
â”‚       â”‚   â””â”€â”€ UserResponseDto.ts
â”‚       â””â”€â”€ mappers/
â”‚           â””â”€â”€ UserMapper.ts
â”‚
â”œâ”€â”€ prisma/
â”‚   â””â”€â”€ schema.prisma
â”œâ”€â”€ Dockerfile
â””â”€â”€ package.json
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚           Database per Service              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ user-service     â†’ PostgreSQL (users)       â”‚
â”‚ order-service    â†’ PostgreSQL (orders)      â”‚
â”‚ payment-service  â†’ PostgreSQL (payments)    â”‚
â”‚ catalog-service  â†’ PostgreSQL (products)    â”‚
â”‚ notification-svc â†’ MongoDB (notifications)  â”‚
â”‚ analytics-svc    â†’ ClickHouse (events)      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

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



