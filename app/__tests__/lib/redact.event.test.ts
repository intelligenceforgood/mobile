import { redactEvent } from '../../src/lib/redact';

// ─── Sentry event shape redaction tests ──────────────────────────────────────

describe('redactEvent — Sentry event shape', () => {
  it('redacts user.email', () => {
    const event = { user: { email: 'analyst@example.com', id: 'u1' } };
    const result = redactEvent(event) as typeof event;
    expect(result.user.email).toBe('[REDACTED]');
    expect(result.user.id).toBe('u1');
  });

  it('redacts request.data.token', () => {
    const event = { request: { data: { token: 'secret-tok', action: 'submit' }, url: '/api' } };
    const result = redactEvent(event) as typeof event;
    expect(result.request.data.token).toBe('[REDACTED]');
    expect(result.request.data.action).toBe('submit');
  });

  it('redacts nested breadcrumb[0].data.authorization', () => {
    const event = {
      breadcrumbs: [
        { category: 'http', data: { authorization: 'Bearer xyz', url: '/api' } },
      ],
    };
    const result = redactEvent(event) as { breadcrumbs: { category: string; data: Record<string, unknown> }[] };
    expect(result.breadcrumbs[0]!.data['authorization']).toBe('[REDACTED]');
    expect(result.breadcrumbs[0]!.data['url']).toBe('/api');
  });

  it('redacts Sentry wrapped breadcrumbs ({ values: [...] })', () => {
    const event = {
      breadcrumbs: {
        values: [
          { category: 'auth', data: { idToken: 'ey.abc', safe: 'ok' } },
        ],
      },
    };
    type Ev = { breadcrumbs: { values: { category: string; data: Record<string, unknown> }[] } };
    const result = redactEvent(event as unknown as Record<string, unknown>) as Ev;
    expect(result.breadcrumbs.values[0]!.data['idToken']).toBe('[REDACTED]');
    expect(result.breadcrumbs.values[0]!.data['safe']).toBe('ok');
  });

  it('redacts extra PII fields', () => {
    const event = { extra: { refreshToken: 'rt_abc', caseId: 'case-001' } };
    const result = redactEvent(event) as typeof event;
    expect(result.extra.refreshToken).toBe('[REDACTED]');
    expect(result.extra.caseId).toBe('case-001');
  });

  it('happy-path event with no PII passes through structurally unchanged', () => {
    const event = {
      message: 'Something happened',
      level: 'info',
      tags: { release: '0.1.0', env: 'local' },
      extra: { caseId: 'case-001', step: 'submit' },
      contexts: { device: { name: 'iPhone' } },
    };
    const result = redactEvent({ ...event }) as typeof event;
    expect(result.message).toBe('Something happened');
    expect(result.tags.release).toBe('0.1.0');
    expect(result.extra.caseId).toBe('case-001');
    expect(result.contexts.device.name).toBe('iPhone');
  });

  it('does not mutate the original event', () => {
    const event = { user: { email: 'a@a.com' } };
    const copy = { user: { email: 'a@a.com' } };
    redactEvent(event as Record<string, unknown>);
    expect(event).toEqual(copy);
  });
});
