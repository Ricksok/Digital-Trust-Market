import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, Project } from '@/lib/api/projects';
import { useUIStore } from '@/lib/stores/ui.store';

/**
 * Get all projects query hook
 */
export const useProjects = (filters?: any) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const response = await projectsApi.getAll(filters);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get single project query hook
 */
export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await projectsApi.getById(id);
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Create project mutation hook
 * Includes optimistic update
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: Partial<Project>) => projectsApi.create(data),
    onMutate: async (newProject) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData(['projects']);

      // Optimistically update
      queryClient.setQueryData(['projects'], (old: any) => {
        if (!old?.data) return old;
        const projects = Array.isArray(old.data) ? old.data : [];
        return {
          ...old,
          data: [
            ...projects,
            {
              ...newProject,
              id: 'temp-' + Date.now(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        };
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

/**
 * Update project mutation hook
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectsApi.update(id, data),
    onSuccess: (response, variables) => {
      // Update both list and detail queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
      showNotification({
        type: 'success',
        message: 'Project updated successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update project';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Submit project for approval mutation hook
 */
export const useSubmitProjectForApproval = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => projectsApi.submitForApproval(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      showNotification({
        type: 'success',
        message: 'Project submitted for approval',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to submit project';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};



