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
 *
 * Explicitly walks the Sentry event top-level fields that are most likely to
 * carry PII, in addition to the recursive redactObject pass over the whole event.
 * This ensures structured fields (user.email, request.data, breadcrumbs[].data,
 * extra, contexts, tags) are always sanitised even if their shape changes.
 *
 * Fields handled (per TDD §10):
 *   event.user          — email, name, username
 *   event.request.data  — token, authorization, and any body params
 *   event.extra         — arbitrary kv — full recursive pass
 *   event.contexts      — device/runtime contexts — full recursive pass
 *   event.breadcrumbs   — each entry's .data field
 *   event.tags          — string kv — recursive pass
 */
export function redactEvent(event: Redactable): Redactable {
  const out = { ...event };

  if (out['user'] && typeof out['user'] === 'object') {
    out['user'] = redactObject(out['user']) as Redactable;
  }

  if (out['request'] && typeof out['request'] === 'object') {
    out['request'] = redactObject(out['request']) as Redactable;
  }

  if (out['extra'] && typeof out['extra'] === 'object') {
    out['extra'] = redactObject(out['extra']) as Redactable;
  }

  if (out['contexts'] && typeof out['contexts'] === 'object') {
    out['contexts'] = redactObject(out['contexts']) as Redactable;
  }

  if (out['tags'] && typeof out['tags'] === 'object') {
    out['tags'] = redactObject(out['tags']) as Redactable;
  }

  if (Array.isArray(out['breadcrumbs'])) {
    out['breadcrumbs'] = (out['breadcrumbs'] as Redactable[]).map((bc) => {
      if (bc && typeof bc === 'object' && bc['data']) {
        return { ...bc, data: redactObject(bc['data']) };
      }
      return bc;
    });
  } else if (
    out['breadcrumbs'] &&
    typeof out['breadcrumbs'] === 'object' &&
    Array.isArray((out['breadcrumbs'] as Redactable)['values'])
  ) {
    // Sentry SDK wraps breadcrumbs as { values: Breadcrumb[] }
    const wrapped = out['breadcrumbs'] as Redactable;
    out['breadcrumbs'] = {
      ...wrapped,
      values: (wrapped['values'] as Redactable[]).map((bc) => {
        if (bc && typeof bc === 'object' && bc['data']) {
          return { ...bc, data: redactObject(bc['data']) };
        }
        return bc;
      }),
    };
  }

  return out;
}
