import { redactObject } from './redact';

/** Log levels. */
type LogLevel = 'info' | 'warn' | 'error';

function isProduction(): boolean {
  // Avoid importing config here to keep logger dep-free.
  // `__DEV__` is a React Native global set to false in production bundles.
  return !__DEV__;
}

function format(level: LogLevel, tag: string, data: unknown): void {
  const redacted = redactObject(data);
  if (isProduction()) {
    // In production: route to Sentry as a breadcrumb if Sentry is available.
    // Sentry init happens in Sprint 5; for now this is a no-op.
    return;
  }
  const prefix = `[${level.toUpperCase()}] ${tag}`;
  if (level === 'error') {
    console.error(prefix, redacted);
  } else if (level === 'warn') {
    console.warn(prefix, redacted);
  } else {
    // eslint-disable-next-line no-console
    console.log(prefix, redacted);
  }
}

export const logger = {
  info: (tag: string, data?: unknown) => format('info', tag, data ?? {}),
  warn: (tag: string, data?: unknown) => format('warn', tag, data ?? {}),
  error: (tag: string, data?: unknown) => format('error', tag, data ?? {}),
};
