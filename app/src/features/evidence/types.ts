/* eslint-disable @typescript-eslint/no-redeclare */
import { z } from 'zod';

/**
 * Zod schemas for the evidence feature.
 * Shapes verified against i4g-local on 2026-04-22.
 */

// ---------------------------------------------------------------------------
// EvidenceDocument — single item from GET /cases/{case_id}/evidence
// `available=false` means no binary file is linked; display metadata only.
// ---------------------------------------------------------------------------
export const EvidenceDocument = z.object({
  documentId: z.string(),
  title: z.string(),
  sourceUrl: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  fileSha256: z.string().nullable().optional(),
  ingestedAt: z.string().nullable().optional(),
  textSha256: z.string().nullable().optional(),
  available: z.boolean(),
});
export type EvidenceDocument = z.infer<typeof EvidenceDocument>;

// ---------------------------------------------------------------------------
// EvidenceList — GET /cases/{case_id}/evidence
// ---------------------------------------------------------------------------
export const EvidenceList = z.object({
  caseId: z.string(),
  documents: z.array(EvidenceDocument).optional().default([]),
});
export type EvidenceList = z.infer<typeof EvidenceList>;
