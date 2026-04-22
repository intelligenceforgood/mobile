import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/design/theme';

export type FilterBarValue = {
  status: string | undefined;
  priority: string | undefined;
};

const STATUS_OPTIONS = ['all', 'new', 'pending', 'in_review', 'approved', 'rejected'] as const;
const PRIORITY_OPTIONS = ['all', 'low', 'medium', 'high', 'critical'] as const;

interface Props {
  value: FilterBarValue;
  onChange: (next: FilterBarValue) => void;
}

export function FilterBar({ value, onChange }: Props) {
  const theme = useTheme();

  function selectStatus(opt: string) {
    onChange({ ...value, status: opt === 'all' ? undefined : opt });
  }

  function selectPriority(opt: string) {
    onChange({ ...value, priority: opt === 'all' ? undefined : opt });
  }

  const activeStatus = value.status ?? 'all';
  const activePriority = value.priority ?? 'all';

  return (
    <View style={styles.container}>
      {/* Status segmented control */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {STATUS_OPTIONS.map((opt) => {
          const active = activeStatus === opt;
          return (
            <TouchableOpacity
              key={opt}
              testID={`status-${opt}`}
              onPress={() => selectStatus(opt)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.color.action.primary : theme.color.surfaceAlt,
                  borderColor: theme.color.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? '#fff' : theme.color.text.secondary }]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Priority chip group */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {PRIORITY_OPTIONS.map((opt) => {
          const active = activePriority === opt;
          return (
            <TouchableOpacity
              key={opt}
              testID={`priority-${opt}`}
              onPress={() => selectPriority(opt)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.color.action.primary : theme.color.surfaceAlt,
                  borderColor: theme.color.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? '#fff' : theme.color.text.secondary }]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
    marginLeft: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
