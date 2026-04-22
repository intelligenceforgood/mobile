import { QueryClient } from '@tanstack/react-query';

/**
 * App-wide TanStack Query client.
 * - 3 retries with exponential backoff (managed by react-query defaults + custom delay)
 * - 60 s stale time (screens can opt out with staleTime: 0)
 * - refetchOnWindowFocus enabled globally (RN: maps to app foregrounding)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
