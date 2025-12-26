# State Management Implementation Plan

## Overview

Based on the comprehensive E2E state analysis, this document outlines the step-by-step implementation plan for managing all application states using Zustand + TanStack Query.

## Architecture Decision

**Hybrid Approach:**
- **Zustand**: Client-side global state (auth, UI, preferences)
- **TanStack Query**: Server state (API data, caching, synchronization)
- **React Context**: Theme, localization (if needed)
- **useState**: Local component state only

## Implementation Phases

---

## Phase 1: Foundation Setup (Week 1)

### 1.1 Install & Configure Dependencies

```bash
cd frontend
npm install @tanstack/react-query@latest @tanstack/react-query-devtools
npm uninstall react-query  # Remove old version
```

### 1.2 Create Store Structure

```
frontend/lib/
├── stores/
│   ├── auth.store.ts
│   ├── ui.store.ts
│   ├── preferences.store.ts
│   └── index.ts
├── providers/
│   ├── QueryProvider.tsx
│   └── StoreProvider.tsx (if needed)
└── queries/
    ├── auth.queries.ts
    ├── projects.queries.ts
    ├── auctions.queries.ts
    ├── guarantees.queries.ts
    ├── investments.queries.ts
    ├── staking.queries.ts
    ├── governance.queries.ts
    ├── rewards.queries.ts
    ├── trust.queries.ts
    ├── analytics.queries.ts
    └── index.ts
```

### 1.3 Create Query Provider

**File:** `frontend/lib/providers/QueryProvider.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

### 1.4 Create Auth Store

**File:** `frontend/lib/stores/auth.store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  userType: string;
  walletAddress?: string;
  isVerified: boolean;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Auth lifecycle states
  authState: 'UNAUTHENTICATED' | 'AUTHENTICATING' | 'AUTHENTICATED' | 'REFRESHING_TOKEN' | 'LOGGING_OUT';
  
  // Actions
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthState: (state: AuthState['authState']) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      authState: 'UNAUTHENTICATED',
      
      // Actions
      setAuth: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          authState: 'AUTHENTICATED',
          error: null,
        }),
      
      clearAuth: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          authState: 'UNAUTHENTICATED',
          error: null,
        }),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setAuthState: (authState) => set({ authState }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### 1.5 Create UI Store

**File:** `frontend/lib/stores/ui.store.ts`

```typescript
import { create } from 'zustand';

interface UIState {
  // Modal states
  modals: {
    [key: string]: boolean;
  };
  
  // Notification state
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  
  // Sidebar state
  sidebarOpen: boolean;
  
  // Loading overlays
  globalLoading: boolean;
  
  // Actions
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  showNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  dismissNotification: (id: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  modals: {},
  notifications: [],
  sidebarOpen: false,
  globalLoading: false,
  
  openModal: (modalId) =>
    set((state) => ({
      modals: { ...state.modals, [modalId]: true },
    })),
  
  closeModal: (modalId) =>
    set((state) => ({
      modals: { ...state.modals, [modalId]: false },
    })),
  
  showNotification: (notification) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    
    // Auto-dismiss after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        useUIStore.getState().dismissNotification(id);
      }, notification.duration || 5000);
    }
  },
  
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
```

---

## Phase 2: Query Hooks Implementation (Week 1-2)

### 2.1 Auth Queries

**File:** `frontend/lib/queries/auth.queries.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth.store';

export const useLogin = () => {
  const { setAuth, setLoading, setError, setAuthState } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.login,
    onMutate: () => {
      setAuthState('AUTHENTICATING');
      setLoading(true);
      setError(null);
    },
    onSuccess: (response) => {
      if (response.success && response.data.token) {
        const { user, token, refreshToken } = response.data;
        setAuth(user, token, refreshToken);
        // Invalidate user queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
    onError: (error: any) => {
      setError(error.response?.data?.error?.message || 'Login failed');
      setAuthState('UNAUTHENTICATED');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useCurrentUser = () => {
  const { token, isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: authApi.getCurrentUser,
    enabled: !!token && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### 2.2 Projects Queries

**File:** `frontend/lib/queries/projects.queries.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, Project } from '@/lib/api/projects';
import { useUIStore } from '@/lib/stores/ui.store';

