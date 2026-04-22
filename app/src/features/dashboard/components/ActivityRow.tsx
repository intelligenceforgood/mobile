import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/design/theme';
import type { DashboardActivityItem } from '../types';

interface Props {
  item: DashboardActivityItem;
}

export function ActivityRow({ item }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { borderColor: theme.color.border }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.color.text.primary }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.actor !== undefined && (
          <Text style={[styles.meta, { color: theme.color.text.muted }]}>{item.actor}</Text>
        )}
      </View>
      {item.when !== undefined && (
        <Text style={[styles.when, { color: theme.color.text.muted }]}>{item.when}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  when: {
    fontSize: 11,
  },
});
