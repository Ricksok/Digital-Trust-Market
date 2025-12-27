import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UIState {
  // Modal states
  modals: {
    [key: string]: boolean;
  };
  
  // Notification state
  notifications: Notification[];
  
  // Sidebar state
  sidebarOpen: boolean;
  
  // Loading overlays
  globalLoading: boolean;
  
  // Actions
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  showNotification: (notification: Omit<Notification, 'id'>) => void;
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
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    
    // Auto-dismiss after duration (unless duration is 0)
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




