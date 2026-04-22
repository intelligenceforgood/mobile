import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/design/theme';
import type { CaseDetail } from '../types';

interface Props {
  caseDetail: CaseDetail;
}

/**
 * Renders the classification tag set.
 * Tags from GET /cases/{case_id} encode classification (e.g. INTENT.CHARITY, CHANNEL.SOCIAL).
 * No separate classification confidence score exists in the current API.
 */
export function CaseClassificationSection({ caseDetail }: Props) {
  const theme = useTheme();

  if (caseDetail.tags.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.color.text.muted }]}>No classification tags.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="case-classification-section">
      <Text style={[styles.heading, { color: theme.color.text.secondary }]}>Classification</Text>
      <View style={styles.tagRow}>
        {caseDetail.tags.map((tag) => (
          <View key={tag} style={[styles.tag, { borderColor: theme.color.action.primary }]}>
            <Text style={[styles.tagText, { color: theme.color.action.primary }]}>{tag}</Text>
          </View>
        ))}
      </View>
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
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: { fontSize: 12, fontWeight: '600' },
  empty: { paddingVertical: 8 },
  emptyText: { fontSize: 13 },
});
