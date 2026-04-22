/* eslint-disable import/first */
/**
 * Tests for mockProvider.
 * The store is mocked so we don't need React context.
 */

jest.mock('../../src/store/ui', () => ({
  useStore: { getState: jest.fn(), subscribe: jest.fn(() => () => {}) },
}));

jest.mock('../../src/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../../src/api', () => ({
  getApi: jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue({
      email: 'test@local',
      displayName: 'Test User',
      role: 'analyst',
      isActive: true,
    }),
  }),
}));

jest.mock('../../src/features/reviews/types', () => ({ WhoAmI: {} }));

import { mockProvider } from '../../src/auth/mock';
import { useStore } from '../../src/store/ui';

const mockGetState = useStore.getState as jest.Mock;

function makeStoreState() {
  let user: import('../../src/store/ui').User | null = null;
  return {
    get user() { return user; },
    setUser: jest.fn((u: import('../../src/store/ui').User) => { user = u; }),
    clearUser: jest.fn(() => { user = null; }),
    toasts: [] as import('../../src/store/ui').Toast[],
    pushToast: jest.fn(),
    dismissToast: jest.fn(),
  };
}

let storeState: ReturnType<typeof makeStoreState>;

beforeEach(() => {
  jest.clearAllMocks();
  storeState = makeStoreState();
  mockGetState.mockReturnValue(storeState);
});

describe('mockProvider', () => {
  it('kind is "mock"', () => {
    expect(mockProvider.kind).toBe('mock');
  });

  it('initialize() resolves without error', async () => {
    await expect(mockProvider.initialize()).resolves.toBeUndefined();
  });

  it('getUser() returns null before signIn', async () => {
    const user = await mockProvider.getUser();
    expect(user).toBeNull();
  });

  it('signIn() sets a user in the store', async () => {
    await mockProvider.signIn();
    // Fallback user set synchronously before the async whoami call
    expect(storeState.setUser).toHaveBeenCalled();
    const user = await mockProvider.getUser();
    expect(user).not.toBeNull();
  });

  it('signOut() clears the user', async () => {
    await mockProvider.signIn();
    await mockProvider.signOut();
    expect(storeState.clearUser).toHaveBeenCalled();
    const user = await mockProvider.getUser();
    expect(user).toBeNull();
  });

  it('onChange fires when signIn is called', async () => {
    const cb = jest.fn();
    const unsub = mockProvider.onChange(cb);

    await mockProvider.signIn();
    expect(cb).toHaveBeenCalled();
    const lastCall = (cb.mock.calls[cb.mock.calls.length - 1] as [{ user: unknown }])[0];
    // Fallback user was set — user is not null
    expect(lastCall.user).not.toBeNull();
    unsub();
  });

  it('onChange fires when signOut is called', async () => {
    const cb = jest.fn();
    const unsub = mockProvider.onChange(cb);

    await mockProvider.signOut();
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ user: null }));
    unsub();
  });

  it('getAccessToken() returns null', async () => {
    expect(await mockProvider.getAccessToken()).toBeNull();
  });
});
