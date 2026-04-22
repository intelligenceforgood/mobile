import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { tokens } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { mapErrorToBanner } from '@/api/errors';
import { useEvidenceList } from '@/features/evidence/queries';
import { EvidenceGrid } from '@/features/evidence/components/EvidenceGrid';
import type { EvidenceDocument } from '@/features/evidence/types';
import { AuditLogSection } from '@/features/reviews/components/AuditLogSection';
import { CaseClassificationSection } from '@/features/reviews/components/CaseClassificationSection';
import { CaseHeader } from '@/features/reviews/components/CaseHeader';
import { DecisionSheet } from '@/features/reviews/components/DecisionSheet';
import { CaseSummarySection } from '@/features/reviews/components/CaseSummarySection';
import { CaseTimelineSection } from '@/features/reviews/components/CaseTimelineSection';
import { useCaseFull } from '@/features/reviews/queries';
import type { CaseDetail, CaseTimelineEntry, ReviewDetail } from '@/features/reviews/types';
import { useReportsLibrary } from '@/features/reports/queries';
import { SectionErrorBoundary } from '@/lib/SectionErrorBoundary';
import { useStore } from '@/store/ui';

function SectionCard({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.sectionCard,
        { backgroundColor: theme.color.surfaceAlt, borderColor: theme.color.border },
      ]}
    >
      {children}
    </View>
  );
}

function SectionLoading() {
  return (
    <View style={styles.sectionLoading}>
      <ActivityIndicator size="small" />
    </View>
  );
}

function SectionInlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.inlineError}>
      <Text style={styles.inlineErrorText}>{message}</Text>
      <TouchableOpacity onPress={onRetry}>
        <Text style={styles.inlineRetry}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Case Detail screen — Sprint 3.
 * Route: /case/[id] where id = review_id.
 * Sections: Header, Summary, Classification, Timeline, Evidence Grid, Audit Log.
 * Each section is wrapped in SectionErrorBoundary so one failure doesn't crash the rest.
 */
