import { QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { auth } from '@/auth';
import { ErrorBoundary } from '@/lib/error-boundary';
import { queryClient } from '@/lib/query-client';
import { useStore } from '@/store/ui';

/**
 * Root layout — Sprint 1.
 * Wraps the app in: QueryClientProvider → ErrorBoundary → auth-gate → Slot.
 * Renders a full-screen spinner until auth is initialized.
 * Redirects to /sign-in when no user is present.
 */
export default function RootLayout() {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const user = useStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    auth.initialize().then(() => {
      setIsAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!user) {
      router.replace('/sign-in');
    }
  }, [isAuthReady, user, router]);

  if (!isAuthReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Slot />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
