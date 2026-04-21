import 'dotenv/config';
import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'I4G',
  slug: 'i4g-mobile',
  scheme: process.env.EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME,
  ios: { bundleIdentifier: 'com.intelligenceforgood.i4g' },
  android: { package: 'com.intelligenceforgood.i4g' },
  extra: {
    profile: process.env.EXPO_PUBLIC_PROFILE,
    apiMode: process.env.EXPO_PUBLIC_API_MODE,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    authProvider: process.env.EXPO_PUBLIC_AUTH_PROVIDER,
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  },
});