export const useProjects = (filters?: any) => {
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
  const { showNotification } = useUIStore();
  
  return useMutation({
    mutationFn: projectsApi.create,
    onMutate: async (newProject) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      
      // Snapshot previous value
      const previousProjects = queryClient.getQueryData(['projects']);
      
      // Optimistically update
      queryClient.setQueryData(['projects'], (old: any) => {
        const projects = old?.data || [];
        return { ...old, data: [...projects, { ...newProject, id: 'temp-' + Date.now() }] };
      });
      
      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      showNotification({
        type: 'error',
        message: 'Failed to create project',
      });
    },
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Project created successfully',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
```

### 2.3 Auctions Queries (with Real-time Support)

**File:** `frontend/lib/queries/auctions.queries.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auctionsApi, Auction, Bid } from '@/lib/api/auctions';
import { useUIStore } from '@/lib/stores/ui.store';

export const useAuctions = (filters?: any) => {
  return useQuery({
    queryKey: ['auctions', filters],
    queryFn: () => auctionsApi.getAll(filters),
    staleTime: 10 * 1000, // 10 seconds (more frequent for real-time)
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useAuction = (id: string) => {
  return useQuery({
    queryKey: ['auctions', id],
    queryFn: () => auctionsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for active auctions
  });
};

export const usePlaceBid = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();
  
  return useMutation({
    mutationFn: ({ auctionId, data }: { auctionId: string; data: any }) =>
      auctionsApi.placeBid(auctionId, data),
    onMutate: async ({ auctionId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auctions', auctionId] });
      
      // Snapshot previous value
      const previousAuction = queryClient.getQueryData(['auctions', auctionId]);
      
      // Optimistically add bid
      queryClient.setQueryData(['auctions', auctionId], (old: any) => {
        if (!old?.data) return old;
        const bids = old.data.bids || [];
        return {
          ...old,
          data: {
            ...old.data,
            bids: [
              ...bids,
              {
                id: 'temp-' + Date.now(),
                auctionId,
                price: data.price,
                amount: data.amount,
                status: 'PENDING',
                submittedAt: new Date().toISOString(),
              },
            ],
          },
        };
      });
      
      return { previousAuction };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAuction) {
        queryClient.setQueryData(['auctions', variables.auctionId], context.previousAuction);
      }
      showNotification({
        type: 'error',
        message: err.response?.data?.error?.message || 'Failed to place bid',
      });
    },
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Bid placed successfully',
      });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auctions', variables.auctionId] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
  });
};
```

---

## Phase 3: Component Migration (Week 2-3)

### 3.1 Migration Order

1. **Auth Components** (highest priority)
   - Login page
   - Register page
   - useAuth hook replacement

2. **Dashboard** (most visible)
   - Replace useState with queries
   - Add loading/error states

3. **Projects** (most used)
   - List page
   - Detail page
   - Create page

4. **Auctions** (real-time critical)
   - List page
   - Detail page
   - Bid placement

5. **Guarantees** (complex state)
   - List page
   - Detail page
   - Bid placement

6. **Remaining Pages**
   - Investments
   - Staking
   - Governance
   - Rewards
   - Trust
   - Analytics

### 3.2 Migration Pattern

**Before (useState):**
```typescript
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchProjects();
}, []);

