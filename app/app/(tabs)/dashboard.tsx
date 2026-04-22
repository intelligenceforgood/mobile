import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/ui';
import { useWhoAmI } from '@/features/reviews/queries';
import { mapErrorToBanner } from '@/api/errors';

/**
 * Dashboard screen — Sprint 1.
 * Renders "Signed in as {user.name}" from the Zustand store.
 * Calls useWhoAmI() to hydrate with real backend data; shows a loading skeleton
 * while pending and an error banner on failure.
 */
export default function DashboardScreen() {
  const queryClient = useQueryClient();
  const storeUser = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);

  const { data: whoami, isLoading, isError, error } = useWhoAmI();

  // Hydrate the store user from whoami when it resolves.
  if (whoami && (!storeUser || storeUser.email !== whoami.email)) {
    setUser({
      email: whoami.email,
      name: whoami.displayName ?? whoami.email,
      roles: [whoami.role],
    });
  }

  const displayName = storeUser?.name ?? 'Loading…';

  const handleRetry = () => {
    void queryClient.invalidateQueries({ queryKey: ['whoami'] });
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.skeleton}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, styles.skeletonShort]} />
        </View>
      ) : isError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{mapErrorToBanner(error)}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Text style={styles.greeting}>Signed in as {displayName}</Text>

      {storeUser && (
        <>
          <Text style={styles.detail}>{storeUser.email}</Text>
          <Text style={styles.detail}>Roles: {storeUser.roles.join(', ')}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
    marginTop: 16,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  skeleton: {
    marginBottom: 16,
  },
  skeletonLine: {
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  skeletonShort: {
    width: '40%',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#b91c1c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
