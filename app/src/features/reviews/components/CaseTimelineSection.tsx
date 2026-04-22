import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/design/theme';
import type { CaseTimelineEntry } from '../types';

interface Props {
  timeline: CaseTimelineEntry[];
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function TimelineItem({ entry, isLast }: { entry: CaseTimelineEntry; isLast: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.item}>
      <View style={styles.lineCol}>
        <View style={[styles.dot, { backgroundColor: theme.color.action.primary }]} />
        {!isLast && <View style={[styles.connector, { backgroundColor: theme.color.border }]} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.timestamp, { color: theme.color.text.muted }]}>
          {formatTimestamp(entry.timestamp)}
        </Text>
        <Text style={[styles.description, { color: theme.color.text.primary }]}>{entry.description}</Text>
        <Text style={[styles.actor, { color: theme.color.text.secondary }]}>{entry.actor}</Text>
      </View>
    </View>
  );
}

/**
 * Renders the case timeline as a vertical list.
 * Each entry shows timestamp, description, and actor.
 */
export function CaseTimelineSection({ timeline }: Props) {
  const theme = useTheme();

  if (timeline.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.color.text.muted }]}>No timeline events.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="case-timeline-section">
      <Text style={[styles.heading, { color: theme.color.text.secondary }]}>Timeline</Text>
      <FlatList
        data={timeline}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TimelineItem entry={item} isLast={index === timeline.length - 1} />
        )}
        scrollEnabled={false}
      />
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
  item: { flexDirection: 'row', marginBottom: 0 },
  lineCol: { alignItems: 'center', width: 20, marginRight: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  connector: { flex: 1, width: 1, minHeight: 20 },
  content: { flex: 1, paddingBottom: 14 },
  timestamp: { fontSize: 11, marginBottom: 2 },
  description: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  actor: { fontSize: 12 },
  empty: { paddingVertical: 8 },
  emptyText: { fontSize: 13 },
});
