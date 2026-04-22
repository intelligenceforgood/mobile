import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { auth } from '@/auth';
import { ErrorBoundary } from '@/lib/error-boundary';
import { queryClient } from '@/lib/query-client';
import { ToastHost } from '@/lib/ToastHost';
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
    <GestureHandlerRootView style={styles.flex}>
      <QueryClientProvider client={queryClient}>
        <ToastHost />
        <ErrorBoundary>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="case/[id]" options={{ title: 'Case', headerBackTitle: 'Back' }} />
          </Stack>
        </ErrorBoundary>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
