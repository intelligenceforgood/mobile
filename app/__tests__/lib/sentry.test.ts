/* eslint-disable import/first */

// ─── Mock @sentry/react-native before any imports ───────────────────────────
const mockSentryInit = jest.fn();
const mockAddBreadcrumb = jest.fn();

jest.mock('@sentry/react-native', () => ({
  init: mockSentryInit,
  addBreadcrumb: mockAddBreadcrumb,
}));

// Mock config so we can control sentryDsn per test.
let mockSentryDsn = '';
jest.mock('../../src/config', () => ({
  get config() {
    return {
      profile: 'local' as const,
      apiMode: 'direct' as const,
      apiBaseUrl: 'http://localhost:8000',
      authProvider: 'mock' as const,
      sentryDsn: mockSentryDsn,
    };
  },
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('initSentry', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockSentryDsn = '';
  });

  it('is a no-op when sentryDsn is empty', () => {
    mockSentryDsn = '';
    // Re-require after resetting modules so the module sees the updated config.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initSentry, sentryEnabled } = require('../../src/lib/sentry') as typeof import('../../src/lib/sentry');
    initSentry();
    expect(mockSentryInit).not.toHaveBeenCalled();
    expect(sentryEnabled).toBe(false);
  });

  it('calls Sentry.init with dsn and environment when DSN is set', () => {
    mockSentryDsn = 'https://abc@sentry.io/123';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initSentry } = require('../../src/lib/sentry') as typeof import('../../src/lib/sentry');
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://abc@sentry.io/123',
        environment: 'local',
        tracesSampleRate: 0.1,
        beforeSend: expect.any(Function),
      }),
    );
  });

  it('is idempotent — second call does not re-initialise', () => {
    mockSentryDsn = 'https://abc@sentry.io/123';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initSentry } = require('../../src/lib/sentry') as typeof import('../../src/lib/sentry');
    initSentry();
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledTimes(1);
  });

  it('beforeSend routes through redactEvent', () => {
    mockSentryDsn = 'https://abc@sentry.io/123';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initSentry } = require('../../src/lib/sentry') as typeof import('../../src/lib/sentry');
    initSentry();

    const [[sentryInitArgs]] = mockSentryInit.mock.calls as [[{ beforeSend: (e: Record<string, unknown>) => Record<string, unknown> }]];
    const beforeSend = sentryInitArgs.beforeSend;

    // A Sentry event with PII in user.email should have it redacted.
    const event = {
      user: { email: 'analyst@example.com', id: 'u1' },
      message: 'test',
    };
    const result = beforeSend(event) as { user: { email: string }; message: string };
    expect(result.user.email).toBe('[REDACTED]');
    expect(result.message).toBe('test');
  });
});
