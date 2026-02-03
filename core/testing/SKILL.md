---
name: testing
description: Testing strategies for JavaScript applications. Use when writing unit tests, integration tests, or setting up testing infrastructure. Covers Vitest, Jest, React Testing Library, and mocking patterns.
---

# Testing Best Practices

> Comprehensive testing strategies for modern JavaScript.

## Instructions

### 1. Test Structure (AAA Pattern)

```typescript
describe('UserService', () => {
  it('should create a new user', async () => {
    // Arrange
    const userData = { name: 'John', email: 'john@example.com' };
    
    // Act
    const user = await userService.create(userData);
    
    // Assert
    expect(user.id).toBeDefined();
    expect(user.name).toBe('John');
  });
});
```

### 2. Component Testing (React Testing Library)

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  it('should submit form with credentials', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

### 3. Mocking

```typescript
// Mock module
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'John' })
}));

// Mock function
const mockFn = vi.fn();
mockFn.mockReturnValue('result');
mockFn.mockResolvedValue({ data: [] });

// Spy on method
const spy = vi.spyOn(console, 'log');
```

### 4. Async Testing

```typescript
it('should fetch user data', async () => {
  const user = await fetchUser(1);
  
  expect(user).toEqual({
    id: 1,
    name: 'John'
  });
});

it('should handle errors', async () => {
  await expect(fetchUser(-1)).rejects.toThrow('User not found');
});
```

### 5. Test Coverage

```json
// vitest.config.ts
{
  "test": {
    "coverage": {
      "provider": "v8",
      "reporter": ["text", "html"],
      "exclude": ["node_modules/", "test/"]
    }
  }
}
```

### 6. Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### 7. Test Naming Conventions

```typescript
// ✅ Good - descriptive
it('should return empty array when no users found')
it('should throw ValidationError when email is invalid')

// ❌ Bad - vague
it('works correctly')
it('handles error')
```

## References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
