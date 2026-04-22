import Constants from 'expo-constants';
import { z } from 'zod';
import { type AuthProvider } from '@/auth/provider';
import { logger } from '@/lib/logger';
import { buildErrorFromResponse, AuthError, ValidationError } from './errors';

export type ReqOpts = {
  signal?: AbortSignal;
};

export interface ApiClient {
  get<T>(path: string, schema: z.ZodType<T>, opts?: ReqOpts): Promise<T>;
  post<T>(path: string, body: unknown, schema: z.ZodType<T>, opts?: ReqOpts): Promise<T>;
  patch<T>(path: string, body: unknown, schema: z.ZodType<T>, opts?: ReqOpts): Promise<T>;
  delete<T>(path: string, schema: z.ZodType<T>, opts?: ReqOpts): Promise<T>;
}

export function createApiClient(auth: AuthProvider, baseUrl: string): ApiClient {
  const clientVersion = Constants.expoConfig?.version ?? 'dev';

  async function request<T>(
    method: string,
    path: string,
    schema: z.ZodType<T>,
    body?: unknown,
    opts?: ReqOpts,
  ): Promise<T> {
    const token = await auth.getAccessToken();
    const url = `${baseUrl}${path}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Client': `i4g-mobile/${clientVersion}`,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body != null) headers['Content-Type'] = 'application/json';

    logger.info('api:request', { method, path });

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
        signal: opts?.signal,
      });
    } catch (err) {
      throw new (await import('./errors')).NetworkError(0, 'network', String(err));
    }

    if (res.status === 401) {
      await auth.signOut();
      throw new AuthError(401, 'unauth', 'Session expired');
    }

    if (!res.ok) {
      throw await buildErrorFromResponse(res);
    }

    const json: unknown = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      logger.warn('api:schema_drift', { path, issues: parsed.error.issues.slice(0, 3) });
      throw new ValidationError(res.status, 'schema', parsed.error.message);
    }

    return parsed.data;
  }

  return {
    get: (path, schema, opts) => request('GET', path, schema, undefined, opts),
    post: (path, body, schema, opts) => request('POST', path, schema, body, opts),
    patch: (path, body, schema, opts) => request('PATCH', path, schema, body, opts),
    delete: (path, schema, opts) => request('DELETE', path, schema, undefined, opts),
  };
}
