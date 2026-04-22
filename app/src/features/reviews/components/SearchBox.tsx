import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/design/theme';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

interface Props {
  onDebouncedChange: (q: string) => void;
  placeholder?: string;
}

export function SearchBox({ onDebouncedChange, placeholder = 'Search cases…' }: Props) {
  const theme = useTheme();
  const [raw, setRaw] = useState('');
  const debounced = useDebouncedValue(raw, 300);

  // Fire callback whenever the debounced value changes (skip on initial mount).
  const prevDebouncedRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (prevDebouncedRef.current !== undefined && prevDebouncedRef.current !== debounced) {
      onDebouncedChange(debounced);
    }
    prevDebouncedRef.current = debounced;
  }, [debounced, onDebouncedChange]);

  function handleClear() {
    setRaw('');
    onDebouncedChange('');
  }

  return (
    <View style={[styles.container, { borderColor: theme.color.border, backgroundColor: theme.color.surfaceAlt }]}>
      <TextInput
        testID="search-input"
        style={[styles.input, { color: theme.color.text.primary }]}
        value={raw}
        onChangeText={setRaw}
        placeholder={placeholder}
        placeholderTextColor={theme.color.text.muted}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {raw.length > 0 && (
        <TouchableOpacity testID="search-clear" onPress={handleClear}>
          <Text style={[styles.clearText, { color: theme.color.text.muted }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  clearText: {
    fontSize: 14,
    paddingLeft: 8,
  },
});
