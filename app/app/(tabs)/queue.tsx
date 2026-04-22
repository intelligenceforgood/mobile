import { useCallback, useRef, useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { mapErrorToBanner } from '@/api/errors';
import { useTheme } from '@/design/theme';
import { FilterBar } from '@/features/reviews/components/FilterBar';
import type { FilterBarValue } from '@/features/reviews/components/FilterBar';
import { QueueRow } from '@/features/reviews/components/QueueRow';
import { SearchBox } from '@/features/reviews/components/SearchBox';
import { useReviewsQueue } from '@/features/reviews/queries';
import type { ReviewQueueItem } from '@/features/reviews/types';
import { useStore } from '@/store/ui';

const PAGE_SIZE = 25;

function SkeletonRow() {
  const theme = useTheme();
  return (
    <View style={[skStyles.row, { borderColor: theme.color.border, backgroundColor: theme.color.surfaceAlt }]}>
      <View style={[skStyles.line, { backgroundColor: theme.color.border, width: '50%' }]} />
      <View style={[skStyles.line, { backgroundColor: theme.color.border, width: '30%', marginTop: 6 }]} />
    </View>
  );
}

const skStyles = StyleSheet.create({
  row: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
  line: { height: 14, borderRadius: 4 },
});

export default function QueueScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const router = useRouter();
  const listRef = useRef<FlatList<ReviewQueueItem> | null>(null);

  const [filter, setFilter] = useState<FilterBarValue>({ status: undefined, priority: undefined });
  const setCurrentQueueFilter = useStore((s) => s.setCurrentQueueFilter);
  const [searchQ, setSearchQ] = useState('');

  // Keep the global store in sync so other screens (e.g. case/[id]) can do filter-aware routing.
  useEffect(() => {
    setCurrentQueueFilter(filter);
  }, [filter, setCurrentQueueFilter]);

  const [limit, setLimit] = useState(PAGE_SIZE);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data, isLoading, isError, error, isFetching } = useReviewsQueue({
    status: filter.status,
    limit,
  });

  const items = (data?.items ?? []) as ReviewQueueItem[];

  const visibleItems = items.filter((item) => {
    if (filter.priority && item.priority !== filter.priority) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return item.case_id.toLowerCase().includes(q) || item.review_id.toLowerCase().includes(q);
    }
    return true;
  });

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['reviews-queue', { status: filter.status, limit }] });
  }, [queryClient, filter.status, limit]);

  const handleLoadMore = useCallback(() => {
    setLimit((prev) => prev + PAGE_SIZE);
  }, []);

  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    setShowScrollTop(event.nativeEvent.contentOffset.y > 5 * 64);
  }, []);

  const handleRetry = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['reviews-queue', { status: filter.status, limit }] });
  }, [queryClient, filter.status, limit]);

  const handleRowPress = useCallback(
    (item: ReviewQueueItem) => {
      router.push(`/case/${item.review_id}`);
    },
    [router],
  );

  const canLoadMore = items.length >= limit;

  return (
    <View style={[styles.container, { backgroundColor: theme.color.surface }]}>
      <Text style={[styles.title, { color: theme.color.text.primary }]}>Reviews Queue</Text>

      <SearchBox onDebouncedChange={setSearchQ} />
      <FilterBar value={filter} onChange={setFilter} />

      {isError && (
        <View style={[styles.errorCard, { backgroundColor: '#fef2f2' }]}>
          <Text style={styles.errorText}>{mapErrorToBanner(error)}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View testID="queue-skeleton">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      ) : visibleItems.length === 0 && !isError ? (
        <View style={styles.emptyState} testID="queue-empty">
          <Text style={[styles.emptyText, { color: theme.color.text.muted }]}>No items in the queue.</Text>
        </View>
      ) : (
        <FlatList<ReviewQueueItem>
          ref={listRef}
          data={visibleItems}
          keyExtractor={(item) => item.review_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleRowPress(item)} testID={`queue-row-${item.review_id}`}>
              <QueueRow item={item} />
            </TouchableOpacity>
          )}
          onScroll={handleScroll}
          scrollEventThrottle={200}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={handleRefresh}
              tintColor={theme.color.action.primary}
            />
          }
          ListFooterComponent={
            canLoadMore ? (
              <TouchableOpacity onPress={handleLoadMore} style={styles.loadMoreButton} testID="load-more">
                <Text style={[styles.loadMoreText, { color: theme.color.action.primary }]}>Load more</Text>
              </TouchableOpacity>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {showScrollTop && (
        <TouchableOpacity
          onPress={handleScrollToTop}
          style={[styles.scrollTopButton, { backgroundColor: theme.color.action.primary }]}
          testID="scroll-to-top"
        >
          <Text style={styles.scrollTopText}>↑ Top</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  retryText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadMoreText: {
    fontWeight: '600',
    fontSize: 14,
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scrollTopText: {
    color: '#fff',
    fontWeight: '600',
  },
});

