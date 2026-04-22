/* eslint-disable @typescript-eslint/no-redeclare */
import { z } from 'zod';

/**
 * Zod schemas for the reviews feature and shared auth types.
 * Shapes verified against i4g-local on 2026-04-21.
 */

// ---------------------------------------------------------------------------
// WhoAmI — GET /accounts/me
// NOTE: Path differs from TDD §12 assumption (/auth/whoami). Real path is /accounts/me.
// ---------------------------------------------------------------------------
export const WhoAmI = z.object({
  email: z.string(),
  role: z.string(),
  displayName: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});
export type WhoAmI = z.infer<typeof WhoAmI>;

// ---------------------------------------------------------------------------
// Queue — GET /reviews/queue
// Real shape uses snake_case fields and returns { items, count }.
// ---------------------------------------------------------------------------
export const ReviewPriority = z.enum(['low', 'medium', 'high', 'critical']).catch('medium');
export type ReviewPriority = z.infer<typeof ReviewPriority>;

// Queue item uses snake_case (inconsistency with detail which uses camelCase)
export const ReviewQueueItem = z.object({
  review_id: z.string(),
  case_id: z.string(),
  queued_at: z.string(),
  priority: ReviewPriority,
  status: z.string(),
  assigned_to: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  last_updated: z.string().nullable().optional(),
  classification_result: z.unknown().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
});
export type ReviewQueueItem = z.infer<typeof ReviewQueueItem>;

export const ReviewsQueue = z.object({
  items: z.array(ReviewQueueItem),
  count: z.number().int().nonnegative(),
});
export type ReviewsQueue = z.infer<typeof ReviewsQueue>;

// ---------------------------------------------------------------------------
// Review Detail — GET /reviews/{review_id}
// Real shape uses camelCase (mixed with snake_case queued_at).
// ---------------------------------------------------------------------------
// TODO(sprint1-verify): CaseDetail shape (summary, classification, timeline, audit) — not present
// in /reviews/{review_id}. Likely comes from /cases/{case_id}. Sprint 2 follow-up.
export const ReviewDetail = z.object({
  reviewId: z.string(),
  caseId: z.string(),
  status: z.string(),
  priority: ReviewPriority,
  queued_at: z.string(),
  assigned_to: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  last_updated: z.string().nullable().optional(),
});
export type ReviewDetail = z.infer<typeof ReviewDetail>;

// ---------------------------------------------------------------------------
// Kept for TDD §6 compat — these will be re-verified in Sprint 2/3
// ---------------------------------------------------------------------------
export const ReviewStatus = z.enum(['pending', 'approved', 'rejected', 'in_review', 'new']).catch('pending');
export type ReviewStatus = z.infer<typeof ReviewStatus>;

// TODO(sprint1-verify): ReviewSummary — for Sprint 2 queue screen. Shape TBD from /reviews/queue items.
export const ReviewSummary = ReviewQueueItem;
export type ReviewSummary = ReviewQueueItem;

// ---------------------------------------------------------------------------
// Case Artifact — embedded in CaseDetail.artifacts
// ---------------------------------------------------------------------------
export const CaseArtifact = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  url: z.string(),
  metadata: z
    .object({
      mime_type: z.string().nullable().optional(),
      source_url: z.string().nullable().optional(),
    })
    .optional(),
});
export type CaseArtifact = z.infer<typeof CaseArtifact>;

// ---------------------------------------------------------------------------
// Case Timeline Entry — embedded in CaseDetail.timeline
// ---------------------------------------------------------------------------
export const CaseTimelineEntry = z.object({
  id: z.string(),
  timestamp: z.string(),
  description: z.string(),
  actor: z.string(),
  type: z.string(),
});
export type CaseTimelineEntry = z.infer<typeof CaseTimelineEntry>;

// ---------------------------------------------------------------------------
// CaseDetail — GET /cases/{case_id}
// Verified against i4g-local on 2026-04-22. See sprint3-endpoint-verification.md.
// camelCase/snake_case mixed per server — schemas follow server literally.
// `description` is the narrative summary; `tags` encode classification labels.
// ---------------------------------------------------------------------------
export const CaseDetail = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  priority: ReviewPriority,
  assignee: z.string().nullable().optional(),
  updatedAt: z.string(),
  queue: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  progress: z.unknown().nullable().optional(),
  dueAt: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  entities: z.array(z.unknown()).optional().default([]),
  artifacts: z.array(CaseArtifact).optional().default([]),
  timeline: z.array(CaseTimelineEntry).optional().default([]),
  graphNodes: z.array(z.unknown()).optional().default([]),
  graphLinks: z.array(z.unknown()).optional().default([]),
  investigations: z.array(z.unknown()).optional().default([]),
  campaigns: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .optional()
    .default([]),
});
export type CaseDetail = z.infer<typeof CaseDetail>;

// ---------------------------------------------------------------------------
// Decision — POST /reviews/{review_id}/decision
// Real field: 'notes' (not 'comment'). 'auto_generate_report' is bonus.
// ---------------------------------------------------------------------------
export const DecisionRequest = z.object({
  decision: z.enum(['approve', 'reject']),
  notes: z.string().min(0).max(1000).optional(),
  auto_generate_report: z.boolean().optional().default(false),
});
export type DecisionRequest = z.infer<typeof DecisionRequest>;

export const DecisionResponse = z.object({
  reviewId: z.string(),
  status: z.string(),
});
export type DecisionResponse = z.infer<typeof DecisionResponse>;

// ---------------------------------------------------------------------------
// Audit — GET /reviews/{review_id}/actions
// Real path: /actions (not /audit).
// ---------------------------------------------------------------------------
export const AuditEntry = z.object({
  action_id: z.string(),
  review_id: z.string().optional(),
  actor: z.string(),
  action: z.string(),
  payload: z.unknown().optional(),
  created_at: z.string(),
});
export type AuditEntry = z.infer<typeof AuditEntry>;

export const AuditLog = z.object({
  reviewId: z.string(),
  actions: z.array(AuditEntry),
});
export type AuditLog = z.infer<typeof AuditLog>;
