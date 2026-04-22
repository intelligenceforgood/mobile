/**
 * Typed API error hierarchy.
 * All errors extend ApiError. Screens use mapErrorToBanner() to render user-facing copy.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** Network-level failure — no response received (timeout, DNS, etc.). */
export class NetworkError extends ApiError {}

/** 401 — session expired or missing; triggers sign-out. */
export class AuthError extends ApiError {}

/** Zod parse failed — backend response shape drifted from our schema. */
export class ValidationError extends ApiError {}

/** 404 — resource not found. */
export class NotFoundError extends ApiError {}

/** 5xx — server-side failure. */
export class ServerError extends ApiError {}

/** Build a typed error from a non-ok Response. */
export async function buildErrorFromResponse(res: Response): Promise<ApiError> {
  let body: string;
  try {
    body = await res.text();
  } catch {
    body = '';
  }

  if (res.status === 401) return new AuthError(401, 'unauth', 'Session expired');
  if (res.status === 404) return new NotFoundError(404, 'not_found', `Not found: ${body.slice(0, 120)}`);
  if (res.status >= 500) return new ServerError(res.status, 'server_error', `Server error ${res.status}: ${body.slice(0, 120)}`);

  return new ApiError(res.status, 'api_error', `Request failed (${res.status}): ${body.slice(0, 120)}`);
}

/** Human-readable banner text for each error type. Used by screens. */
export function mapErrorToBanner(err: unknown): string {
  if (err instanceof AuthError) return 'Your session has expired. Please sign in again.';
  if (err instanceof NetworkError) return "You're offline — check your connection and try again.";
  if (err instanceof NotFoundError) return 'This item no longer exists.';
  if (err instanceof ValidationError) return 'The server returned unexpected data. Please contact support.';
  if (err instanceof ServerError) return 'The server encountered an error. Please try again later.';
  if (err instanceof ApiError) return `Request failed. Please try again.`;
  return 'Something went wrong. Please try again.';
}
