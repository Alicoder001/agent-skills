---
name: tanstack-query
description: TanStack Query (React Query) patterns for data fetching, caching, mutations, and optimistic updates. Use when implementing server state management, API caching, or data synchronization in React applications.
---

# TanStack Query Best Practices

> Server state management with automatic caching and synchronization.

## Instructions

### 1. Setup

```tsx
// providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 2. Query Keys Factory

```typescript
// lib/queryKeys.ts
export const queryKeys = {
  users: {
    all: ['users'] as const,
    list: (filters: UserFilters) => [...queryKeys.users.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
  posts: {
    all: ['posts'] as const,
    list: (filters: PostFilters) => [...queryKeys.posts.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.posts.all, 'detail', id] as const,
    byUser: (userId: string) => [...queryKeys.posts.all, 'user', userId] as const,
  },
} as const;
```

### 3. Custom Query Hook

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { userApi } from '@/lib/api';

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters ?? {}),
    queryFn: () => userApi.getAll(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userApi.getById(id),
    enabled: !!id, // Only run when id exists
  });
}
```

### 4. Mutations

```typescript
// hooks/useCreateUser.ts
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => userApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// Usage
function CreateUserForm() {
  const { mutate, isPending } = useCreateUser();

  const handleSubmit = (data: CreateUserDto) => {
    mutate(data, {
      onSuccess: () => toast.success('User created!'),
    });
  };
}
```

### 5. Optimistic Updates

```typescript
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(id) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(queryKeys.users.detail(id));

      // Optimistically update
      queryClient.setQueryData(queryKeys.users.detail(id), (old: User) => ({
        ...old,
        ...data,
      }));

      return { previousUser };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.users.detail(id),
        context?.previousUser
      );
    },
    onSettled: (_, __, { id }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
}
```

### 6. Infinite Query (Pagination)

```typescript
export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.all,
    queryFn: ({ pageParam = 1 }) => postApi.getAll({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
  });
}

// Usage
function PostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts();

  return (
    <>
      {data?.pages.map((page) =>
        page.posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </>
  );
}
```

### 7. Prefetching

```typescript
// Prefetch on hover
function UserLink({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const prefetchUser = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.detail(userId),
      queryFn: () => userApi.getById(userId),
      staleTime: 1000 * 60 * 5,
    });
  };

  return (
    <Link href={`/users/${userId}`} onMouseEnter={prefetchUser}>
      View User
    </Link>
  );
}
```

### 8. Dependent Queries

```typescript
function useUserPosts(userId: string | undefined) {
  const userQuery = useUser(userId!);

  return useQuery({
    queryKey: queryKeys.posts.byUser(userId!),
    queryFn: () => postApi.getByUser(userId!),
    enabled: !!userId && userQuery.isSuccess,
  });
}
```

## Common Patterns

| Pattern | Usage |
|---------|-------|
| `staleTime` | How long data stays fresh |
| `gcTime` | How long unused data stays in cache |
| `enabled` | Conditional fetching |
| `select` | Transform response data |
| `placeholderData` | Show while loading |

## References

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Practical React Query](https://tkdodo.eu/blog/practical-react-query)
