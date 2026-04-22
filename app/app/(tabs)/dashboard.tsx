import { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { mapErrorToBanner } from '@/api/errors';
import { useTheme } from '@/design/theme';
import { ActivityRow } from '@/features/dashboard/components/ActivityRow';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { useDashboard } from '@/features/dashboard/queries';
import { useWhoAmI } from '@/features/reviews/queries';
import { useStore } from '@/store/ui';
import type { DashboardMetric } from '@/features/dashboard/types';

function SkeletonBlock({ width }: { width: string }) {
  const theme = useTheme();
  return (
    <View
      style={[
        skStyles.block,
        { backgroundColor: theme.color.border, width: width as `${number}%` },
      ]}
    />
  );
}

const skStyles = StyleSheet.create({
  block: { height: 16, borderRadius: 4, marginBottom: 8 },
});

export default function DashboardScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const storeUser = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);

  const { data: whoami, isLoading: whoamiLoading, isError: whoamiError, error: whoamiErr } = useWhoAmI();
  const { data: overview, isLoading: overviewLoading, isError: overviewError, error: overviewErr, isFetching } = useDashboard();

  // Hydrate the store user from whoami when it resolves.
  if (whoami && (!storeUser || storeUser.email !== whoami.email)) {
    setUser({
      email: whoami.email,
      name: whoami.displayName ?? whoami.email,
      roles: [whoami.role],
    });
  }

  const displayName = storeUser?.name ?? (whoamiLoading ? 'Loading…' : 'Analyst');

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['whoami'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
  }, [queryClient]);

  const handleRetryWhoami = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['whoami'] });
  }, [queryClient]);

  const handleRetryOverview = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
  }, [queryClient]);

  const isLoading = whoamiLoading || overviewLoading;
  const metrics: DashboardMetric[] = overview?.metrics ?? [];
  const activity = overview?.activity ?? [];
  const isEmpty = !isLoading && !overviewError && metrics.length === 0 && activity.length === 0;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.color.surface }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !isLoading}
          onRefresh={handleRefresh}
          tintColor={theme.color.action.primary}
        />
      }
    >
      {/* Greeting header */}
      {isLoading ? (
        <View style={styles.skeletonHeader} testID="dashboard-skeleton">
          <SkeletonBlock width="60%" />
          <SkeletonBlock width="40%" />
        </View>
      ) : (
        <>
          <Text style={[styles.greeting, { color: theme.color.text.primary }]}>
            Hello, {displayName}
          </Text>
          {storeUser && (
            <Text style={[styles.role, { color: theme.color.text.muted }]}>
              {storeUser.roles.join(', ')}
            </Text>
          )}
        </>
      )}

      {/* whoami error banner */}
      {whoamiError && (
        <View style={styles.errorCard} testID="whoami-error-banner">
          <Text style={styles.errorText}>{mapErrorToBanner(whoamiErr)}</Text>
          <TouchableOpacity onPress={handleRetryWhoami} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Overview error banner */}
      {overviewError && (
        <View style={styles.errorCard} testID="overview-error-banner">
          <Text style={styles.errorText}>{mapErrorToBanner(overviewErr)}</Text>
          <TouchableOpacity onPress={handleRetryOverview} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Metrics grid */}
      {isLoading ? (
        <View style={styles.metricsGrid} testID="metrics-skeleton">
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.skeletonCard,
                { backgroundColor: theme.color.surfaceAlt, borderColor: theme.color.border },
              ]}
            />
          ))}
        </View>
      ) : isEmpty ? (
        <View style={styles.emptyState} testID="dashboard-empty">
          <Text style={[styles.emptyText, { color: theme.color.text.muted }]}>Nothing to show yet.</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: theme.color.text.secondary }]}>Overview</Text>
          <View style={styles.metricsGrid} testID="metrics-grid">
            {metrics.map((m, i) => (
              <MetricCard key={i} metric={m} />
            ))}
          </View>

          {activity.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.color.text.secondary }]}>
                Recent activity
              </Text>
              <View testID="activity-list">
                {activity.map((a, i) => (
                  <ActivityRow key={a.id ?? i} item={a} />
                ))}
              </View>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  skeletonHeader: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  role: {
    fontSize: 13,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  skeletonCard: {
    flex: 1,
    minWidth: '45%',
    height: 80,
    borderWidth: 1,
    borderRadius: 10,
    margin: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
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
  },
  retryText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
});

