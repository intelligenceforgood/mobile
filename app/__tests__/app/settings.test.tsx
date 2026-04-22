/* eslint-disable import/first */

// ─── Mocks before imports ────────────────────────────────────────────────────
jest.mock('../../src/config', () => ({
  config: {
    authProvider: 'mock',
    apiBaseUrl: 'http://localhost:8000',
    profile: 'local',
    apiMode: 'direct',
    sentryDsn: 'https://fake@sentry.io/1',
  },
}));

jest.mock('../../src/auth', () => ({
  auth: {
    kind: 'mock',
    initialize: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn().mockResolvedValue(undefined),
    getAccessToken: jest.fn().mockResolvedValue(null),
    getUser: jest.fn().mockResolvedValue(null),
    onChange: jest.fn(() => () => {}),
  },
}));

// Mock expo-constants to return a predictable version.
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { version: '0.1.0' },
  },
}));

// Mock expo-secure-store to avoid native calls.
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-router.
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock react-native DevSettings — jest-expo mocks native modules but DevSettings
// needs an explicit mock to avoid TurboModule loading errors in Jest.
jest.mock('react-native/Libraries/Utilities/DevSettings', () => ({
  __esModule: true,
  default: { reload: jest.fn(), addMenuItem: jest.fn() },
}));

import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import SettingsScreen from '../../app/(tabs)/settings';
import { useStore } from '../../src/store/ui';
import { auth } from '../../src/auth';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStore.setState({ sentryEnabled: true, user: null });
  });

  it('renders profile label from config', () => {
    render(<SettingsScreen />);
    // profile='local', apiMode='direct', authProvider='mock'
    expect(screen.getByText('LOCAL · direct · mock')).toBeTruthy();
  });

  it('renders app version from expo-constants', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('0.1.0')).toBeTruthy();
  });

  it('sign-out button calls auth.signOut and clearUser, then navigates', async () => {
    useStore.setState({ user: { email: 'a@a.com', name: 'A', roles: [] } });
    render(<SettingsScreen />);

    const btn = screen.getByTestId('sign-out-button');
    await act(async () => {
      fireEvent.press(btn);
    });

    expect(auth.signOut).toHaveBeenCalledTimes(1);
    // Give the async press handler a tick to complete
    await act(async () => {});
    expect(useStore.getState().user).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/sign-in');
  });

  it('Sentry toggle reflects store state and updates on press', () => {
    useStore.setState({ sentryEnabled: true });
    render(<SettingsScreen />);

    const toggle = screen.getByTestId('sentry-toggle');
    expect(toggle.props.value).toBe(true);

    act(() => {
      fireEvent(toggle, 'valueChange', false);
    });

    expect(useStore.getState().sentryEnabled).toBe(false);
  });

  it('Sentry toggle starts false when DSN is empty (store overridden)', () => {
    useStore.setState({ sentryEnabled: false });
    render(<SettingsScreen />);

    const toggle = screen.getByTestId('sentry-toggle');
    expect(toggle.props.value).toBe(false);
  });
});
