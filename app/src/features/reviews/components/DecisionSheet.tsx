import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { mapErrorToBanner } from '@/api/errors';
import { useTheme } from '@/design/theme';
import { useDecide } from '../queries';

interface Props {
  visible: boolean;
  reviewId: string;
  onClose: () => void;
  onSuccess: (decision: 'approve' | 'reject') => void;
}

/**
 * Bottom-sheet modal for the Approve / Reject decision.
 * Uses the stdlib Modal — no additional dependency.
 */
export function DecisionSheet({ visible, reviewId, onClose, onSuccess }: Props) {
  const theme = useTheme();

  const [decision, setDecision] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Track the previous visible value to detect false → true transition.
  const prevVisibleRef = useRef(false);
  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      setDecision('approve');
      setNotes('');
      setBannerMessage(null);
    }
    prevVisibleRef.current = visible;
  }, [visible]);

  const { mutate, isPending } = useDecide(reviewId);

  function handleSubmit() {
    mutate(
      { decision, notes: notes.trim() || undefined, auto_generate_report: false },
      {
        onSuccess: () => {
          onSuccess(decision);
        },
        onError: (err) => {
          setBannerMessage(mapErrorToBanner(err));
        },
      },
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.color.surfaceAlt, borderColor: theme.color.border }]}>
          {/* ── Error banner ──────────────────────────────────────────────── */}
          {bannerMessage !== null && (
            <View
              style={[styles.banner, { backgroundColor: theme.color.error.background, borderColor: theme.color.error.border }]}
              testID="decision-error-banner"
            >
              <Text style={[styles.bannerText, { color: theme.color.error.text }]}>{bannerMessage}</Text>
            </View>
          )}

          {/* ── Segmented control ─────────────────────────────────────────── */}
          <View style={[styles.segment, { borderColor: theme.color.border }]}>
            <TouchableOpacity
              style={[
                styles.segmentItem,
                decision === 'approve' && { backgroundColor: theme.color.action.primary },
              ]}
              onPress={() => setDecision('approve')}
              testID="decision-segment-approve"
              accessibilityLabel="Approve"
              accessibilityRole="button"
              accessibilityState={{ selected: decision === 'approve' }}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: decision === 'approve' ? theme.color.on.badge : theme.color.text.secondary },
                ]}
              >
                Approve
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentItem,
                decision === 'reject' && { backgroundColor: theme.color.action.destructive },
              ]}
              onPress={() => setDecision('reject')}
              testID="decision-segment-reject"
              accessibilityLabel="Reject"
              accessibilityRole="button"
              accessibilityState={{ selected: decision === 'reject' }}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: decision === 'reject' ? theme.color.on.badge : theme.color.text.secondary },
                ]}
              >
                Reject
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Notes input ───────────────────────────────────────────────── */}
          <TextInput
            style={[
              styles.notesInput,
              { borderColor: theme.color.border, color: theme.color.text.primary, backgroundColor: theme.color.surface },
            ]}
            multiline
            placeholder="Add a comment (optional)"
            placeholderTextColor={theme.color.text.muted}
            maxLength={1000}
            value={notes}
            onChangeText={setNotes}
            testID="decision-notes"
            accessibilityLabel="Comment (optional)"
          />

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.color.border }]}
              onPress={onClose}
              disabled={isPending}
              testID="decision-cancel"
              accessibilityLabel="Cancel"
            >
              <Text style={[styles.cancelText, { color: theme.color.text.secondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: decision === 'approve' ? theme.color.action.primary : theme.color.action.destructive },
                isPending && styles.disabled,
              ]}
              onPress={handleSubmit}
              disabled={isPending}
              testID="decision-submit"
              accessibilityLabel={decision === 'approve' ? 'Submit Approve' : 'Submit Reject'}
            >
              {isPending ? (
                <ActivityIndicator size="small" color={theme.color.on.badge} />
              ) : (
                <Text style={[styles.submitText, { color: theme.color.on.badge }]}>
                  {decision === 'approve' ? 'Approve' : 'Reject'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 36,
    gap: 14,
  },
  banner: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  bannerText: {
    fontSize: 13,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesInput: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    minHeight: 80,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
