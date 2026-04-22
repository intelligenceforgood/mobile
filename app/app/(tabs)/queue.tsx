import { StyleSheet, Text, View } from 'react-native';

/** Reviews Queue screen — stub. Full implementation in Sprint 2. */
export default function QueueScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>Coming in Sprint 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  message: { fontSize: 16, color: '#6b7280' },
});
