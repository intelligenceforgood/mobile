/** Shape of the currently signed-in user. */
export type User = {
  email: string;
  name: string;
  roles: string[];
};

/** Snapshot of auth state passed to onChange subscribers. */
export type AuthState = {
  user: User | null;
  isInitialized: boolean;
};

/**
 * AuthProvider — implemented by `mock` and `google-pkce-iap` providers.
 * Screens and the API client interact only through this interface.
 */
export interface AuthProvider {
  readonly kind: 'mock' | 'google-pkce-iap';

  /** Called once at app start. Must resolve before the root layout renders. */
  initialize(): Promise<void>;

  /** Prompt the user to sign in. Resolves when sign-in is complete. */
  signIn(): Promise<void>;

  /** Sign the user out and clear all stored tokens. */
  signOut(): Promise<void>;

  /**
   * Returns the access token for the current session, or null if no auth header
   * is needed (e.g. mock provider against identity-disabled local backend).
   * Refreshes the token if it is close to expiry.
   */
  getAccessToken(): Promise<string | null>;

  /** Returns the current user, or null if not signed in. */
  getUser(): Promise<User | null>;

  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function.
   */
  onChange(cb: (state: AuthState) => void): () => void;
}