export default function CaseDetailScreen() {
  const { id: reviewId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [sheetOpen, setSheetOpen] = useState(false);
  const pushToast = useStore((s) => s.pushToast);
  const currentQueueFilter = useStore((s) => s.currentQueueFilter);

  const { review, caseDetail, audit } = useCaseFull(reviewId ?? '');

  // Evidence depends on caseId from review
  const caseId = review.data?.caseId ?? '';
  const evidence = useEvidenceList(caseId);

  // Reports library — check if there's a report for this case
  const reports = useReportsLibrary();
  const reportItems = reports.data?.items ?? [];
  const hasReport = reportItems.length > 0;
  const firstReportId = reportItems[0]?.reportId;

  const handleEvidenceTap = useCallback(
    (doc: EvidenceDocument) => {
      router.push(`/case/${reviewId}/evidence/${doc.documentId}`);
    },
    [router, reviewId],
  );

  const handleViewReport = useCallback(() => {
    if (firstReportId) {
      router.push(`/case/${reviewId}/report?reportId=${firstReportId}`);
    }
  }, [router, reviewId, firstReportId]);

  const handleDecisionSuccess = useCallback(
    (decision: 'approve' | 'reject') => {
      pushToast({ variant: 'success', message: decision === 'approve' ? 'Approved' : 'Rejected' });
      setSheetOpen(false);
      // useDecide already invalidates reviews-queue and review-detail — no extra cache work here.
      // After a decision, the case status changes to approved/rejected. If the queue is filtered
      // by a status that no longer matches (e.g., status: 'new'), pop back to the queue.
      const activeStatusFilter = currentQueueFilter.status;
      const newStatusAfterDecision = decision === 'approve' ? 'approved' : 'rejected';
      const willMatchFilter =
        !activeStatusFilter || activeStatusFilter === newStatusAfterDecision;
      if (!willMatchFilter) {
        router.replace('/(tabs)/queue');
      }
    },
    [pushToast, currentQueueFilter, router],
  );

  if (!reviewId) {
    return (
      <View style={[styles.center, { backgroundColor: theme.color.surface }]}>
        <Text style={{ color: theme.color.text.primary }}>Invalid route — no review ID.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.color.surface }]}
      contentContainerStyle={styles.content}
      testID="case-detail-screen"
    >
      {/* ─── Header ─────────────────────────────────────────────── */}
      <SectionErrorBoundary section="Header">
        <SectionCard>
          {review.isLoading ? (
            <SectionLoading />
          ) : review.isError ? (
            <SectionInlineError
              message={mapErrorToBanner(review.error)}
              onRetry={() => review.refetch()}
            />
          ) : review.data ? (
            <CaseHeader review={review.data as ReviewDetail} onDecide={() => setSheetOpen(true)} />
          ) : null}
        </SectionCard>
      </SectionErrorBoundary>

      {/* ─── Summary ─────────────────────────────────────────────── */}
      <SectionErrorBoundary section="Summary">
        <SectionCard>
          <Text style={[styles.sectionHeading, { color: theme.color.text.secondary }]}>Summary</Text>
          {caseDetail.isLoading ? (
            <SectionLoading />
          ) : caseDetail.isError ? (
            <SectionInlineError
              message={mapErrorToBanner(caseDetail.error)}
              onRetry={() => caseDetail.refetch()}
            />
          ) : caseDetail.data ? (
            <CaseSummarySection caseDetail={caseDetail.data as CaseDetail} />
          ) : null}
        </SectionCard>
      </SectionErrorBoundary>

      {/* ─── Classification ─────────────────────────────────────── */}
      <SectionErrorBoundary section="Classification">
        <SectionCard>
          <Text style={[styles.sectionHeading, { color: theme.color.text.secondary }]}>Classification</Text>
          {caseDetail.isLoading ? (
            <SectionLoading />
          ) : caseDetail.data ? (
            <CaseClassificationSection caseDetail={caseDetail.data as CaseDetail} />
          ) : null}
        </SectionCard>
      </SectionErrorBoundary>

      {/* ─── Timeline ───────────────────────────────────────────── */}
      <SectionErrorBoundary section="Timeline">
        <SectionCard>
          <Text style={[styles.sectionHeading, { color: theme.color.text.secondary }]}>Timeline</Text>
          {caseDetail.isLoading ? (
            <SectionLoading />
          ) : caseDetail.data ? (
            <CaseTimelineSection timeline={(caseDetail.data.timeline ?? []) as CaseTimelineEntry[]} />
          ) : null}
        </SectionCard>
      </SectionErrorBoundary>

      {/* ─── Evidence Grid ──────────────────────────────────────── */}
      <SectionErrorBoundary section="Evidence">
        <SectionCard>
          <Text style={[styles.sectionHeading, { color: theme.color.text.secondary }]}>Evidence</Text>
          {evidence.isLoading ? (
            <SectionLoading />
          ) : evidence.isError ? (
            <SectionInlineError
              message={mapErrorToBanner(evidence.error)}
              onRetry={() => evidence.refetch()}
            />
          ) : evidence.data ? (
            <EvidenceGrid
              caseId={caseId}
              documents={(evidence.data.documents ?? []) as EvidenceDocument[]}
              onPress={handleEvidenceTap}
            />
          ) : null}
        </SectionCard>
      </SectionErrorBoundary>

      {/* ─── Audit Log ──────────────────────────────────────────── */}
      <SectionErrorBoundary section="Audit Log">
        <SectionCard>
          {audit.isLoading ? (
            <SectionLoading />
          ) : audit.isError ? (
            <SectionInlineError
              message={mapErrorToBanner(audit.error)}
              onRetry={() => audit.refetch()}
            />
          ) : audit.data ? (
            <AuditLogSection entries={audit.data.actions} />
          ) : null}
        </SectionCard>
      </SectionErrorBoundary>

      {/* ─── Decision Sheet ────────────────────────────────────── */}
      {reviewId && (
        <DecisionSheet
          visible={sheetOpen}
          reviewId={reviewId}
          onClose={() => setSheetOpen(false)}
          onSuccess={handleDecisionSuccess}
        />
      )}

      {/* ─── View Report Button ──────────────────────────────────── */}
      {hasReport && (
        <TouchableOpacity
          style={[styles.reportButton, { backgroundColor: theme.color.action.primary }]}
          onPress={handleViewReport}
          testID="view-report"
        >
          <Text style={styles.reportButtonText}>View Report</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionLoading: { paddingVertical: 16, alignItems: 'center' },
  inlineError: { paddingVertical: 8 },
  inlineErrorText: { color: tokens.themes.default.color.error.textStrong, fontSize: 13, marginBottom: 6 },
  inlineRetry: { color: tokens.themes.default.color.action.primary, fontSize: 12 },
  reportButton: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  reportButtonText: { color: tokens.themes.default.color.on.badge, fontWeight: '600', fontSize: 15 },
});
