---
name: tailwind
description: Tailwind CSS v4+ best practices including new CSS-first configuration, theme customization, responsive design, dark mode, and performance optimization. Use for modern utility-first CSS styling.
---

# Tailwind CSS v4+ Best Practices

> Modern utility-first CSS with Tailwind v4.

## What's New in v4

| Feature | v3 | v4 |
|---------|----|----|
| Config | `tailwind.config.js` | CSS-first (`@theme`) |
| Colors | JS object | CSS variables |
| Performance | JIT | Oxide engine (faster) |
| Import | `@tailwind base` | `@import "tailwindcss"` |

## Instructions

### 1. Installation (v4)

```bash
npm install tailwindcss@next @tailwindcss/vite
```

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

### 2. CSS-First Configuration

```css
/* app.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-accent: #f59e0b;
  
  /* Custom colors */
  --color-brand-50: #eff6ff;
  --color-brand-500: #3b82f6;
  --color-brand-900: #1e3a8a;
  
  /* Fonts */
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Spacing */
  --spacing-18: 4.5rem;
  --spacing-128: 32rem;
  
  /* Border radius */
  --radius-4xl: 2rem;
  
  /* Shadows */
  --shadow-soft: 0 2px 15px -3px rgba(0, 0, 0, 0.07);
  
  /* Animations */
  --animate-fade-in: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 3. Dark Mode

```css
/* CSS-first dark mode */
@import "tailwindcss";

@theme {
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
}

@theme dark {
  --color-background: #0a0a0a;
  --color-foreground: #fafafa;
}
```

```tsx
// Usage in components
<div className="bg-background text-foreground">
  <h1 className="text-foreground">Hello</h1>
</div>

// Toggle dark mode
<html className="dark">
```

### 4. Responsive Design (Mobile-First)

```tsx
<div className="
  p-4          /* mobile: 16px */
  md:p-6       /* tablet: 24px */
  lg:p-8       /* desktop: 32px */
  xl:p-12      /* large: 48px */
">
  <h1 className="
    text-xl      /* mobile */
    md:text-2xl  /* tablet */
    lg:text-4xl  /* desktop */
  ">
    Responsive Title
  </h1>
</div>
```

### 5. Container Queries (v4)

```tsx
<div className="@container">
  <div className="@md:flex @lg:grid @lg:grid-cols-3">
    {/* Responds to container, not viewport */}
  </div>
</div>
```

### 6. Component Patterns

```tsx
// Button variants
const buttonVariants = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-secondary text-white hover:bg-secondary/90",
  outline: "border border-primary text-primary hover:bg-primary/10",
  ghost: "hover:bg-accent/10 text-foreground",
};

// Card pattern
<div className="
  rounded-xl 
  bg-white dark:bg-gray-900 
  shadow-soft 
  p-6 
  border border-gray-200 dark:border-gray-800
">
  {children}
</div>

// Input pattern
<input className="
  w-full 
  rounded-lg 
  border border-gray-300 dark:border-gray-700
  bg-white dark:bg-gray-900
  px-4 py-2
  text-foreground
  placeholder:text-gray-400
  focus:outline-none focus:ring-2 focus:ring-primary/50
  disabled:opacity-50 disabled:cursor-not-allowed
" />
```

### 7. Animation Utilities

```tsx
// Hover effects
<button className="
  transition-all duration-200
  hover:scale-105 
  hover:shadow-lg
  active:scale-95
">
  Click me
</button>

// Entrance animation
<div className="animate-fade-in">
  Content appears with animation
</div>

// Skeleton loading
<div className="animate-pulse bg-gray-200 rounded h-4 w-full" />
```

### 8. Grid Layouts

```tsx
// Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// Dashboard layout
<div className="grid grid-cols-12 gap-4">
  <aside className="col-span-12 md:col-span-3">Sidebar</aside>
  <main className="col-span-12 md:col-span-9">Content</main>
</div>
```

### 9. Custom Utilities (v4)

```css
@utility glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@utility text-gradient {
  background: linear-gradient(to right, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

```tsx
<div className="glass rounded-xl p-6">
  <h1 className="text-gradient text-4xl font-bold">Gradient Text</h1>
</div>
```

### 10. Performance Tips

```tsx
// ✅ Good - use cn() for conditional classes
import { cn } from '@/lib/utils';

<button className={cn(
  "px-4 py-2 rounded-lg",
  variant === 'primary' && "bg-primary text-white",
  disabled && "opacity-50 cursor-not-allowed"
)}>

// ❌ Bad - template literals with many conditions
<button className={`px-4 py-2 ${variant === 'primary' ? 'bg-primary' : ''}`}>
```

## cn() Utility

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## References

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Tailwind CSS Blog](https://tailwindcss.com/blog)
