import { config } from '@/config';
import { type ApiClient, createApiClient } from './client';

let _instance: ApiClient | null = null;

/**
 * Lazily constructs the ApiClient singleton from the active auth provider.
 * Call resetApi() in tests to get a fresh instance.
 */
export function getApi(): ApiClient {
  if (_instance) return _instance;

  // Dynamic import to break the circular dep: api → auth → api
  // Synchronous access to the already-resolved auth singleton via require.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { auth } = require('@/auth') as { auth: import('@/auth/provider').AuthProvider };
  _instance = createApiClient(auth, config.apiBaseUrl);
  return _instance;
}

/** Reset the singleton — used in tests to inject a mock auth provider. */
export function resetApi(): void {
  _instance = null;
}
