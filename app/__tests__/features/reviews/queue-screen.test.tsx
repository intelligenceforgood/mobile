/* eslint-disable import/first */
jest.mock('../../../src/config', () => ({
  config: {
    authProvider: 'mock',
    apiBaseUrl: 'http://localhost:8000',
    profile: 'local',
    apiMode: 'direct',
  },
}));

jest.mock('../../../src/auth', () => ({
  auth: {
    kind: 'mock',
    initialize: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getAccessToken: jest.fn().mockResolvedValue(null),
    getUser: jest.fn().mockResolvedValue(null),
    onChange: jest.fn(() => () => {}),
  },
}));

jest.mock('../../../src/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import QueueScreen from '../../../app/(tabs)/queue';
import { resetApi } from '../../../src/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeQc() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } });
}

function Wrapper({ children, qc }: { children: React.ReactNode; qc: QueryClient }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

function makeItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    review_id: `rev-${i}`,
    case_id: `case-${String(i).padStart(4, '0')}`,
    queued_at: new Date(Date.now() - i * 60_000).toISOString(),
    priority: 'medium',
    status: 'new',
    assigned_to: null,
    notes: null,
    last_updated: null,
    classification_result: null,
    tags: null,
  }));
}

type MockEntry = { url: string | RegExp; body: unknown; status?: number };

function mockFetch(responses: MockEntry[]) {
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    for (const r of responses) {
      const matched = r.url instanceof RegExp ? r.url.test(url) : url.includes(r.url as string);
      if (matched) {
        const status = r.status ?? 200;
        return {
          ok: status >= 200 && status < 300,
          status,
          json: async () => r.body,
          text: async () => JSON.stringify(r.body),
        } as Response;
      }
    }
    throw new Error(`Unmocked fetch: ${url}`);
  });
}

beforeEach(() => {
  resetApi();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------
describe('QueueScreen — happy path', () => {
  it('renders queue rows from the API response', async () => {
    const qc = makeQc();
    mockFetch([{ url: '/reviews/queue', body: { items: makeItems(3), count: 3 } }]);

    render(
      <Wrapper qc={qc}>
        <QueueScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      // case-0000 is the first item — verify it renders
      expect(screen.getByText('case-0000')).toBeTruthy();
    });
  });
});

// ---------------------------------------------------------------------------
// Empty path
// ---------------------------------------------------------------------------
describe('QueueScreen — empty path', () => {
  it('renders the empty state when items is empty', async () => {
    const qc = makeQc();
    mockFetch([{ url: '/reviews/queue', body: { items: [], count: 0 } }]);

    render(
      <Wrapper qc={qc}>
        <QueueScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('queue-empty')).toBeTruthy();
    });
  });
});

// ---------------------------------------------------------------------------
// Paginated path — progressive limit
// ---------------------------------------------------------------------------
describe('QueueScreen — load more', () => {
  it('shows load-more button when items.length === limit (25)', async () => {
    const qc = makeQc();
    mockFetch([{ url: '/reviews/queue', body: { items: makeItems(25), count: 25 } }]);

    render(
      <Wrapper qc={qc}>
        <QueueScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('load-more')).toBeTruthy();
    });
  });

  it('pressing load-more refetches with limit=50', async () => {
    const qc = makeQc();
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('limit=50')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: makeItems(40), count: 40 }),
          text: async () => '',
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ items: makeItems(25), count: 25 }),
        text: async () => '',
      } as Response;
    });

    render(
      <Wrapper qc={qc}>
        <QueueScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('load-more')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('load-more'));

    await waitFor(() => {
      const calls = fetchMock.mock.calls.map(([url]: [RequestInfo, RequestInit?]) => String(url));
      expect(calls.some((u) => u.includes('limit=50'))).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Error path
// ---------------------------------------------------------------------------
describe('QueueScreen — error path', () => {
  it('shows the inline error banner on fetch failure', async () => {
    const qc = makeQc();
    mockFetch([{ url: '/reviews/queue', body: { detail: 'Server error' }, status: 500 }]);

    render(
      <Wrapper qc={qc}>
        <QueueScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeTruthy();
    });
  });

  it('retry button triggers a refetch', async () => {
    const qc = makeQc();
    let callCount = 0;

    jest.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      callCount++;
      return {
        ok: false,
        status: 500,
        json: async () => ({ detail: 'err' }),
        text: async () => '{"detail":"err"}',
      } as Response;
    });

    render(
      <Wrapper qc={qc}>
        <QueueScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeTruthy();
    });

    const countBefore = callCount;
    fireEvent.press(screen.getByText('Retry'));

    await waitFor(() => {
      expect(callCount).toBeGreaterThan(countBefore);
    });
  });
});

// ---------------------------------------------------------------------------
// Pull-to-refresh
// ---------------------------------------------------------------------------
describe('QueueScreen — pull-to-refresh', () => {
  it('triggers a refetch on pull-to-refresh gesture', async () => {
    const qc = makeQc();
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: makeItems(2), count: 2 }),
      text: async () => '',
    } as Response);

    render(
      <Wrapper qc={qc}>
        <QueueScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('case-0000')).toBeTruthy();
    });

    const callsBefore = fetchMock.mock.calls.length;

    // Simulate pull-to-refresh by invalidating via the queryClient directly
    await qc.invalidateQueries({ queryKey: ['reviews-queue'] });

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});
