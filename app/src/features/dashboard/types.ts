/* eslint-disable @typescript-eslint/no-redeclare */
import { z } from 'zod';

/**
 * Dashboard counts shape.
 *
 * The real endpoint is GET /dashboard/overview, which returns
 * { metrics: [{label, value, change}], alerts: [], activity: [...] }.
 * This legacy shape is retained for backwards compatibility; DashboardOverview below is
 * the canonical shape used by the Dashboard screen.
 */
export const DashboardCounts = z.object({
  pending: z.number(),
  inReview: z.number(),
  approved: z.number(),
});
export type DashboardCounts = z.infer<typeof DashboardCounts>;

/** Real shape returned by GET /dashboard/overview (verified Sprint 1). */
export const DashboardMetric = z.object({
  label: z.string(),
  value: z.string(), // API returns string, e.g. "23"
  change: z.string().optional(),
});
export type DashboardMetric = z.infer<typeof DashboardMetric>;

export const DashboardActivityItem = z.object({
  id: z.string(),
  title: z.string(),
  actor: z.string().optional(),
  when: z.string().optional(),
});
export type DashboardActivityItem = z.infer<typeof DashboardActivityItem>;

export const DashboardOverview = z.object({
  metrics: z.array(DashboardMetric),
  alerts: z.array(z.unknown()),
  activity: z.array(DashboardActivityItem),
});
export type DashboardOverview = z.infer<typeof DashboardOverview>;
