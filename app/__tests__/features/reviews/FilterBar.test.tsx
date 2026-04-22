import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { FilterBar } from '../../../src/features/reviews/components/FilterBar';
import type { FilterBarValue } from '../../../src/features/reviews/components/FilterBar';

function makeValue(overrides?: Partial<FilterBarValue>): FilterBarValue {
  return { status: undefined, priority: undefined, ...overrides };
}

describe('FilterBar', () => {
  it('renders status options including "all"', () => {
    render(<FilterBar value={makeValue()} onChange={jest.fn()} />);
    expect(screen.getByTestId('status-all')).toBeTruthy();
    expect(screen.getByTestId('status-new')).toBeTruthy();
    expect(screen.getByTestId('status-approved')).toBeTruthy();
  });

  it('renders priority options including "all"', () => {
    render(<FilterBar value={makeValue()} onChange={jest.fn()} />);
    expect(screen.getByTestId('priority-all')).toBeTruthy();
    expect(screen.getByTestId('priority-high')).toBeTruthy();
    expect(screen.getByTestId('priority-critical')).toBeTruthy();
  });

  it('emits status change when a status chip is pressed', () => {
    const onChange = jest.fn();
    render(<FilterBar value={makeValue()} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('status-new'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'new' }));
  });

  it('emits priority change when a priority chip is pressed', () => {
    const onChange = jest.fn();
    render(<FilterBar value={makeValue()} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('priority-high'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ priority: 'high' }));
  });

  it('pressing "all" status clears the status filter', () => {
    const onChange = jest.fn();
    render(<FilterBar value={makeValue({ status: 'new' })} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('status-all'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: undefined }));
  });

  it('pressing "all" priority clears the priority filter', () => {
    const onChange = jest.fn();
    render(<FilterBar value={makeValue({ priority: 'high' })} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('priority-all'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ priority: undefined }));
  });

  it('preserves the other filter when one changes', () => {
    const onChange = jest.fn();
    render(<FilterBar value={makeValue({ status: 'new', priority: 'high' })} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('status-approved'));
    expect(onChange).toHaveBeenCalledWith({ status: 'approved', priority: 'high' });
  });
});
