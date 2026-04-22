/* eslint-disable import/first */
/**
 * Contract test for useReport() covering:
 * 1. Bearer-stream branch  — report status="completed", returns { kind: "stream", url, headers }
 * 2. Not-ready branch      — report status="queued",    returns { kind: "not_ready" }
 * 3. 404 / missing branch  — reportId not in library,   rejects with Error
 *
 * Note: MSW is not installed; tests use jest.fn() to mock fetch (same pattern as other tests).
 */
jest.mock('../../../src/config', () => ({
  config: {
    authProvider: 'mock',
    apiBaseUrl: 'http://localhost:8000',
    profile: 'local',
    apiMode: 'direct',
  },
}));

const mockGetAccessToken = jest.fn().mockResolvedValue('test-token-abc');

jest.mock('../../../src/auth', () => ({
  auth: {
    kind: 'mock',
    initialize: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getAccessToken: mockGetAccessToken,
    getUser: jest.fn().mockResolvedValue(null),
    onChange: jest.fn(() => () => {}),
  },
}));

jest.mock('../../../src/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReport } from '../../../src/features/reports/queries';
import { resetApi } from '../../../src/api';

function makeQc() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } });
}

function Wrapper({ children, qc }: { children: React.ReactNode; qc: QueryClient }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
Wrapper.displayName = 'QueryWrapper';

function wrapper(qc: QueryClient) {
  function W({ children }: { children: React.ReactNode }) {
    return <Wrapper qc={qc}>{children}</Wrapper>;
  }
  W.displayName = 'Wrapper';
  return W;
}

function mockFetch(body: unknown, status = 200) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response);
}

const LIBRARY_RESPONSE_COMPLETED = {
  items: [
    {
      reportId: 'report-aaa',
      template: 'case_summary',
      scope: 'Platform-wide',
      tlp: 'TLP:AMBER',
      status: 'completed',
      createdAt: '2026-04-22T10:00:00Z',
      createdBy: 'local-dev',
    },
  ],
  count: 1,
};

const LIBRARY_RESPONSE_QUEUED = {
  items: [
    {
      reportId: 'report-bbb',
      template: 'case_summary',
      scope: 'Platform-wide',
      tlp: 'TLP:AMBER',
      status: 'queued',
      createdAt: '2026-04-22T10:00:00Z',
      createdBy: 'local-dev',
    },
  ],
  count: 1,
};

const LIBRARY_RESPONSE_EMPTY = { items: [], count: 0 };

beforeEach(() => {
  resetApi();
  jest.clearAllMocks();
});

describe('useReport — bearer-stream branch', () => {
  it('returns { kind: "stream", url, headers } when report status is "completed"', async () => {
    const qc = makeQc();
    mockFetch(LIBRARY_RESPONSE_COMPLETED);

    const { result } = renderHook(() => useReport('report-aaa'), { wrapper: wrapper(qc) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.kind).toBe('stream');
    if (result.current.data?.kind === 'stream') {
      expect(result.current.data.url).toBe('http://localhost:8000/reports/report-aaa/download');
      expect(result.current.data.headers['Authorization']).toBe('Bearer test-token-abc');
      expect(result.current.data.meta.reportId).toBe('report-aaa');
    }
  });
});

describe('useReport — not-ready branch', () => {
  it('returns { kind: "not_ready" } when report status is "queued"', async () => {
    const qc = makeQc();
    mockFetch(LIBRARY_RESPONSE_QUEUED);

    const { result } = renderHook(() => useReport('report-bbb'), { wrapper: wrapper(qc) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.kind).toBe('not_ready');
    if (result.current.data?.kind === 'not_ready') {
      expect(result.current.data.meta.status).toBe('queued');
    }
  });
});

describe('useReport — 404 / missing branch', () => {
  it('surfaces an error when reportId is not in the library', async () => {
    const qc = makeQc();
    mockFetch(LIBRARY_RESPONSE_EMPTY);

    const { result } = renderHook(() => useReport('report-missing'), { wrapper: wrapper(qc) });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toContain('report-missing');
  });
});
