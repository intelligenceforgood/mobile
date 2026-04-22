import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { auth } from '@/auth';
import { config } from '@/config';
import { mapErrorToBanner } from '@/api/errors';

/**
 * Sign-in screen — Sprint 1.
 * One primary button whose label depends on the auth provider.
 * On press: calls auth.signIn(), then navigates to Dashboard.
 */
export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buttonLabel =
    config.authProvider === 'google-pkce-iap'
      ? 'Continue with Google'
      : 'Continue as Local Analyst';

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await auth.signIn();
      router.replace('/(tabs)/dashboard');
    } catch (err) {
      setError(mapErrorToBanner(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>I4G</Text>
      <Text style={styles.subtitle}>Intelligence for Good</Text>

      {error && <Text style={styles.errorBanner}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 48,
  },
  errorBanner: {
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlign: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: '#1a56db',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});
