import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/design/theme';
import type { DashboardMetric } from '../types';

interface Props {
  metric: DashboardMetric;
}

export function MetricCard({ metric }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.color.surfaceAlt, borderColor: theme.color.border },
      ]}
    >
      <Text style={[styles.label, { color: theme.color.text.secondary }]} numberOfLines={2}>
        {metric.label}
      </Text>
      <Text style={[styles.value, { color: theme.color.text.primary }]}>{metric.value}</Text>
      {metric.change !== undefined && metric.change !== '' && (
        <Text style={[styles.change, { color: theme.color.text.muted }]}>{metric.change}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    margin: 4,
    minHeight: 80,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  change: {
    fontSize: 11,
    marginTop: 4,
  },
});
