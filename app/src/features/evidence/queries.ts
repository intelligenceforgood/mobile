import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/api';
import { EvidenceList } from './types';

/**
 * Fetch all evidence documents for a case.
 * Real endpoint: GET /cases/{case_id}/evidence
 * Returns { caseId, documents: EvidenceDocument[] }.
 * When a document has `available=false`, no binary file is linked.
 */
export function useEvidenceList(caseId: string) {
  return useQuery({
    queryKey: ['evidence-list', caseId],
    queryFn: () => getApi().get(`/cases/${caseId}/evidence`, EvidenceList),
    staleTime: 60_000,
    enabled: Boolean(caseId),
  });
}

/**
 * Look up a single evidence document by its documentId within a case.
 * Evidence is fetched from the list and filtered — there is no separate
 * single-item GET endpoint that returns structured metadata.
 */
export function useEvidenceItem(caseId: string, documentId: string) {
  return useQuery({
    queryKey: ['evidence-list', caseId],
    queryFn: () => getApi().get(`/cases/${caseId}/evidence`, EvidenceList),
    staleTime: 60_000,
    enabled: Boolean(caseId) && Boolean(documentId),
    select: (data) => (data.documents ?? []).find((d) => d.documentId === documentId) ?? null,
  });
}
