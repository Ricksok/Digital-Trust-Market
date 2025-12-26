# State Management Strategy for BarterTrade Africa

## Current State Analysis

### What We Have
- ✅ Zustand installed (v4.4.7) - **Not currently used**
- ✅ React Query installed (v3.39.3) - **Not currently used**
- ⚠️ Using `useState` hooks in every component
- ⚠️ Using `localStorage` directly for token management
- ⚠️ No centralized state management
- ⚠️ No server state caching or synchronization

### Current Issues
1. **No global state** - Auth state re-fetched in every component
2. **No caching** - API calls repeated unnecessarily
3. **No optimistic updates** - Poor UX for mutations
4. **No real-time sync** - Data can become stale
5. **Prop drilling** - State passed through multiple components

## Recommended Architecture

### Hybrid Approach: Zustand + React Query (TanStack Query)

**Why this combination?**
- **Zustand**: Perfect for client-side global state (auth, UI, preferences)
- **React Query**: Ideal for server state (API data, caching, synchronization)
- **Together**: Best of both worlds, industry standard pattern

## 1. Zustand for Client State

### Use Cases
- Authentication state (user, token, permissions)
- UI state (modals, sidebars, themes)
- User preferences (filters, view settings)
- Form state (multi-step forms)
- Real-time connection state (WebSocket status)

### Implementation Structure

```
frontend/lib/stores/
├── auth.store.ts          # Authentication state
├── ui.store.ts            # UI state (modals, notifications)
├── preferences.store.ts   # User preferences
└── index.ts              # Store exports
```

## 2. React Query (TanStack Query) for Server State

### Use Cases
- API data fetching and caching
- Automatic refetching and synchronization
- Optimistic updates
- Background updates
- Pagination and infinite queries
- Mutation management

### Implementation Structure

```
frontend/lib/queries/
├── auth.queries.ts        # Auth-related queries
├── projects.queries.ts     # Project queries
├── auctions.queries.ts     # Auction queries
├── guarantees.queries.ts  # Guarantee queries
├── analytics.queries.ts   # Analytics queries
├── regulatory.queries.ts  # RRE queries (future)
├── investor.queries.ts    # IRE queries (future)
└── index.ts              # Query exports
```

## 3. Migration Strategy

### Phase 1: Setup (Week 1)
1. Upgrade React Query to TanStack Query v5
2. Create Zustand stores for auth and UI
3. Set up React Query provider
4. Create query hooks structure

### Phase 2: Auth Migration (Week 1-2)
1. Migrate auth to Zustand store
2. Replace `useAuth` hook with Zustand
3. Update all components to use store
4. Remove duplicate auth logic

### Phase 3: API Data Migration (Week 2-3)
1. Convert API calls to React Query hooks
2. Add caching strategies
3. Implement optimistic updates for mutations
4. Add background refetching

### Phase 4: Advanced Features (Week 3-4)
1. Real-time updates (WebSocket integration)
2. Offline support
3. State persistence
4. Performance optimization

## 4. Implementation Details

### 4.1 Zustand Auth Store

```typescript
// frontend/lib/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      login: async (email, password) => {
        set({ loading: true });
        // Login logic
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
```

### 4.2 React Query Setup

```typescript
// frontend/lib/providers/QueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
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

### 4.3 React Query Hooks Example

```typescript
// frontend/lib/queries/projects.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';

export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsApi.getAll(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    // Optimistic update
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previousProjects = queryClient.getQueryData(['projects']);
      queryClient.setQueryData(['projects'], (old: any) => [...old, newProject]);
      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      queryClient.setQueryData(['projects'], context?.previousProjects);
    },
  });
};
```

## 5. Benefits for BarterTrade Architecture

### 5.1 Multi-Engine Support
- Each engine (RRE, IRE, DTE, etc.) can have dedicated query hooks
- Centralized caching per engine
- Easy to add new engines without refactoring

### 5.2 Real-Time Updates
- React Query background refetching
- WebSocket integration for live updates
- Optimistic updates for better UX

### 5.3 Regulatory & Investor Reporting
- Complex data aggregation handled by React Query
- Caching reduces API calls for reports
- Background sync keeps data fresh

### 5.4 Performance
- Automatic request deduplication
- Smart caching reduces network calls
- Optimistic updates improve perceived performance

## 6. Comparison: Zustand vs Alternatives

| Feature | Zustand | Redux | Jotai | Recoil |
|---------|---------|-------|-------|--------|
| Bundle Size | ✅ Tiny (1KB) | ❌ Large | ✅ Small | ✅ Small |
| Boilerplate | ✅ Minimal | ❌ High | ✅ Minimal | ✅ Minimal |
| Learning Curve | ✅ Easy | ❌ Steep | ✅ Easy | ✅ Easy |
| DevTools | ✅ Good | ✅ Excellent | ⚠️ Basic | ⚠️ Basic |
| TypeScript | ✅ Excellent | ✅ Good | ✅ Good | ✅ Good |
| Performance | ✅ Excellent | ✅ Good | ✅ Excellent | ✅ Good |

**Verdict: Zustand is perfect for this use case**

## 7. React Query vs Alternatives

| Feature | React Query | SWR | Apollo | RTK Query |
|---------|-------------|-----|--------|-----------|
| Caching | ✅ Excellent | ✅ Good | ✅ Good | ✅ Good |
| DevTools | ✅ Excellent | ⚠️ Basic | ✅ Good | ✅ Good |
| Optimistic Updates | ✅ Built-in | ⚠️ Manual | ✅ Built-in | ✅ Built-in |
| Background Sync | ✅ Excellent | ✅ Good | ✅ Good | ✅ Good |
| Bundle Size | ✅ Small | ✅ Tiny | ❌ Large | ⚠️ Medium |
| GraphQL Support | ⚠️ Manual | ⚠️ Manual | ✅ Built-in | ✅ Built-in |

**Verdict: React Query is the best choice for REST APIs**

## 8. Recommended Action Plan

### Immediate (This Week)
1. ✅ **Keep Zustand** - It's perfect for client state
2. ✅ **Upgrade to TanStack Query v5** - Better than React Query v3
3. ✅ **Implement hybrid approach** - Zustand + TanStack Query

### Implementation Order
1. **Auth Store (Zustand)** - Highest priority
2. **Query Provider Setup** - Foundation
3. **Projects Queries** - Most used feature
4. **Auctions Queries** - Real-time critical
5. **Guarantees Queries** - Complex state
6. **Analytics Queries** - Heavy data
7. **RRE/IRE Queries** - When engines are ready

## 9. Code Example: Complete Setup

```typescript
// frontend/lib/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);

// frontend/lib/queries/projects.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
  });
};

// frontend/app/projects/page.tsx
'use client';

import { useProjects } from '@/lib/queries/projects.queries';

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return <ProjectsList projects={projects} />;
}
```

## 10. Conclusion

**Recommendation: Keep Zustand + Add TanStack Query**

- ✅ Zustand is excellent for client state (auth, UI)
- ✅ TanStack Query is perfect for server state (API data)
- ✅ Both are lightweight and performant
- ✅ Industry-standard pattern
- ✅ Perfect for BarterTrade's multi-engine architecture

**No need to replace Zustand** - it's actually one of the best choices for this architecture!



