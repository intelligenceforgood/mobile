import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { tokens } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { useReport } from '@/features/reports/queries';

/**
 * Report viewer screen — Sprint 3.
 * Route: /case/[id]/report?reportId=<uuid>
 *
 * Uses react-native-pdf with bearer-auth header (kind: "stream").
 * Renders an empty state without crashing when the PDF is not yet ready (kind: "not_ready").
 */
export default function ReportScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const router = useRouter();
  const theme = useTheme();

  const { data: report, isLoading, isError, error, refetch } = useReport(reportId ?? '');

  return (
    <View style={[styles.container, { backgroundColor: theme.color.surface }]} testID="report-screen">
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={[styles.backText, { color: theme.color.action.primary }]}>← Back</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.color.text.primary }]}>Report</Text>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.color.action.primary} />
          <Text style={[styles.statusText, { color: theme.color.text.muted }]}>Loading report…</Text>
        </View>
      ) : isError ? (
        <View style={styles.center} testID="report-error">
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : 'Failed to load report'}
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={[styles.retryText, { color: theme.color.action.primary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : report?.kind === 'not_ready' ? (
        <View style={styles.center} testID="report-not-ready">
          <Text style={[styles.statusText, { color: theme.color.text.muted }]}>
            Report is being generated (status: {report.meta.status}).
          </Text>
          <Text style={[styles.subText, { color: theme.color.text.muted }]}>
            Check back in a few minutes.
          </Text>
        </View>
      ) : report?.kind === 'stream' ? (
        <View style={styles.pdf} testID="report-pdf">
          <Pdf
            source={{ uri: report.url, headers: report.headers, cache: true }}
            style={styles.pdfInner}
            enablePaging={false}
            horizontal={false}
            enableAnnotationRendering
            onLoadComplete={(pages) => {
              // Page count loaded successfully
              void pages;
            }}
            onError={(err) => {
              console.error('[ReportScreen] PDF load error', err);
            }}
          />
        </View>
      ) : (
        <View style={styles.center} testID="report-empty">
          <Text style={[styles.statusText, { color: theme.color.text.muted }]}>No report available.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  backButton: { marginBottom: 8 },
  backText: { fontSize: 14, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: 14, textAlign: 'center', marginBottom: 8 },
  subText: { fontSize: 12, textAlign: 'center' },
  errorText: { color: tokens.themes.default.color.error.textStrong, fontSize: 14, textAlign: 'center', marginBottom: 12 },
  retryButton: { marginTop: 8 },
  retryText: { fontSize: 14, fontWeight: '600' },
  pdf: { flex: 1, width: '100%' },
  pdfInner: { flex: 1, width: '100%' },
});
