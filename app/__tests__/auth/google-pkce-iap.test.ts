/**
 * Tests for googlePkceIapProvider.
 * Mocks expo-auth-session, expo-secure-store, and expo-web-browser at module level.
 */

/* eslint-disable import/first */
// Must be before the import so jest.mock hoisting works.
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-auth-session', () => {
  const mockPromptAsync = jest.fn();
  const MockAuthRequest = jest.fn().mockImplementation(() => ({
    promptAsync: mockPromptAsync,
    codeVerifier: 'test-verifier',
  }));
  return {
    AuthRequest: MockAuthRequest,
    exchangeCodeAsync: jest.fn(),
    refreshAsync: jest.fn(),
    __mockPromptAsync: mockPromptAsync,
  };
});

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('../../src/store/ui', () => {
  let user: unknown = null;
  const state = {
    get user() {
      return user;
    },
    setUser: jest.fn((u: unknown) => {
      user = u;
    }),
    clearUser: jest.fn(() => {
      user = null;
    }),
    toasts: [],
    pushToast: jest.fn(),
    dismissToast: jest.fn(),
  };
  return {
    useStore: {
      getState: () => state,
      subscribe: jest.fn(() => () => {}),
    },
  };
});

jest.mock('../../src/config', () => ({
  config: {
    authProvider: 'google-pkce-iap',
    googleClientId: 'test-client-id',
    apiBaseUrl: 'http://localhost:8000',
    profile: 'local',
    apiMode: 'direct',
    scheme: 'com.intelligenceforgood.i4g',
  },
}));

jest.mock('../../src/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import * as SecureStore from 'expo-secure-store';
import { exchangeCodeAsync } from 'expo-auth-session';
import { googlePkceIapProvider } from '../../src/auth/google-pkce-iap';
import { AuthError } from '../../src/api/errors';

// Access the mock's internal promptAsync via jest.requireMock
const authSessionMock = jest.requireMock('expo-auth-session') as {
  __mockPromptAsync: jest.Mock;
  exchangeCodeAsync: jest.Mock;
};

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockExchangeCode = exchangeCodeAsync as jest.MockedFunction<typeof exchangeCodeAsync>;
const mockPromptAsync = authSessionMock.__mockPromptAsync;

// Fake ID token payload (base64 of JSON) — use btoa() (available in RN 0.73+)
function makeIdToken(email: string, name: string): string {
  const header = btoa(JSON.stringify({ alg: 'RS256' }));
  const payload = btoa(JSON.stringify({ email, name, exp: Math.floor(Date.now() / 1000) + 3600 }));
  return `${header}.${payload}.fakesig`;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSecureStore.getItemAsync.mockResolvedValue(null);
  mockSecureStore.setItemAsync.mockResolvedValue();
  mockSecureStore.deleteItemAsync.mockResolvedValue();
});

describe('googlePkceIapProvider.signIn', () => {
  it('calls promptAsync, exchanges code, stores tokens in SecureStore', async () => {
    const idToken = makeIdToken('analyst@example.com', 'Test Analyst');

    mockPromptAsync.mockResolvedValue({
      type: 'success',
      params: { code: 'auth-code-123' },
    });

    mockExchangeCode.mockResolvedValue({
      idToken,
      refreshToken: 'refresh-token-xyz',
      accessToken: 'access-token',
      issuedAt: Math.floor(Date.now() / 1000),
      expiresIn: 3600,
      tokenType: 'Bearer',
    } as unknown as import('expo-auth-session').TokenResponse);

    await googlePkceIapProvider.signIn();

    // idToken should be stored
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('i4g.idToken', idToken);
    // refreshToken should be stored
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('i4g.refreshToken', 'refresh-token-xyz');
    // expiresAt should be stored
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('i4g.expiresAt', expect.any(String));
  });

  it('throws AuthError when promptAsync returns cancelled', async () => {
    mockPromptAsync.mockResolvedValue({ type: 'cancel' });
    await expect(googlePkceIapProvider.signIn()).rejects.toBeInstanceOf(AuthError);
  });
});

describe('googlePkceIapProvider.getAccessToken', () => {
  it('returns stored idToken when not expired', async () => {
    const futureExpiry = String(Date.now() + 3600 * 1000);
    mockSecureStore.getItemAsync.mockImplementation(async (key: string) => {
      if (key === 'i4g.expiresAt') return futureExpiry;
      if (key === 'i4g.idToken') return 'stored-id-token';
      return null;
    });

    const token = await googlePkceIapProvider.getAccessToken();
    expect(token).toBe('stored-id-token');
  });

  it('calls refreshAsync to refresh when token is expired', async () => {
    const pastExpiry = String(Date.now() - 1000);
    mockSecureStore.getItemAsync.mockImplementation(async (key: string) => {
      if (key === 'i4g.expiresAt') return pastExpiry;
      if (key === 'i4g.refreshToken') return 'old-refresh-token';
      return null;
    });

    const newIdToken = makeIdToken('analyst@example.com', 'Analyst');
    const authMock = jest.requireMock('expo-auth-session') as { refreshAsync: jest.Mock };
    authMock.refreshAsync.mockResolvedValue({
      idToken: newIdToken,
      refreshToken: 'new-refresh',
      accessToken: 'new-access',
      issuedAt: Math.floor(Date.now() / 1000),
      expiresIn: 3600,
      tokenType: 'Bearer',
    } as unknown as import('expo-auth-session').TokenResponse);

    const token = await googlePkceIapProvider.getAccessToken();
    expect(authMock.refreshAsync).toHaveBeenCalled();
    expect(token).toBe(newIdToken);
  });
});

describe('googlePkceIapProvider.signOut', () => {
  it('deletes all SecureStore keys', async () => {
    await googlePkceIapProvider.signOut();

    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('i4g.idToken');
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('i4g.refreshToken');
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('i4g.expiresAt');
  });
});
