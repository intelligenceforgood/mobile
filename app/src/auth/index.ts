import { config } from '@/config';
import { mockProvider } from './mock';
import { googlePkceIapProvider } from './google-pkce-iap';
import { type AuthProvider } from './provider';

export const auth: AuthProvider =
  config.authProvider === 'mock' ? mockProvider : googlePkceIapProvider;
