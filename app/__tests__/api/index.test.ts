/* eslint-disable import/first */
/**
 * Tests for the api/index.ts singleton.
 */

jest.mock('../../src/config', () => ({
  config: {
    authProvider: 'mock',
    apiBaseUrl: 'http://localhost:8000',
    profile: 'local',
    apiMode: 'direct',
  },
}));

jest.mock('../../src/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// auth singleton required by getApi via require()
jest.mock('../../src/auth', () => ({
  auth: {
    kind: 'mock',
    initialize: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getAccessToken: jest.fn().mockResolvedValue(null),
    getUser: jest.fn().mockResolvedValue(null),
    onChange: jest.fn(() => () => {}),
  },
}));

import { getApi, resetApi } from '../../src/api/index';

describe('getApi singleton', () => {
  beforeEach(() => {
    resetApi();
  });

  it('returns an ApiClient with get/post/patch/delete', () => {
    const api = getApi();
    expect(typeof api.get).toBe('function');
    expect(typeof api.post).toBe('function');
    expect(typeof api.patch).toBe('function');
    expect(typeof api.delete).toBe('function');
  });

  it('returns the same instance on subsequent calls', () => {
    const a = getApi();
    const b = getApi();
    expect(a).toBe(b);
  });

  it('resetApi() causes a new instance to be created', () => {
    const a = getApi();
    resetApi();
    const b = getApi();
    expect(a).not.toBe(b);
  });
});
