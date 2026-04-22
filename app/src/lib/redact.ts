/**
 * PII field allowlist — field names that are ALWAYS redacted from logs and Sentry events.
 * Keep this exhaustive; add new fields here before logging anywhere near them.
 */
export const PII_FIELDS = [
  'email',
  'token',
  'authorization',
  'idToken',
  'refreshToken',
  'accessToken',
  'password',
  'secret',
  'credential',
] as const;

type Redactable = Record<string, unknown>;

/**
 * Recursively redact PII fields from an object.
 * Returns a new object — does not mutate the input.
 */
export function redactObject(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactObject);

  const out: Redactable = {};
  for (const [key, value] of Object.entries(obj as Redactable)) {
    const fieldLower = key.toLowerCase();
    const isRedacted = PII_FIELDS.some((f) => fieldLower.includes(f.toLowerCase()));
    out[key] = isRedacted ? '[REDACTED]' : redactObject(value);
  }
  return out;
}

/**
 * Redact a Sentry event before it is sent.
 * Pass as `beforeSend` in Sentry.init().
 */
export function redactEvent(event: Redactable): Redactable {
  return redactObject(event) as Redactable;
}
