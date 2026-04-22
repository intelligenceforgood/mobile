import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/api';
import { logger } from '@/lib/logger';
import { DashboardOverview } from './types';

/**
 * Fetch dashboard overview from GET /dashboard/overview.
 *
 * NOTE: TDD §12 assumed /reviews/search?limit=0 but the real endpoint is /dashboard/overview.
 * See sprint1-endpoint-verification.md for details.
 *
 * If the endpoint is unreachable (e.g. local-aio not running), returns a zero payload
 * and logs a warning once.
 */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      try {
        return await getApi().get('/dashboard/overview', DashboardOverview);
      } catch (err) {
        logger.warn('dashboard:overview_failed', { err: String(err) });
        // Hard-coded zero payload per manifest spec.
        return {
          metrics: [],
          alerts: [],
          activity: [],
        } satisfies DashboardOverview;
      }
    },
    staleTime: 60_000,
  });
}
