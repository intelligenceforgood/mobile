import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { QueueRow } from '../../../src/features/reviews/components/QueueRow';
import type { ReviewQueueItem } from '../../../src/features/reviews/types';

const item: ReviewQueueItem = {
  review_id: 'rev-abcdef12',
  case_id: 'case-001234',
  queued_at: new Date(Date.now() - 5 * 60_000).toISOString(), // 5 min ago
  priority: 'high',
  status: 'new',
  assigned_to: null,
  notes: null,
  last_updated: null,
  classification_result: null,
  tags: null,
};

describe('QueueRow', () => {
  it('shows status badge', () => {
    render(<QueueRow item={item} />);
    expect(screen.getByText('new')).toBeTruthy();
  });

  it('shows priority badge', () => {
    render(<QueueRow item={item} />);
    expect(screen.getByText('high')).toBeTruthy();
  });

  it('shows case_id (short form)', () => {
    render(<QueueRow item={item} />);
    // shortId: 'case-001234' is exactly 12 chars so shown as-is
    expect(screen.getByText('case-001234')).toBeTruthy();
  });

  it('shows Unassigned when assigned_to is null', () => {
    render(<QueueRow item={item} />);
    expect(screen.getByText('Unassigned')).toBeTruthy();
  });

  it('shows assignee name when assigned_to is set', () => {
    render(<QueueRow item={{ ...item, assigned_to: 'analyst@example.com' }} />);
    expect(screen.getByText('analyst@example.com')).toBeTruthy();
  });
});
