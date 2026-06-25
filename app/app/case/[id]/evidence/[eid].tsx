import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
  type PinchGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/design/theme';
import { config } from '@/config';
import { useEvidenceItem } from '@/features/evidence/queries';
import { useCase } from '@/features/reviews/queries';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_DISPLAY_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT * 0.6);

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/**
 * Evidence Detail screen — Sprint 3.
 * Route: /case/[id]/evidence/[eid] where id = review_id, eid = documentId.
 *
 * Renders an image with pinch-to-zoom via react-native-gesture-handler.
 * Falls back to a placeholder icon when the document has no binary (available=false).
 * For non-image MIME types, shows a document icon.
 *
 * Performance guardrail: expo-image loads only thumbnail/preview URL when mimeType is
 * not an image, and uses cachePolicy="memory-disk".
 */
export default function EvidenceDetailScreen() {
  const { id: reviewId, eid: documentId } = useLocalSearchParams<{ id: string; eid: string }>();
  const router = useRouter();
  const theme = useTheme();

  // Resolve caseId via review detail (will be in TanStack Query cache from Case Detail screen)
  const reviewQuery = useCase(reviewId ?? '');
  const caseId = reviewQuery.data?.caseId ?? '';

  const { data: doc, isLoading, isError, refetch } = useEvidenceItem(caseId, documentId ?? '');

  // Pinch-to-zoom state
  const [scale] = useState(() => new Animated.Value(1));
  const lastScale = useRef(1);
  const [hasError, setHasError] = useState(false);

  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], {
    useNativeDriver: true,
  });

  const onPinchStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current *= event.nativeEvent.scale;
      lastScale.current = Math.max(1, Math.min(lastScale.current, 4));
      Animated.spring(scale, {
        toValue: lastScale.current,
        useNativeDriver: true,
      }).start();
    }
  };

  const resetZoom = () => {
    lastScale.current = 1;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  const isImageMime = doc?.mimeType?.startsWith('image/') ?? false;
  const imageUri = isImageMime && doc?.available && doc?.sourceUrl
    ? doc.sourceUrl
    : null;
  // Construct the download URL for the evidence binary (if available)
  const binaryUrl = doc?.available
    ? `${config.apiBaseUrl}/cases/${caseId}/evidence/${documentId}`
    : null;
  const displayUri = imageUri ?? binaryUrl;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.color.surface }]}
        contentContainerStyle={styles.content}
        testID="evidence-detail-screen"
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.color.action.primary }]}>← Back</Text>
        </TouchableOpacity>

        {/* Image / placeholder */}
        <View style={styles.imageContainer}>
          {isLoading ? (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.color.surfaceAlt }]}>
              <Text style={[styles.placeholderIcon, { color: theme.color.text.muted }]}>⏳</Text>
            </View>
          ) : isError || !doc ? (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.color.surfaceAlt }]}>
              <Text style={[styles.placeholderIcon, { color: theme.color.text.muted }]}>⚠️</Text>
              <Text style={[styles.placeholderLabel, { color: theme.color.text.muted }]}>
                Could not load document metadata
              </Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: theme.color.action.primary }]}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : hasError || !displayUri ? (
            <View
              style={[styles.imagePlaceholder, { backgroundColor: theme.color.surfaceAlt }]}
              testID="evidence-fallback"
            >
              <Text style={[styles.placeholderIcon, { color: theme.color.text.muted }]}>
                {isImageMime ? '🖼' : '📄'}
              </Text>
              <Text style={[styles.placeholderLabel, { color: theme.color.text.muted }]}>
                {!doc.available ? 'No binary file linked' : 'Image failed to load'}
              </Text>
              {hasError && (
                <TouchableOpacity
                  onPress={() => setHasError(false)}
                  style={styles.retryButton}
                  testID="evidence-retry"
                >
                  <Text style={[styles.retryText, { color: theme.color.action.primary }]}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <PinchGestureHandler
              onGestureEvent={onPinchEvent}
              onHandlerStateChange={onPinchStateChange}
            >
              <Animated.View style={{ transform: [{ scale }] }}>
                <TouchableOpacity activeOpacity={1} onLongPress={resetZoom} accessibilityLabel="Long-press to reset zoom">
                  <Image
                    source={{ uri: displayUri }}
                    style={[styles.image, { width: MAX_DISPLAY_SIZE, height: MAX_DISPLAY_SIZE }]}
                    cachePolicy="memory-disk"
                    contentFit="contain"
                    onError={() => setHasError(true)}
                    testID="evidence-image"
                  />
                </TouchableOpacity>
              </Animated.View>
            </PinchGestureHandler>
          )}
        </View>

        {/* Metadata pane */}
        {doc && (
          <View
            style={[styles.metaCard, { backgroundColor: theme.color.surfaceAlt, borderColor: theme.color.border }]}
            testID="evidence-metadata"
          >
            <Text style={[styles.title, { color: theme.color.text.primary }]}>{doc.title}</Text>
            <MetaRow label="MIME type" value={doc.mimeType ?? '—'} theme={theme} />
            <MetaRow label="Ingested" value={formatDate(doc.ingestedAt)} theme={theme} />
            <MetaRow label="Source URL" value={doc.sourceUrl ?? '—'} theme={theme} />
            <MetaRow label="Available" value={doc.available ? 'Yes' : 'No'} theme={theme} />
            {doc.fileSha256 && (
              <MetaRow label="File SHA-256" value={`${doc.fileSha256.slice(0, 12)}…`} theme={theme} />
            )}
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

function MetaRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof import('@/design/theme').useTheme>;
}) {
  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaLabel, { color: theme.color.text.muted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: theme.color.text.primary }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  backButton: { marginBottom: 12 },
  backText: { fontSize: 14, fontWeight: '600' },
  imageContainer: { alignItems: 'center', marginBottom: 16 },
  imagePlaceholder: {
    width: MAX_DISPLAY_SIZE,
    height: MAX_DISPLAY_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 48, marginBottom: 12 },
  placeholderLabel: { fontSize: 13, textAlign: 'center', paddingHorizontal: 20 },
  image: { borderRadius: 12 },
  retryButton: { marginTop: 12 },
  retryText: { fontSize: 14, fontWeight: '600' },
  metaCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  metaLabel: { fontSize: 12, flex: 1 },
  metaValue: { fontSize: 12, flex: 2, textAlign: 'right' },
});
