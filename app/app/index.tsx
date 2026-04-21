import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { config } from '@/config';
import { useTheme } from '@/design/theme';

/**
 * Sprint 0 landing screen — confirms the Expo Router + design token + env config
 * pipeline is wired correctly. Replace with the real sign-in / dashboard flow in Sprint 1.
 */
export default function IndexScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.color.surface }]}>
      <Text style={[styles.title, { color: theme.color.text.primary }]}>Hello I4G</Text>
      <Text style={[styles.subtitle, { color: theme.color.text.secondary }]}>
        profile: {config.profile}
      </Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
});
