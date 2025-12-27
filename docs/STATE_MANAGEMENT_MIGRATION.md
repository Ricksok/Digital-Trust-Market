# State Management Migration Guide

## Quick Start: Implementing Zustand + TanStack Query

### Step 1: Upgrade Dependencies

```bash
cd frontend
npm install @tanstack/react-query@latest @tanstack/react-query-devtools
npm uninstall react-query  # Remove old version
```

### Step 2: Create Zustand Auth Store

Create `frontend/lib/stores/auth.store.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api/auth';

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
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => {
        set({ token });
        if (token) {
          // Update axios default header
          // This should be in api/client.ts
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          if (response.success && response.data.token) {
            const token = response.data.token;
            const user = response.data.user;
            
            localStorage.setItem('token', token);
            if (response.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            
            set({
              user,
              token,
              isAuthenticated: true,
              loading: false,
            });
            return { success: true };
          }
          return { success: false, error: 'Login failed' };
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Login failed';
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ loading: false, isAuthenticated: false });
          return;
        }

        set({ loading: true });
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            set({
              user: response.data,
              token,
              isAuthenticated: true,
              loading: false,
            });
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### Step 3: Create Query Provider

Create `frontend/lib/providers/QueryProvider.tsx`:

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
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
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

### Step 4: Update Root Layout

Update `frontend/app/layout.tsx`:

```typescript
import { QueryProvider } from '@/lib/providers/QueryProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

### Step 5: Create Query Hooks

Create `frontend/lib/queries/projects.queries.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, Project } from '@/lib/api/projects';

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
  
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
```

### Step 6: Update Components

Example: Update `frontend/app/projects/page.tsx`:

```typescript
'use client';

import { useProjects } from '@/lib/queries/projects.queries';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function ProjectsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>Projects</h1>
      {projects?.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

## Migration Checklist

- [ ] Install TanStack Query
- [ ] Create Zustand auth store
- [ ] Create QueryProvider
- [ ] Update root layout
- [ ] Create query hooks for each API module
- [ ] Update components to use stores and queries
- [ ] Remove old useState/useEffect patterns
- [ ] Test all functionality
- [ ] Add optimistic updates where beneficial
- [ ] Configure background refetching

## Benefits You'll See

1. **Reduced API Calls** - Automatic caching
2. **Better UX** - Optimistic updates
3. **Cleaner Code** - Less boilerplate
4. **Better Performance** - Request deduplication
5. **Easier Testing** - Mockable stores and queries
6. **Real-time Ready** - Easy WebSocket integration




