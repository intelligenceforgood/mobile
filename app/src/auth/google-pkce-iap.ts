/**
 * google-pkce-iap provider.
 *
 * SPRINT 1 STATUS: Compiles and unit-tests pass. NOT wired to a real OAuth client.
 * The flow is gated behind config.authProvider === 'google-pkce-iap'; it won't run
 * in the local dev environment where the mock provider is active.
 *
 * Wire to a real client in Sprint 4 (S4 — IAP integration).
 */

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import {
  AuthRequest,
  exchangeCodeAsync,
  refreshAsync,
  type AuthRequestConfig,
  type AuthSessionResult,
  type TokenResponse,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { config } from '@/config';
import { logger } from '@/lib/logger';
import { useStore } from '@/store/ui';
import { AuthError } from '@/api/errors';
import { type AuthProvider, type AuthState } from './provider';

// Required for expo-auth-session to work with the system browser on Android.
WebBrowser.maybeCompleteAuthSession();

// SecureStore key namespace.
const KEYS = {
  idToken: 'i4g.idToken',
  refreshToken: 'i4g.refreshToken',
  expiresAt: 'i4g.expiresAt',
} as const;

const store = useStore;
const subscribers = new Set<(state: AuthState) => void>();

function notify(isInitialized = true) {
  const user = store.getState().user;
  subscribers.forEach((cb) => cb({ user, isInitialized }));
}

function buildAuthRequestConfig(): AuthRequestConfig {
  const scheme = Constants.expoConfig?.scheme ?? 'com.intelligenceforgood.i4g';
  return {
    responseType: 'code' as const,
    clientId: config.googleClientId ?? '',
    scopes: ['openid', 'email', 'profile'],
    usePKCE: true,
    redirectUri: `${scheme}:/oauth2redirect`,
  };
}

async function storeTokens(tokens: TokenResponse): Promise<void> {
  const idToken = tokens.idToken ?? tokens.accessToken ?? '';
  const refreshToken = tokens.refreshToken ?? '';
  // issuedAt is in seconds; expiresIn is in seconds.
  const issuedAtMs = (tokens.issuedAt ?? Math.floor(Date.now() / 1000)) * 1000;
  const expiresAt = tokens.expiresIn
    ? String(issuedAtMs + tokens.expiresIn * 1000)
    : String(Date.now() + 3600 * 1000);

  await SecureStore.setItemAsync(KEYS.idToken, idToken);
  await SecureStore.setItemAsync(KEYS.refreshToken, refreshToken);
  await SecureStore.setItemAsync(KEYS.expiresAt, expiresAt);
}

async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.idToken),
    SecureStore.deleteItemAsync(KEYS.refreshToken),
    SecureStore.deleteItemAsync(KEYS.expiresAt),
  ]);
}

async function isTokenExpiredSoon(): Promise<boolean> {
  const expiresAt = await SecureStore.getItemAsync(KEYS.expiresAt);
  if (!expiresAt) return true;
  const expiryMs = Number(expiresAt);
  return expiryMs - 60_000 < Date.now();
}

async function refreshIdToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(KEYS.refreshToken);
  if (!refreshToken) return null;

  try {
    const discovery = {
      tokenEndpoint: `https://oauth2.googleapis.com/token`,
    };
    const tokens = await refreshAsync(
      {
        clientId: config.googleClientId ?? '',
        refreshToken,
      },
      discovery,
    );
    await storeTokens(tokens);
    return tokens.idToken ?? tokens.accessToken ?? null;
  } catch (err) {
    logger.warn('auth:google_pkce_iap:refresh_failed', { err: String(err) });
    return null;
  }
}

export const googlePkceIapProvider: AuthProvider = {
  kind: 'google-pkce-iap',

  async initialize() {
    const idToken = await SecureStore.getItemAsync(KEYS.idToken);
    if (idToken) {
      // Restore user from stored tokens. We don't have a full user object in SecureStore;
      // set a placeholder and let signIn/getAccessToken fill it in on next foreground.
      const email = await SecureStore.getItemAsync('i4g.email') ?? 'user@google';
      store.getState().setUser({ email, name: email, roles: ['analyst'] });
    }
    notify();
  },

  async signIn() {
    const requestConfig = buildAuthRequestConfig();
    const request = new AuthRequest(requestConfig);

    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };

    let result: AuthSessionResult;
    try {
      result = await request.promptAsync(discovery);
    } catch (err) {
      throw new AuthError(0, 'pkce_prompt', String(err));
    }

    if (result.type !== 'success' || !result.params.code) {
      throw new AuthError(0, 'pkce_cancelled', 'Sign-in was cancelled or failed');
    }

    const tokens = await exchangeCodeAsync(
      {
        clientId: config.googleClientId ?? '',
        code: result.params.code,
        redirectUri: requestConfig.redirectUri,
        extraParams: { code_verifier: request.codeVerifier ?? '' },
      },
      discovery,
    );

    await storeTokens(tokens);

    // Extract email from ID token payload (base64 middle segment) using atob (RN 0.73+).
    let email = 'user@google';
    try {
      const b64 = (tokens.idToken ?? '').split('.')[1] ?? '';
      const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
      const payload = JSON.parse(atob(padded)) as { email?: string; name?: string };
      email = payload.email ?? email;
      store.getState().setUser({
        email,
        name: payload.name ?? email,
        roles: ['analyst'],
      });
      await SecureStore.setItemAsync('i4g.email', email);
    } catch {
      store.getState().setUser({ email, name: email, roles: ['analyst'] });
    }

    notify();
  },

  async signOut() {
    await clearTokens();
    store.getState().clearUser();
    notify();
  },

  async getAccessToken() {
    const expired = await isTokenExpiredSoon();
    if (expired) {
      const fresh = await refreshIdToken();
      if (!fresh) {
        await clearTokens();
        store.getState().clearUser();
        notify();
        return null;
      }
      return fresh;
    }
    return await SecureStore.getItemAsync(KEYS.idToken);
  },

  async getUser() {
    return store.getState().user;
  },

  onChange(cb: (state: AuthState) => void) {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  },
};
