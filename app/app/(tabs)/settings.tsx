import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { DevSettings } from 'react-native';
import { auth } from '@/auth';
import { config } from '@/config';
import { useTheme } from '@/design/theme';
import { useStore } from '@/store/ui';

const PROFILE_OPTIONS = ['local', 'dev', 'prod'] as const;
const DEV_PROFILE_KEY = 'i4g:dev-profile-override';

/** Settings screen — Sprint 5 implementation. */
export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const clearUser = useStore((s) => s.clearUser);
  const sentryEnabled = useStore((s) => s.sentryEnabled);
  const setSentryEnabled = useStore((s) => s.setSentryEnabled);

  const profileLabel = `${config.profile.toUpperCase()} · ${config.apiMode} · ${config.authProvider}`;
  const appVersion = Constants.expoConfig?.version ?? '0.0.0';

  async function handleSignOut() {
    await auth.signOut();
    clearUser();
    router.replace('/sign-in');
  }

  async function handleSwitchProfile(profile: (typeof PROFILE_OPTIONS)[number]) {
    await SecureStore.setItemAsync(DEV_PROFILE_KEY, profile);
    // expo-updates not installed in prototype; use DevSettings as documented fallback.
    DevSettings.reload();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.color.surface }]}>
      {/* Profile header */}
      <View style={[styles.section, { borderColor: theme.color.border }]}>
        <Text style={[styles.label, { color: theme.color.text.secondary }]}>Environment</Text>
        <Text style={[styles.value, { color: theme.color.text.primary }]}>{profileLabel}</Text>
      </View>

      {/* App version */}
      <View style={[styles.section, { borderColor: theme.color.border }]}>
        <Text style={[styles.label, { color: theme.color.text.secondary }]}>Version</Text>
        <Text style={[styles.value, { color: theme.color.text.primary }]}>{appVersion}</Text>
      </View>

      {/* Sentry toggle */}
      <View style={[styles.row, { borderColor: theme.color.border }]}>
        <Text style={[styles.rowLabel, { color: theme.color.text.primary }]}>Error reporting (Sentry)</Text>
        <Switch
          testID="sentry-toggle"
          value={sentryEnabled}
          onValueChange={setSentryEnabled}
          trackColor={{ true: theme.color.action.primary }}
        />
      </View>

      {/* Sign out */}
      <TouchableOpacity
        testID="sign-out-button"
        style={[styles.button, { backgroundColor: theme.color.action.primary }]}
        onPress={() => void handleSignOut()}
      >
        <Text style={[styles.buttonText, { color: theme.color.text.primary }]}>Sign out</Text>
      </TouchableOpacity>

      {/* Dev-only profile switcher */}
      {__DEV__ && (
        <View style={styles.devSection}>
          <Text style={[styles.label, { color: theme.color.text.secondary }]}>Switch profile (dev only)</Text>
          {PROFILE_OPTIONS.map((p) => (
            <TouchableOpacity
              key={p}
              testID={`profile-option-${p}`}
              style={[styles.profileButton, { borderColor: theme.color.border }]}
              onPress={() => void handleSwitchProfile(p)}
            >
              <Text style={{ color: theme.color.text.primary }}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    gap: 4,
  },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  value: { fontSize: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
  },
  rowLabel: { fontSize: 16 },
  button: {
    marginTop: 32,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  devSection: { marginTop: 32, gap: 8 },
  profileButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
});
