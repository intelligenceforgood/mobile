import { Redirect } from 'expo-router';

/**
 * Root index — redirects to sign-in.
 * Auth gating (sign-in vs dashboard) is handled in _layout.tsx.
 */
export default function Index() {
  return <Redirect href="/sign-in" />;
}
