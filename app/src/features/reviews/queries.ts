import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/api';
import {
  AuditLog,
  CaseDetail,
  DecisionRequest,
  DecisionResponse,
  ReviewDetail,
  ReviewsQueue,
  WhoAmI,
} from './types';

/**
 * Fetch the current signed-in user from /accounts/me.
 * Used by Dashboard in Sprint 1 to display "Signed in as {name}".
 */
export function useWhoAmI() {
  return useQuery({
    queryKey: ['whoami'],
    queryFn: () => getApi().get('/accounts/me', WhoAmI),
    staleTime: 5 * 60_000, // 5 min — identity rarely changes
    retry: 2,
  });
}

/**
 * Fetch the review triage queue.
 * Real endpoint: GET /reviews/queue (not /reviews/search).
 *
 * Accepts optional `status` and `limit` params.
 * - `status` is passed as-is to the server (default "new" is the backend default — omit to use it).
 * - `limit` starts at 25 and can be bumped for progressive pagination.
 * Query key includes both params so TanStack Query caches each combination separately.
 */
export function useReviewsQueue(params: { status?: string; limit?: number } = {}) {
  const { status, limit = 25 } = params;
  return useQuery({
    queryKey: ['reviews-queue', { status, limit }] as const,
    queryFn: () => {
      const qs = new URLSearchParams();
      if (status !== undefined) qs.set('status', status);
      qs.set('limit', String(limit));
      return getApi().get(`/reviews/queue?${qs.toString()}`, ReviewsQueue);
    },
    staleTime: 60_000,
  });
}

/**
 * Fetch a single review detail.
 * Real endpoint: GET /reviews/{review_id} — returns ReviewDetail shape (camelCase).
 * For full case data (description, timeline, artifacts) use useCaseFull.
 */
export function useCase(id: string) {
  return useQuery({
    queryKey: ['review-detail', id],
    queryFn: () => getApi().get(`/reviews/${id}`, ReviewDetail),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}

/**
 * Fetch extended case data from GET /cases/{case_id}.
 * Returns description, timeline, artifacts, tags, campaigns.
 */
export function useCaseDetail(caseId: string) {
  return useQuery({
    queryKey: ['case-detail', caseId],
    queryFn: () => getApi().get(`/cases/${caseId}`, CaseDetail),
    staleTime: 60_000,
    enabled: Boolean(caseId),
  });
}

/**
 * Fan-out hook that combines review detail, case detail, and audit log.
 * Returns per-section query results so the Case Detail screen can render
 * each section independently with its own loading/error state.
 *
 * Sequence: review is fetched first; caseId from review enables case-detail fetch.
 */
export function useCaseFull(reviewId: string) {
  const review = useCase(reviewId);
  const caseId = review.data?.caseId ?? '';
  const caseDetail = useCaseDetail(caseId);
  const audit = useAuditLog(reviewId);
  return { review, caseDetail, audit };
}

/**
 * Fetch the audit log for a review.
 * Real endpoint: GET /reviews/{id}/actions (not /audit).
 */
export function useAuditLog(reviewId: string) {
  return useQuery({
    queryKey: ['audit', reviewId],
    queryFn: () => getApi().get(`/reviews/${reviewId}/actions`, AuditLog),
    staleTime: 60_000,
    enabled: Boolean(reviewId),
  });
}

/**
 * Submit an approve/reject decision.
 * Optimistically updates case status; rolls back on error.
 */
export function useDecide(reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DecisionRequest) =>
      getApi().post(`/reviews/${reviewId}/decision`, body, DecisionResponse),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: ['review-detail', reviewId] });
      const prev = qc.getQueryData<ReviewDetail>(['review-detail', reviewId]);
      if (prev) {
        qc.setQueryData(['review-detail', reviewId], {
          ...prev,
          status: body.decision === 'approve' ? 'approved' : 'rejected',
        });
      }
      return { prev };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.prev) qc.setQueryData(['review-detail', reviewId], ctx.prev);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews-queue'] });
      qc.invalidateQueries({ queryKey: ['review-detail', reviewId] });
    },
  });
}
