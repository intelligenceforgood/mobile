import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/design/theme';
import type { AuditEntry } from '../types';

interface Props {
  entries: AuditEntry[];
}

function formatDate(iso: string): string {
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

function AuditRow({ item }: { item: AuditEntry }) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: theme.color.border }]}>
      <Text style={[styles.action, { color: theme.color.text.primary }]}>{item.action}</Text>
      <Text style={[styles.actor, { color: theme.color.text.secondary }]}>{item.actor}</Text>
      <Text style={[styles.ts, { color: theme.color.text.muted }]}>{formatDate(item.created_at)}</Text>
    </View>
  );
}

/**
 * Collapsible audit log section.
 * Uses FlatList so 50+ entries scroll smoothly.
 * Lazy-rendered: FlatList is only mounted after the user expands.
 */
export function AuditLogSection({ entries }: Props) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => setExpanded((e) => !e), []);

  const renderItem = useCallback(({ item }: { item: AuditEntry }) => <AuditRow item={item} />, []);
  const keyExtractor = useCallback((item: AuditEntry) => item.action_id, []);

  return (
    <View style={styles.container} testID="audit-log-section">
      <TouchableOpacity onPress={toggle} style={styles.header} testID="audit-log-toggle">
        <Text style={[styles.heading, { color: theme.color.text.secondary }]}>
          Audit Log ({entries.length})
        </Text>
        <Text style={[styles.chevron, { color: theme.color.text.muted }]}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <FlatList<AuditEntry>
          data={entries}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          scrollEnabled={false}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={5}
          removeClippedSubviews
          testID="audit-log-list"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  heading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  chevron: { fontSize: 12 },
  row: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  action: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  actor: { fontSize: 12, marginBottom: 2 },
  ts: { fontSize: 11 },
});
