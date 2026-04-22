import { useStore } from '@/store/ui';
import { logger } from '@/lib/logger';
import { type AuthProvider, type AuthState, type User } from './provider';

// Access the Zustand store directly (outside React) using the store's vanilla API.
const store = useStore;

const FALLBACK_USER: User = {
  email: 'analyst@local',
  name: 'Local Analyst',
  roles: ['analyst'],
};

/** Subscribers to auth state changes. */
const subscribers = new Set<(state: AuthState) => void>();

function notify() {
  const user = store.getState().user;
  const state: AuthState = { user, isInitialized: true };
  subscribers.forEach((cb) => cb(state));
}

export const mockProvider: AuthProvider = {
  kind: 'mock',

  async initialize() {
    // No-op: mock provider starts unsigned-in. The root layout calls this and then
    // checks store.user to decide whether to redirect to sign-in.
  },

  async signIn() {
    // Optimistically set the fallback user first so UI responds immediately.
    store.getState().setUser(FALLBACK_USER);
    notify();

    // Fire-and-forget: try to hydrate user from /accounts/me.
    try {
      // Dynamic import breaks the circular dep: auth → api → auth
      const { getApi } = await import('@/api');
      const { WhoAmI } = await import('@/features/reviews/types');

      const api = getApi();
      const whoami = await api.get('/accounts/me', WhoAmI);
      const realUser: User = {
        email: whoami.email,
        name: whoami.displayName ?? whoami.email,
        roles: [whoami.role],
      };
      store.getState().setUser(realUser);
      notify();
    } catch (err) {
      // Non-fatal: keep the fallback user.
      logger.warn('auth:mock:whoami_failed', { err: String(err) });
    }
  },

  async signOut() {
    store.getState().clearUser();
    notify();
  },

  async getAccessToken() {
    // Local backend has identity disabled — no auth header needed.
    return null;
  },

  async getUser() {
    return store.getState().user;
  },

  onChange(cb: (state: AuthState) => void) {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  },
};
