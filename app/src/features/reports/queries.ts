import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/api';
import { config } from '@/config';
import { ReportDownload, ReportsLibrary, ReportSummary } from './types';

/**
 * Fetch the list of generated reports from GET /reports/library.
 */
export function useReportsLibrary() {
  return useQuery({
    queryKey: ['reports-library'],
    queryFn: () => getApi().get('/reports/library', ReportsLibrary),
    staleTime: 30_000,
  });
}

/**
 * Resolve a single report to a download-ready descriptor.
 * GET /reports/{report_id}/download is a bearer-auth proxied PDF stream.
 * Returns { kind: "stream", url, headers } when the report is ready (status !== "queued"),
 * or { kind: "not_ready" } when the worker hasn't generated the PDF yet.
 *
 * The caller passes `source={{ uri: url, headers }}` directly to react-native-pdf.
 */
export function useReport(reportId: string) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: async (): Promise<ReportDownload> => {
      const library = await getApi().get('/reports/library', ReportsLibrary);
      const meta: ReportSummary | undefined = (library.items ?? []).find((r: ReportSummary) => r.reportId === reportId);

      if (!meta) {
        throw new Error(`Report ${reportId} not found in library`);
      }

      // Reports with status "queued" or "generating" have no PDF yet.
      if (meta.status === 'queued' || meta.status === 'generating') {
        return { kind: 'not_ready', meta };
      }

      // Build the download URL; bearer token is injected by the ApiClient headers convention.
      // For react-native-pdf we need to pass the token explicitly in the source headers.
      // We access the auth singleton here to obtain the current token without storing it.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { auth } = require('@/auth') as { auth: import('@/auth/provider').AuthProvider };
      const token = await auth.getAccessToken();
      const url = `${config.apiBaseUrl}/reports/${reportId}/download`;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      return { kind: 'stream', url, headers, meta };
    },
    staleTime: 30_000,
    enabled: Boolean(reportId),
  });
}
