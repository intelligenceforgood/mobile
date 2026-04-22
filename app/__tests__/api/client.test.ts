import { z } from 'zod';
import { createApiClient } from '../../src/api/client';
import { AuthError, NotFoundError, ServerError, ValidationError } from '../../src/api/errors';
import { type AuthProvider } from '../../src/auth/provider';

// Minimal mock auth provider for tests
const mockAuth: AuthProvider = {
  kind: 'mock',
  initialize: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getAccessToken: jest.fn().mockResolvedValue(null),
  getUser: jest.fn().mockResolvedValue(null),
  onChange: jest.fn().mockReturnValue(() => {}),
};

const TestSchema = z.object({ id: z.string(), name: z.string() });

function makeClient() {
  return createApiClient(mockAuth, 'http://localhost:8000');
}

function mockFetch(status: number, body: unknown) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response);
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('ApiClient.get — happy path', () => {
  it('returns parsed data on 200', async () => {
    const payload = { id: 'abc', name: 'test' };
    mockFetch(200, payload);

    const client = makeClient();
    const result = await client.get('/items/abc', TestSchema);

    expect(result).toEqual(payload);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/items/abc',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('ApiClient.get — 401 triggers AuthError + signOut', () => {
  it('throws AuthError and calls auth.signOut()', async () => {
    mockFetch(401, { detail: 'Unauthorized' });

    const client = makeClient();
    await expect(client.get('/items/abc', TestSchema)).rejects.toBeInstanceOf(AuthError);
    expect(mockAuth.signOut).toHaveBeenCalled();
  });
});

describe('ApiClient.get — 404 throws NotFoundError', () => {
  it('throws NotFoundError on 404', async () => {
    mockFetch(404, { detail: 'Not Found' });

    const client = makeClient();
    await expect(client.get('/items/missing', TestSchema)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('ApiClient.get — 500 throws ServerError', () => {
  it('throws ServerError on 500', async () => {
    mockFetch(500, { detail: 'Internal Server Error' });

    const client = makeClient();
    await expect(client.get('/items/abc', TestSchema)).rejects.toBeInstanceOf(ServerError);
  });
});

describe('ApiClient.get — schema drift throws ValidationError', () => {
  it('throws ValidationError when response does not match schema', async () => {
    // Response has wrong shape — missing required 'name' field
    mockFetch(200, { id: 'abc', unexpected: 'field' });

    const client = makeClient();
    await expect(client.get('/items/abc', TestSchema)).rejects.toBeInstanceOf(ValidationError);
  });
});

describe('ApiClient.post', () => {
  it('sends JSON body and returns parsed data', async () => {
    const payload = { id: 'abc', name: 'created' };
    mockFetch(200, payload);

    const client = makeClient();
    const result = await client.post('/items', { name: 'created' }, TestSchema);

    expect(result).toEqual(payload);
    const [, fetchOpts] = (globalThis.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(fetchOpts.method).toBe('POST');
    expect(fetchOpts.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(fetchOpts.body).toBe(JSON.stringify({ name: 'created' }));
  });
});

describe('ApiClient — X-Client header', () => {
  it('sends X-Client header on every request', async () => {
    mockFetch(200, { id: 'x', name: 'y' });
    const client = makeClient();
    await client.get('/items/x', TestSchema);

    const [, fetchOpts] = (globalThis.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect((fetchOpts.headers as Record<string, string>)['X-Client']).toMatch(/^i4g-mobile\//);
  });
});