const fetchProjects = async () => {
  try {
    setLoading(true);
    const response = await projectsApi.getAll();
    setProjects(response.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**After (React Query):**
```typescript
const { data, isLoading, error } = useProjects();

// That's it! All states handled automatically
```

---

## Phase 4: Real-Time Integration (Week 3-4)

### 4.1 WebSocket Setup

**File:** `frontend/lib/hooks/useWebSocket.ts`

```typescript
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useWebSocket = (url: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Handle different message types
      switch (data.type) {
        case 'BID_PLACED':
          queryClient.invalidateQueries({ queryKey: ['auctions', data.auctionId] });
          break;
        case 'AUCTION_CLOSED':
          queryClient.invalidateQueries({ queryKey: ['auctions'] });
          break;
        // ... more cases
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Reconnect logic
    };
    
    return () => {
      ws.close();
    };
  }, [url, queryClient]);
};
```

### 4.2 Real-Time Query Updates

```typescript
// Auctions with real-time updates
export const useAuction = (id: string) => {
  const queryClient = useQueryClient();
  
  // Set up WebSocket for this auction
  useWebSocket(`ws://localhost:3001/auctions/${id}`);
  
  return useQuery({
    queryKey: ['auctions', id],
    queryFn: () => auctionsApi.getById(id),
    enabled: !!id,
    staleTime: 0, // Always consider stale for real-time
    refetchInterval: false, // Don't poll, use WebSocket
  });
};
```

---

## Phase 5: Error Handling & Recovery (Week 4)

### 5.1 Global Error Handler

**File:** `frontend/lib/hooks/useErrorHandler.ts`

```typescript
import { useUIStore } from '@/lib/stores/ui.store';

export const useErrorHandler = () => {
  const { showNotification } = useUIStore();
  
  const handleError = (error: any, context?: string) => {
    const message = error.response?.data?.error?.message || 
                   error.message || 
                   'An error occurred';
    
    showNotification({
      type: 'error',
      message: context ? `${context}: ${message}` : message,
    });
  };
  
  return { handleError };
};
```

### 5.2 Retry Logic

```typescript
// In QueryProvider
retry: (failureCount, error: any) => {
  // Don't retry on client errors
  if (error?.response?.status >= 400 && error?.response?.status < 500) {
    return false;
  }
  
  // Retry network errors up to 2 times
  if (failureCount < 2) {
    return true;
  }
  
  return false;
},
```

---

## Phase 6: Advanced Features (Week 5)

### 6.1 Optimistic Updates

Already implemented in Phase 2, but extend to:
- Bid withdrawals
- Investment updates
- Stake operations
- Governance votes

### 6.2 Background Sync

```typescript
// Auto-refetch on window focus for critical data
refetchOnWindowFocus: true, // For auctions, guarantees
refetchOnWindowFocus: false, // For static data like projects
```

### 6.3 Pagination & Infinite Queries

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export const useProjectsInfinite = () => {
  return useInfiniteQuery({
    queryKey: ['projects', 'infinite'],
    queryFn: ({ pageParam = 0 }) => 
      projectsApi.getAll({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.data.length < 20) return undefined;
      return pages.length;
    },
  });
};
```

---

## Phase 7: RRE & IRE States (Week 6+)

### 7.1 Regulatory Reporting Queries

```typescript
export const useRegulatoryReports = (regulatorType?: string) => {
  return useQuery({
    queryKey: ['regulatory-reports', regulatorType],
    queryFn: () => regulatoryApi.getReports(regulatorType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: ({ type, period }: { type: string; period: string }) =>
      regulatoryApi.generateReport(type, period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-reports'] });
    },
  });
};
```

### 7.2 Investor Reporting Queries

```typescript
export const useInvestorReports = (investorId: string, filters?: any) => {
  return useQuery({
    queryKey: ['investor-reports', investorId, filters],
    queryFn: () => investorApi.getReports(investorId, filters),
    enabled: !!investorId,
  });
};

export const useImpactMetrics = (investorId: string, dimension: string) => {
  return useQuery({
    queryKey: ['impact-metrics', investorId, dimension],
    queryFn: () => investorApi.getImpactMetrics(investorId, dimension),
    enabled: !!investorId && !!dimension,
  });
};
```

---

## Testing Strategy

### Unit Tests
- Store actions
- Query hooks
- State transitions

### Integration Tests
- Store + Query interactions
- Optimistic updates
- Error recovery

### E2E Tests
- Complete user flows
- State persistence
- Real-time updates

---

## Migration Checklist

### Week 1
- [ ] Install TanStack Query
- [ ] Create QueryProvider
- [ ] Create auth store (Zustand)
- [ ] Create UI store (Zustand)
- [ ] Update root layout

### Week 2
- [ ] Create query hooks for all modules
- [ ] Migrate auth components
- [ ] Migrate dashboard
- [ ] Migrate projects

### Week 3
- [ ] Migrate auctions (with real-time)
- [ ] Migrate guarantees
- [ ] Migrate investments
- [ ] Add optimistic updates

### Week 4
- [ ] Add WebSocket integration
- [ ] Implement error handling
- [ ] Add retry logic
- [ ] Test all flows

### Week 5
- [ ] Add pagination
- [ ] Add infinite queries
- [ ] Optimize performance
- [ ] Add loading states

### Week 6+
- [ ] RRE query hooks
- [ ] IRE query hooks
- [ ] Impact metrics queries
- [ ] Report generation

---

## Success Metrics

1. **Reduced API Calls** - 50%+ reduction via caching
2. **Better UX** - Optimistic updates, instant feedback
3. **Code Quality** - Less boilerplate, cleaner code
4. **Performance** - Faster perceived load times
5. **Maintainability** - Centralized state management

---

## Risk Mitigation

1. **Gradual Migration** - Migrate one module at a time
2. **Feature Flags** - Toggle new state management
3. **Rollback Plan** - Keep old code until verified
4. **Testing** - Comprehensive tests before migration
5. **Monitoring** - Track errors and performance

