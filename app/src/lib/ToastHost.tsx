import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/design/theme';
import { useStore } from '@/store/ui';
import type { Toast } from '@/store/ui';

/** Green stand-in until the design-token pipeline adds a semantic success color. */
const SUCCESS_COLOR = '#16A34A';

function pillColor(variant: Toast['variant'], theme: ReturnType<typeof useTheme>): string {
  switch (variant) {
    case 'success':
      return SUCCESS_COLOR;
    case 'error':
      return theme.color.error.buttonBackground;
    case 'warning':
      return theme.color.action.destructive;
    default:
      return theme.color.surfaceAlt;
  }
}

/**
 * Renders Zustand toasts as stacked pills in an absolute overlay at the bottom of
 * the screen. Each toast auto-dismisses after 3 s. The container uses
 * `pointerEvents="box-none"` so touches pass through to the content below.
 */
export function ToastHost() {
  const theme = useTheme();
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const toast of toasts) {
      if (seenRef.current.has(toast.id)) continue;
      seenRef.current.add(toast.id);
      timers.push(
        setTimeout(() => {
          dismiss(toast.id);
        }, 3000),
      );
    }
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none" testID="toast-host">
      {toasts.map((toast) => (
        <View
          key={toast.id}
          style={[styles.pill, { backgroundColor: pillColor(toast.variant, theme) }]}
          testID={`toast-${toast.variant ?? 'info'}`}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          <Text style={[styles.pillText, { color: theme.color.on.badge }]}>{toast.message}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    maxWidth: 320,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
