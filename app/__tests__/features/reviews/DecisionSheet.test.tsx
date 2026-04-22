/* eslint-disable import/first */

// Mock config, auth, and logger before any module imports to prevent config parse errors.
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
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DecisionSheet } from '../../../src/features/reviews/components/DecisionSheet';
import * as queries from '../../../src/features/reviews/queries';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildMutate(impl?: jest.Mock) {
  return impl ?? jest.fn();
}

function mockUseDecide(opts: { mutate?: jest.Mock; isPending?: boolean } = {}) {
  const mutate = opts.mutate ?? jest.fn();
  jest.spyOn(queries, 'useDecide').mockReturnValue({
    mutate,
    isPending: opts.isPending ?? false,
    isError: false,
    isSuccess: false,
    isIdle: !opts.isPending,
    data: undefined,
    error: null,
    variables: undefined,
    reset: jest.fn(),
    status: opts.isPending ? 'pending' : 'idle',
    submittedAt: 0,
    failureCount: 0,
    failureReason: null,
    context: undefined,
  } as any); // test-only
  return mutate;
}

const baseProps = {
  visible: true,
  reviewId: 'rev-00000001',
  onClose: jest.fn(),
  onSuccess: jest.fn(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DecisionSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders both segmented buttons and defaults to approve selected', () => {
    mockUseDecide();
    render(<DecisionSheet {...baseProps} />);

    const approveBtn = screen.getByTestId('decision-segment-approve');
    const rejectBtn = screen.getByTestId('decision-segment-reject');
    expect(approveBtn).toBeTruthy();
    expect(rejectBtn).toBeTruthy();

    // Approve should be selected by default
    expect(approveBtn.props.accessibilityState?.selected).toBe(true);
    expect(rejectBtn.props.accessibilityState?.selected).toBe(false);
  });

  it('tapping decision-segment-reject switches selection to reject', () => {
    mockUseDecide();
    render(<DecisionSheet {...baseProps} />);

    fireEvent.press(screen.getByTestId('decision-segment-reject'));

    const approveBtn = screen.getByTestId('decision-segment-approve');
    const rejectBtn = screen.getByTestId('decision-segment-reject');
    expect(rejectBtn.props.accessibilityState?.selected).toBe(true);
    expect(approveBtn.props.accessibilityState?.selected).toBe(false);
  });

  it('calls onSuccess with "approve" when mutation resolves successfully (approve selected)', () => {
    const onSuccess = jest.fn();
    const mutate = buildMutate(
      jest.fn((_vars: unknown, callbacks?: { onSuccess?: () => void }) => {
        callbacks?.onSuccess?.();
      }),
    );
    mockUseDecide({ mutate });

    render(<DecisionSheet {...baseProps} onSuccess={onSuccess} />);

    fireEvent.press(screen.getByTestId('decision-submit'));

    expect(onSuccess).toHaveBeenCalledWith('approve');
    expect(screen.queryByTestId('decision-error-banner')).toBeNull();
  });

  it('calls onSuccess with "reject" when reject is selected and mutation resolves', () => {
    const onSuccess = jest.fn();
    const mutate = buildMutate(
      jest.fn((_vars: unknown, callbacks?: { onSuccess?: () => void }) => {
        callbacks?.onSuccess?.();
      }),
    );
    mockUseDecide({ mutate });

    render(<DecisionSheet {...baseProps} onSuccess={onSuccess} />);

    fireEvent.press(screen.getByTestId('decision-segment-reject'));
    fireEvent.press(screen.getByTestId('decision-submit'));

    expect(onSuccess).toHaveBeenCalledWith('reject');
  });

  it('shows decision-error-banner and does NOT call onSuccess when mutation rejects', () => {
    const onSuccess = jest.fn();
    const err = new Error('Server exploded');
    const mutate = buildMutate(
      jest.fn((_vars: unknown, callbacks?: { onError?: (e: unknown) => void }) => {
        callbacks?.onError?.(err);
      }),
    );
    mockUseDecide({ mutate });

    render(<DecisionSheet {...baseProps} onSuccess={onSuccess} />);

    fireEvent.press(screen.getByTestId('decision-submit'));

    expect(screen.getByTestId('decision-error-banner')).toBeTruthy();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onClose when decision-cancel is tapped', () => {
    const onClose = jest.fn();
    mockUseDecide();

    render(<DecisionSheet {...baseProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId('decision-cancel'));

    expect(onClose).toHaveBeenCalled();
  });
});
