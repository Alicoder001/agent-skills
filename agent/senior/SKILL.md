---
name: senior
description: Senior frontend developer practices including code quality, accessibility, responsive design, and UI consistency. Use when reviewing code, implementing UX patterns, or ensuring production-quality output.
---

# Senior Frontend Practices

> Production-quality frontend development standards.

## Instructions

### 1. Accessibility (a11y)

```tsx
// ✅ Semantic HTML
<button type="button">Click me</button>  // Not <div onClick>
<nav aria-label="Main navigation">...</nav>
<main role="main">...</main>

// ✅ ARIA labels
<button aria-label="Close modal" onClick={onClose}>
  <XIcon />
</button>

// ✅ Focus management
<input 
  ref={inputRef}
  aria-describedby="email-error"
/>
{error && <span id="email-error" role="alert">{error}</span>}
```

### 2. Keyboard Navigation

```tsx
// ✅ Handle keyboard events
function Modal({ onClose }) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
}

// ✅ Focus trap
<FocusTrap>
  <div role="dialog" aria-modal="true">
    ...
  </div>
</FocusTrap>
```

### 3. Responsive Design

```css
/* Mobile-first approach */
.container {
  padding: 1rem;
}

@media (min-width: 640px) {
  .container { padding: 1.5rem; }
}

@media (min-width: 1024px) {
  .container { padding: 2rem; }
}
```

```tsx
// ✅ Responsive component
function ResponsiveLayout() {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <aside className="w-full lg:w-64">Sidebar</aside>
      <main className="flex-1">Content</main>
    </div>
  );
}
```

### 4. Micro-interactions

```tsx
// ✅ Button feedback
<button className="
  transition-all duration-200
  hover:scale-105 hover:shadow-lg
  active:scale-95
  focus:ring-2 focus:ring-offset-2
">
  Submit
</button>

// ✅ Loading states
<button disabled={isLoading}>
  {isLoading ? <Spinner /> : 'Submit'}
</button>
```

### 5. Error States

```tsx
// ✅ User-friendly error messages
function FormField({ error }) {
  return (
    <div>
      <input 
        aria-invalid={!!error}
        className={error ? 'border-red-500' : 'border-gray-300'}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

### 6. Code Quality Checklist

Before submitting code:

- [ ] Semantic HTML used
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Mobile responsive
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Focus visible on all interactive elements
- [ ] Color contrast passes WCAG AA

## References

- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility](https://react.dev/reference/react-dom/components#form-components)
