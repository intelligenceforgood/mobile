import { act, renderHook } from '@testing-library/react-native';
import { useDebouncedValue } from '../../src/lib/useDebouncedValue';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useDebouncedValue', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update before the delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: 'a' },
    });

    rerender({ v: 'b' });
    act(() => jest.advanceTimersByTime(200));

    expect(result.current).toBe('a');
  });

  it('updates after the delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: 'a' },
    });

    rerender({ v: 'b' });
    act(() => jest.advanceTimersByTime(300));

    expect(result.current).toBe('b');
  });

  it('resets the timer on rapid updates', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: 'a' },
    });

    rerender({ v: 'b' });
    act(() => jest.advanceTimersByTime(100));
    rerender({ v: 'c' });
    act(() => jest.advanceTimersByTime(100));
    rerender({ v: 'd' });
    act(() => jest.advanceTimersByTime(300));

    expect(result.current).toBe('d');
  });

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 150), {
      initialProps: { v: 0 },
    });

    rerender({ v: 42 });
    act(() => jest.advanceTimersByTime(150));

    expect(result.current).toBe(42);
  });
});
