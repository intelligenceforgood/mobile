import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/design/theme';
import type { ReviewQueueItem } from '../types';

/** Priority → badge colour mapping. */
const PRIORITY_COLORS: Record<string, string> = {
  critical: '#DC2626',
  high: '#D97706',
  medium: '#2563EB',
  low: '#6B7280',
};

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function shortId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

interface Props {
  item: ReviewQueueItem;
}

export function QueueRow({ item }: Props) {
  const theme = useTheme();
  const priorityColor = PRIORITY_COLORS[item.priority] ?? PRIORITY_COLORS.medium;

  return (
    <View style={[styles.row, { borderColor: theme.color.border, backgroundColor: theme.color.surfaceAlt }]}>
      <View style={styles.header}>
        <Text style={[styles.caseId, { color: theme.color.text.primary }]} numberOfLines={1}>
          {shortId(item.case_id)}
        </Text>
        <Text style={[styles.time, { color: theme.color.text.muted }]}>
          {formatRelativeTime(item.queued_at)}
        </Text>
      </View>
      <View style={styles.badges}>
        <View style={[styles.badge, { backgroundColor: theme.color.action.primary }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: priorityColor }]}>
          <Text style={styles.badgeText}>{item.priority}</Text>
        </View>
      </View>
      <Text style={[styles.assignee, { color: theme.color.text.secondary }]}>
        {item.assigned_to ?? 'Unassigned'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  caseId: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  assignee: {
    fontSize: 12,
  },
});
