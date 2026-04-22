import { config } from '@/config';
import { redactEvent } from './redact';

// Module-level flag — guards against double-init and exposes enabled state.
let _initialized = false;

/** True when a valid Sentry DSN is configured. Reflects the runtime enabled state. */
export let sentryEnabled = !!config.sentryDsn;

/**
 * Initialize Sentry once.
 * - No-ops when config.sentryDsn is falsy.
 * - Idempotent: safe to call multiple times (subsequent calls are ignored).
 */
export function initSentry(): void {
  if (!config.sentryDsn) {
    sentryEnabled = false;
    return;
  }
  if (_initialized) return;
  _initialized = true;
  sentryEnabled = true;

  // Lazy import avoids loading Sentry in __DEV__ fast-refresh cycles before init.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sentry = require('@sentry/react-native') as typeof import('@sentry/react-native');
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.profile,
    tracesSampleRate: 0.1,
    beforeSend: (event) =>
      redactEvent(event as unknown as Record<string, unknown>) as unknown as ReturnType<NonNullable<import('@sentry/react-native').ReactNativeOptions['beforeSend']>>,
  });
}
