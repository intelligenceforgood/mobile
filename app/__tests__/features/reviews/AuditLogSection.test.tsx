import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AuditLogSection } from '../../../src/features/reviews/components/AuditLogSection';
import type { AuditEntry } from '../../../src/features/reviews/types';

function makeEntry(i: number): AuditEntry {
  return {
    action_id: `action-${i}`,
    actor: `analyst-${i}@example.com`,
    action: 'status_change',
    payload: { from: 'new', to: 'in_review' },
    created_at: new Date(Date.now() - i * 60_000).toISOString(),
  };
}

describe('AuditLogSection', () => {
  it('renders collapsed by default and shows entry count', () => {
    const entries = [makeEntry(0), makeEntry(1)];
    render(<AuditLogSection entries={entries} />);
    expect(screen.getByText('Audit Log (2)')).toBeTruthy();
    // List should not be visible while collapsed
    expect(screen.queryByTestId('audit-log-list')).toBeNull();
  });

  it('expands on tap and shows entries', () => {
    const entries = [makeEntry(0)];
    render(<AuditLogSection entries={entries} />);
    fireEvent.press(screen.getByTestId('audit-log-toggle'));
    expect(screen.getByTestId('audit-log-list')).toBeTruthy();
  });

  it('collapses again on second tap', () => {
    render(<AuditLogSection entries={[makeEntry(0)]} />);
    fireEvent.press(screen.getByTestId('audit-log-toggle'));
    expect(screen.getByTestId('audit-log-list')).toBeTruthy();
    fireEvent.press(screen.getByTestId('audit-log-toggle'));
    expect(screen.queryByTestId('audit-log-list')).toBeNull();
  });

  it('renders 50 entries without crashing', () => {
    const entries = Array.from({ length: 50 }, (_, i) => makeEntry(i));
    render(<AuditLogSection entries={entries} />);
    fireEvent.press(screen.getByTestId('audit-log-toggle'));
    expect(screen.getByTestId('audit-log-list')).toBeTruthy();
    // Verify the section is still mounted (no crash)
    expect(screen.getByTestId('audit-log-section')).toBeTruthy();
  });

  it('shows correct count in header', () => {
    const entries = Array.from({ length: 50 }, (_, i) => makeEntry(i));
    render(<AuditLogSection entries={entries} />);
    expect(screen.getByText('Audit Log (50)')).toBeTruthy();
  });
});
