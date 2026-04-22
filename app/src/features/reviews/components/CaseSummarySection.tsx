import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/design/theme';
import type { CaseDetail } from '../types';

interface Props {
  caseDetail: CaseDetail;
}

/**
 * Renders the narrative description of the case.
 * `description` from GET /cases/{case_id} serves as the narrative summary.
 */
export function CaseSummarySection({ caseDetail }: Props) {
  const theme = useTheme();

  if (!caseDetail.description) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.color.text.muted }]}>No summary available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="case-summary-section">
      <Text style={[styles.heading, { color: theme.color.text.secondary }]}>Summary</Text>
      <ScrollView style={styles.scroll} nestedScrollEnabled>
        <Text style={[styles.body, { color: theme.color.text.primary }]}>{caseDetail.description}</Text>
      </ScrollView>
      {caseDetail.campaigns.length > 0 && (
        <View style={styles.campaigns}>
          {caseDetail.campaigns.map((c) => (
            <View key={c.id} style={[styles.tag, { backgroundColor: theme.color.action.primary }]}>
              <Text style={[styles.tagText, { color: theme.color.on.badge }]}>{c.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  heading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  scroll: { maxHeight: 160 },
  body: { fontSize: 14, lineHeight: 22 },
  campaigns: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11, fontWeight: '600' },
  empty: { paddingVertical: 8 },
  emptyText: { fontSize: 13 },
});
