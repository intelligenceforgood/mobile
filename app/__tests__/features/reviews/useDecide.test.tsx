/* eslint-disable import/first */

// Mock config and auth before any imports.
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { useDecide } from '../../../src/features/reviews/queries';
import { getApi, resetApi } from '../../../src/api';
import type { ReviewDetail } from '../../../src/features/reviews/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQc() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 }, mutations: { retry: false } },
  });
}

function makeWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

function seedReview(qc: QueryClient, reviewId: string, status = 'new') {
  const data: Partial<ReviewDetail> = {
    reviewId,
    caseId: 'case-00000001',
    status,
    priority: 'medium',
    queued_at: new Date().toISOString(),
    assigned_to: null,
    notes: null,
    last_updated: null,
  };
  qc.setQueryData(['review-detail', reviewId], data);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useDecide — contract', () => {
  beforeEach(() => {
    resetApi();
    jest.clearAllMocks();
  });

  it('happy path: optimistic update is applied synchronously, queue is invalidated after resolve', async () => {
    const qc = makeQc();
    const reviewId = 'rev-1';
    seedReview(qc, reviewId, 'new');

    // Seed an empty reviews-queue entry so getQueryState returns something.
    qc.setQueryData(['reviews-queue', { status: undefined, limit: 25 }], { items: [] });

    // Mock the API post to return a successful response.
    const apiInstance = getApi();
    jest.spyOn(apiInstance, 'post').mockResolvedValueOnce({ reviewId, status: 'approved' });

    const { result } = renderHook(() => useDecide(reviewId), {
      wrapper: makeWrapper(qc),
    });

    let mutatePromise: Promise<unknown>;

    await act(async () => {
      mutatePromise = result.current.mutateAsync({ decision: 'approve', auto_generate_report: false });
      // Give the onMutate callback time to run.
      await Promise.resolve();
    });

    // Optimistic update: status should be 'approved' before the promise settles.
    const optimistic = qc.getQueryData<Partial<ReviewDetail>>(['review-detail', reviewId]);
    expect(optimistic?.status).toBe('approved');

    // Wait for mutation to settle.
    await act(async () => {
      await mutatePromise!;
    });

    // After success, reviews-queue should be invalidated.
    const queueState = qc.getQueryState(['reviews-queue', { status: undefined, limit: 25 }]);
    // TanStack Query marks queries as stale/invalidated when invalidateQueries is called.
    // Either the query is marked as invalid or was refetched — both satisfy the contract.
    expect(queueState?.isInvalidated ?? true).toBe(true);
  });

  it('error path: cached status rolls back to original after mutation rejects', async () => {
    const qc = makeQc();
    const reviewId = 'rev-1';
    seedReview(qc, reviewId, 'new');

    // Mock the API post to reject.
    const apiInstance = getApi();
    jest.spyOn(apiInstance, 'post').mockRejectedValueOnce(new Error('Network timeout'));

    const { result } = renderHook(() => useDecide(reviewId), {
      wrapper: makeWrapper(qc),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({ decision: 'reject', auto_generate_report: false });
      } catch {
        // Expected — error is handled by the onError callback inside useDecide.
      }
    });

    // After rollback, status should be 'new' again.
    const rolled = qc.getQueryData<Partial<ReviewDetail>>(['review-detail', reviewId]);
    expect(rolled?.status).toBe('new');
  });
});
