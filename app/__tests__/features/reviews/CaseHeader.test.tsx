import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CaseHeader } from '../../../src/features/reviews/components/CaseHeader';
import type { ReviewDetail } from '../../../src/features/reviews/types';

function makeReview(overrides: Partial<ReviewDetail> = {}): ReviewDetail {
  return {
    reviewId: 'rev-00000001',
    caseId: 'case-000000000000',
    status: 'new',
    priority: 'high',
    queued_at: new Date(Date.now() - 5 * 60_000).toISOString(),
    assigned_to: null,
    notes: null,
    last_updated: null,
    ...overrides,
  };
}

describe('CaseHeader', () => {
  it('renders the case-header testID', () => {
    render(<CaseHeader review={makeReview()} />);
    expect(screen.getByTestId('case-header')).toBeTruthy();
  });

  it('shows Decide button when status is "new"', () => {
    render(<CaseHeader review={makeReview({ status: 'new' })} />);
    expect(screen.getByTestId('decide-button')).toBeTruthy();
  });

  it('shows Decide button when status is "in_review"', () => {
    render(<CaseHeader review={makeReview({ status: 'in_review' })} />);
    expect(screen.getByTestId('decide-button')).toBeTruthy();
  });

  it('shows Decide button when status is "pending"', () => {
    render(<CaseHeader review={makeReview({ status: 'pending' })} />);
    expect(screen.getByTestId('decide-button')).toBeTruthy();
  });

  it('hides Decide button when status is "approved"', () => {
    render(<CaseHeader review={makeReview({ status: 'approved' })} />);
    expect(screen.queryByTestId('decide-button')).toBeNull();
  });

  it('hides Decide button when status is "rejected"', () => {
    render(<CaseHeader review={makeReview({ status: 'rejected' })} />);
    expect(screen.queryByTestId('decide-button')).toBeNull();
  });

  it('shows priority badge text', () => {
    render(<CaseHeader review={makeReview({ priority: 'critical' })} />);
    expect(screen.getByText('critical')).toBeTruthy();
  });

  it('decide button is enabled and calls onDecide when provided', () => {
    const onDecide = jest.fn();
    render(<CaseHeader review={makeReview({ status: 'new' })} onDecide={onDecide} />);
    const btn = screen.getByTestId('decide-button');
    expect(btn.props.accessibilityState?.disabled).toBeFalsy();
    fireEvent.press(btn);
    expect(onDecide).toHaveBeenCalledTimes(1);
  });
});
