import Constants from 'expo-constants';
import { z } from 'zod';

const Schema = z.object({
  profile: z.enum(['local', 'dev', 'prod']),
  apiMode: z.enum(['direct', 'bff', 'remote']),
  apiBaseUrl: z.string().url(),
  authProvider: z.enum(['mock', 'google-pkce-iap']),
  googleClientId: z.string().optional(),
  sentryDsn: z.string().optional(),
});

export const config = Schema.parse(Constants.expoConfig?.extra ?? {});
