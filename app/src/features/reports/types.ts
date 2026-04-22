/* eslint-disable @typescript-eslint/no-redeclare */
import { z } from 'zod';

/**
 * Zod schemas for the reports feature.
 * Shapes verified against i4g-local on 2026-04-22.
 * See: planning/proposals/mobile-prototype/sprint3-endpoint-verification.md
 *
 * GET /reports/library  → ReportsLibrary
 * GET /reports/{id}/download  → bearer-auth proxied PDF stream (not signed URL)
 */

// ---------------------------------------------------------------------------
// ReportSummary — single item from GET /reports/library
// ---------------------------------------------------------------------------
export const ReportSummary = z.object({
  reportId: z.string(),
  template: z.string(),
  scope: z.string().optional(),
  tlp: z.string().optional(),
  status: z.string(),
  createdAt: z.string(),
  createdBy: z.string().optional(),
});
export type ReportSummary = z.infer<typeof ReportSummary>;

// ---------------------------------------------------------------------------
// ReportsLibrary — GET /reports/library
// ---------------------------------------------------------------------------
export const ReportsLibrary = z.object({
  items: z.array(ReportSummary).optional().default([]),
  count: z.number().int().nonnegative(),
});
export type ReportsLibrary = z.infer<typeof ReportsLibrary>;

// ---------------------------------------------------------------------------
// ReportDownload — resolved by useReport()
// `kind: "stream"` — bearer-auth proxied PDF. Pass `headers` to react-native-pdf.
// No signed-URL branch observed in i4g-local. If a future env adds one, extend this.
// ---------------------------------------------------------------------------
export type ReportDownload =
  | { kind: 'stream'; url: string; headers: Record<string, string>; meta: ReportSummary }
  | { kind: 'not_ready'; meta: ReportSummary };
