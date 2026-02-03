---
name: react-core
description: React component patterns, hooks, state management, and Vercel-inspired performance optimizations. Use for React development including re-render prevention, derived state, functional setState, and component composition.
---

# React Core Best Practices

> Comprehensive React development guidelines with Vercel optimization patterns.

## Instructions

### 1. Component Structure

```tsx
// ✅ Max 200 lines per component
// ✅ Single responsibility

interface Props {
  user: User;
  onUpdate: (user: User) => void;
}

export function UserCard({ user, onUpdate }: Props) {
  // Hooks first
  const [isEditing, setIsEditing] = useState(false);
  
  // Derived state (no useState needed)
  const fullName = `${user.firstName} ${user.lastName}`;
  
  // Event handlers
  const handleSubmit = () => { ... };
  
  // Render
  return (
    <div className="user-card">
      <h2>{fullName}</h2>
      ...
    </div>
  );
}
```

### 2. Derived State (No useState)

```tsx
// ❌ Bad - unnecessary state
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Good - derived state
const fullName = `${firstName} ${lastName}`;

// ✅ Good - expensive computation
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);
```

### 3. Functional setState

```tsx
// ❌ Bad - stale state risk
setCount(count + 1);

// ✅ Good - always current
setCount(prev => prev + 1);

// ✅ Good - object state
setUser(prev => ({ ...prev, name: newName }));
```

### 4. Prevent Unnecessary Re-renders

```tsx
// ✅ Primitive dependencies for useMemo
const result = useMemo(() => {
  return expensiveCalculation(id);
}, [id]); // id is primitive

// ✅ Stable callback references
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ✅ Memoize child components
const MemoizedChild = memo(ChildComponent);
```

### 5. Event Handlers

```tsx
// ❌ Bad - creates new function each render
<button onClick={() => handleClick(item.id)}>

// ✅ Good - stable reference with data attribute
<button data-id={item.id} onClick={handleClick}>

function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  const id = e.currentTarget.dataset.id;
  // ...
}
```

### 6. Custom Hooks

```tsx
// ✅ Extract reusable logic
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

### 7. Props Pattern

```tsx
// ✅ Destructure props
function Button({ children, variant = 'primary', ...rest }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} {...rest}>
      {children}
    </button>
  );
}
```

### 8. Loading & Error States

```tsx
function UserProfile({ userId }: Props) {
  const { data, isLoading, error } = useUser(userId);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <NotFound />;

  return <UserCard user={data} />;
}
```

## References

- [React Documentation](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
