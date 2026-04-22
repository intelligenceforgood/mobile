import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/design/theme';
import type { ReviewDetail } from '../types';

interface Props {
  review: ReviewDetail;
  onDecide?: () => void;
}

const STATUS_SHOW_DECIDE = new Set(['pending', 'in_review', 'new']);

/**
 * Case Detail header: review ID, case ID, status, priority badge, and "Decide…" button.
 * The Decide button is visible when status is pending/in_review/new.
 * Pass `onDecide` to enable the button and handle taps.
 */
export function CaseHeader({ review, onDecide }: Props) {
  const theme = useTheme();
  const priorityColors = theme.color.priority;
  const priorityColor = priorityColors[review.priority as keyof typeof priorityColors] ?? priorityColors.medium;
  const showDecide = STATUS_SHOW_DECIDE.has(review.status);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.color.surfaceAlt, borderColor: theme.color.border }]}
      testID="case-header"
    >
      <View style={styles.row}>
        <Text style={[styles.reviewId, { color: theme.color.text.secondary }]} numberOfLines={1}>
          Review {review.reviewId.slice(0, 8)}…
        </Text>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
          <Text style={[styles.badgeText, { color: theme.color.on.badge }]}>{review.priority}</Text>
        </View>
      </View>

      <Text style={[styles.caseId, { color: theme.color.text.muted }]} numberOfLines={1}>
        Case {review.caseId.slice(0, 12)}…
      </Text>

      <View style={styles.row}>
        <View style={[styles.statusBadge, { backgroundColor: theme.color.action.primary }]}>
          <Text style={[styles.badgeText, { color: theme.color.on.badge }]}>{review.status}</Text>
        </View>

        {showDecide && (
          <TouchableOpacity
            style={[
              styles.decideButton,
              { borderColor: theme.color.action.primary },
              !onDecide && styles.decideButtonDisabled,
            ]}
            disabled={!onDecide}
            onPress={onDecide}
            testID="decide-button"
            accessibilityLabel="Decide"
          >
            <Text
              style={[
                styles.decideText,
                { color: onDecide ? theme.color.action.primary : theme.color.text.muted },
              ]}
            >
              Decide…
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewId: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  caseId: {
    fontSize: 12,
    marginBottom: 8,
  },
  priorityBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  decideButton: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  decideButtonDisabled: {
    opacity: 0.5,
  },
  decideText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
