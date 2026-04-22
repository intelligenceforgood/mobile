import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/api';
import { DashboardOverview } from './types';

/**
 * Fetch dashboard overview from GET /dashboard/overview.
 *
 * NOTE: TDD §12 assumed /reviews/search?limit=0 but the real endpoint is /dashboard/overview.
 * See sprint1-endpoint-verification.md for details.
 *
 * Errors are surfaced via TanStack Query's `isError` — the screen handles fallback UI.
 */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => getApi().get('/dashboard/overview', DashboardOverview),
    staleTime: 60_000,
  });
}
