import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/design/theme';
import type { EvidenceDocument } from '../types';

interface Props {
  caseId: string;
  documents: EvidenceDocument[];
  /** Called when the user taps a document thumbnail. */
  onPress: (doc: EvidenceDocument) => void;
}

const TILE_SIZE = 88;

function DocTile({ doc, onPress }: { doc: EvidenceDocument; onPress: (doc: EvidenceDocument) => void }) {
  const theme = useTheme();
  const isImage = doc.mimeType?.startsWith('image/') ?? false;

  return (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: theme.color.surfaceAlt, borderColor: theme.color.border }]}
      onPress={() => onPress(doc)}
      testID={`evidence-tile-${doc.documentId}`}
      accessibilityLabel={doc.title}
    >
      {isImage && doc.available && doc.sourceUrl ? (
        <Image
          source={{ uri: doc.sourceUrl }}
          style={styles.thumb}
          cachePolicy="memory-disk"
          contentFit="cover"
        />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: theme.color.border }]}>
          <Text style={[styles.placeholderIcon, { color: theme.color.text.muted }]}>
            {isImage ? '🖼' : '📄'}
          </Text>
        </View>
      )}
      <Text style={[styles.label, { color: theme.color.text.muted }]} numberOfLines={2}>
        {doc.title}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Grid of evidence document thumbnails.
 * Tapping a tile calls onPress(doc) — the caller routes to Evidence Detail.
 */
export function EvidenceGrid({ documents, onPress }: Props) {
  const theme = useTheme();

  const renderItem = useCallback(
    ({ item }: { item: EvidenceDocument }) => <DocTile doc={item} onPress={onPress} />,
    [onPress],
  );
  const keyExtractor = useCallback((item: EvidenceDocument) => item.documentId, []);

  if (documents.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.color.text.muted }]}>No evidence documents.</Text>
      </View>
    );
  }

  return (
    <FlatList<EvidenceDocument>
      data={documents}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={3}
      scrollEnabled={false}
      columnWrapperStyle={styles.row}
      testID="evidence-grid"
    />
  );
}

const styles = StyleSheet.create({
  row: { gap: 6, marginBottom: 6 },
  tile: {
    width: TILE_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumb: { width: TILE_SIZE, height: TILE_SIZE },
  placeholder: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 28 },
  label: { fontSize: 10, padding: 4, lineHeight: 14 },
  empty: { paddingVertical: 8 },
  emptyText: { fontSize: 13 },
});
