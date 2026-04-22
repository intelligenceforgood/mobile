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

import DashboardScreen from '../../../app/(tabs)/dashboard';
import { resetApi } from '../../../src/api';
import { useStore } from '../../../src/store/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeQc() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } });
}

function Wrapper({ children, qc }: { children: React.ReactNode; qc: QueryClient }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

const WHOAMI = { email: 'analyst@i4g.local', role: 'analyst', displayName: 'Test Analyst', isActive: true };
const OVERVIEW_HAPPY = {
  metrics: [
    { label: 'Active investigations', value: '5', change: '+1' },
    { label: 'Pending reviews', value: '3', change: '' },
    { label: 'Approved today', value: '2', change: '' },
  ],
  alerts: [],
  activity: [{ id: 'a1', title: 'Case XYZ approved', actor: 'analyst@i4g.local', when: '2h ago' }],
};
const OVERVIEW_EMPTY = { metrics: [], alerts: [], activity: [] };

function mockFetch(responses: { url: string | RegExp; body: unknown; status?: number }[]) {
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
  useStore.setState({ user: null });
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------
describe('DashboardScreen — happy path', () => {
  it('renders 3+ metric cards', async () => {
    const qc = makeQc();
    mockFetch([
      { url: '/accounts/me', body: WHOAMI },
      { url: '/dashboard/overview', body: OVERVIEW_HAPPY },
    ]);

    render(
      <Wrapper qc={qc}>
        <DashboardScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('metrics-grid')).toBeTruthy();
    });

    expect(screen.getByText('Active investigations')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('renders recent-activity list', async () => {
    const qc = makeQc();
    mockFetch([
      { url: '/accounts/me', body: WHOAMI },
      { url: '/dashboard/overview', body: OVERVIEW_HAPPY },
    ]);

    render(
      <Wrapper qc={qc}>
        <DashboardScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('activity-list')).toBeTruthy();
    });

    expect(screen.getByText('Case XYZ approved')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Empty path
// ---------------------------------------------------------------------------
describe('DashboardScreen — empty path', () => {
  it('renders the empty state when metrics and activity are both empty', async () => {
    const qc = makeQc();
    mockFetch([
      { url: '/accounts/me', body: WHOAMI },
      { url: '/dashboard/overview', body: OVERVIEW_EMPTY },
    ]);

    render(
      <Wrapper qc={qc}>
        <DashboardScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-empty')).toBeTruthy();
    });
  });
});

// ---------------------------------------------------------------------------
// Error path
// ---------------------------------------------------------------------------
describe('DashboardScreen — error path', () => {
  it('shows the overview error banner with retry button', async () => {
    const qc = makeQc();
    mockFetch([
      { url: '/accounts/me', body: WHOAMI },
      { url: '/dashboard/overview', body: { detail: 'Server error' }, status: 500 },
    ]);

    render(
      <Wrapper qc={qc}>
        <DashboardScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('overview-error-banner')).toBeTruthy();
    });

    expect(screen.getAllByText('Retry').length).toBeGreaterThanOrEqual(1);
  });

  it('retry button triggers a refetch', async () => {
    const qc = makeQc();
    let callCount = 0;

    jest.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/accounts/me')) {
        return { ok: true, status: 200, json: async () => WHOAMI, text: async () => JSON.stringify(WHOAMI) } as Response;
      }
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
        <DashboardScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('overview-error-banner')).toBeTruthy();
    });

    const countBefore = callCount;
    fireEvent.press(screen.getAllByText('Retry')[0]);

    await waitFor(() => {
      expect(callCount).toBeGreaterThan(countBefore);
    });
  });
});
