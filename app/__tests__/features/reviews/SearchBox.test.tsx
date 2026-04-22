import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SearchBox } from '../../../src/features/reviews/components/SearchBox';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('SearchBox', () => {
  it('renders the text input', () => {
    render(<SearchBox onDebouncedChange={jest.fn()} />);
    expect(screen.getByTestId('search-input')).toBeTruthy();
  });

  it('does not show the clear button when empty', () => {
    render(<SearchBox onDebouncedChange={jest.fn()} />);
    expect(screen.queryByTestId('search-clear')).toBeNull();
  });

  it('shows the clear button after typing', () => {
    render(<SearchBox onDebouncedChange={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId('search-input'), 'foo');
    expect(screen.getByTestId('search-clear')).toBeTruthy();
  });

  it('debounces the callback — does not emit immediately', () => {
    const onDebouncedChange = jest.fn();
    render(<SearchBox onDebouncedChange={onDebouncedChange} />);

    fireEvent.changeText(screen.getByTestId('search-input'), 'f');
    act(() => jest.advanceTimersByTime(100));
    fireEvent.changeText(screen.getByTestId('search-input'), 'fo');
    act(() => jest.advanceTimersByTime(100));
    fireEvent.changeText(screen.getByTestId('search-input'), 'foo');
    act(() => jest.advanceTimersByTime(100));

    // 300 ms hasn't elapsed since last change — callback not yet fired
    expect(onDebouncedChange).not.toHaveBeenCalled();
  });

  it('emits the debounced value after the delay', () => {
    const onDebouncedChange = jest.fn();
    render(<SearchBox onDebouncedChange={onDebouncedChange} />);

    fireEvent.changeText(screen.getByTestId('search-input'), 'foo');
    act(() => jest.advanceTimersByTime(300));

    expect(onDebouncedChange).toHaveBeenCalledWith('foo');
    expect(onDebouncedChange).toHaveBeenCalledTimes(1);
  });

  it('clear button resets input and immediately emits empty string', () => {
    const onDebouncedChange = jest.fn();
    render(<SearchBox onDebouncedChange={onDebouncedChange} />);

    fireEvent.changeText(screen.getByTestId('search-input'), 'foo');
    act(() => jest.advanceTimersByTime(300));
    onDebouncedChange.mockClear();

    fireEvent.press(screen.getByTestId('search-clear'));

    expect(onDebouncedChange).toHaveBeenCalledWith('');
    expect(screen.queryByTestId('search-clear')).toBeNull();
  });
});
