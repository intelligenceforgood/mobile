import { create } from 'zustand';

export type Toast = {
  id: string;
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
};

export type User = {
  email: string;
  name: string;
  roles: string[];
};

type UiState = {
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;

  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const useStore = create<UiState>()((set) => ({
  toasts: [],
  pushToast: (toast) =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { ...toast, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
      ],
    })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
