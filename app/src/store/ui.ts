import { create } from 'zustand';
import { config } from '@/config';

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

/** Minimal queue filter shape — mirrors FilterBarValue from FilterBar component. */
export type QueueFilter = {
  status: string | undefined;
  priority: string | undefined;
};

type UiState = {
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;

  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;

  /** Whether Sentry error reporting is enabled at runtime. Initialised from config.sentryDsn. */
  sentryEnabled: boolean;
  setSentryEnabled: (enabled: boolean) => void;

  /** The filter currently active in the queue tab. Updated by QueueScreen on each filter change. */
  currentQueueFilter: QueueFilter;
  setCurrentQueueFilter: (filter: QueueFilter) => void;
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

  sentryEnabled: !!config.sentryDsn,
  setSentryEnabled: (enabled) => set({ sentryEnabled: enabled }),

  currentQueueFilter: { status: undefined, priority: undefined },
  setCurrentQueueFilter: (filter) => set({ currentQueueFilter: filter }),
}));
