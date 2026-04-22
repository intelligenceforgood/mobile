import { StyleSheet, Text, View } from 'react-native';

/** Settings screen — stub. Full implementation in Sprint 5. */
export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>Coming in Sprint 5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  message: { fontSize: 16, color: '#6b7280' },
});
