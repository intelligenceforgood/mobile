import { redactObject, redactEvent, PII_FIELDS } from '../../src/lib/redact';

describe('PII_FIELDS', () => {
  it('includes all required sensitive fields', () => {
    const required = ['email', 'token', 'authorization', 'idToken', 'refreshToken'];
    required.forEach((field) => {
      const found = PII_FIELDS.some((f) => f.toLowerCase() === field.toLowerCase());
      expect(found).toBe(true);
    });
  });
});

describe('redactObject', () => {
  it('redacts email field', () => {
    const result = redactObject({ email: 'analyst@example.com', name: 'Analyst' }) as Record<string, unknown>;
    expect(result['email']).toBe('[REDACTED]');
    expect(result['name']).toBe('Analyst');
  });

  it('redacts token field', () => {
    const result = redactObject({ token: 'abc123', id: 'x' }) as Record<string, unknown>;
    expect(result['token']).toBe('[REDACTED]');
    expect(result['id']).toBe('x');
  });

  it('redacts authorization field', () => {
    const result = redactObject({ authorization: 'Bearer xyz' }) as Record<string, unknown>;
    expect(result['authorization']).toBe('[REDACTED]');
  });

  it('redacts idToken field', () => {
    const result = redactObject({ idToken: 'eyJhb...' }) as Record<string, unknown>;
    expect(result['idToken']).toBe('[REDACTED]');
  });

  it('redacts refreshToken field', () => {
    const result = redactObject({ refreshToken: 'rt_abc' }) as Record<string, unknown>;
    expect(result['refreshToken']).toBe('[REDACTED]');
  });

  it('redacts nested PII fields', () => {
    const result = redactObject({
      outer: {
        inner: {
          email: 'should-be-redacted@test.com',
          safe: 'keep-me',
        },
      },
    }) as { outer: { inner: Record<string, unknown> } };
    expect(result.outer.inner['email']).toBe('[REDACTED]');
    expect(result.outer.inner['safe']).toBe('keep-me');
  });

  it('handles arrays', () => {
    const result = redactObject([{ email: 'x@x.com' }, { name: 'ok' }]) as Record<string, unknown>[];
    expect(result[0]!['email']).toBe('[REDACTED]');
    expect(result[1]!['name']).toBe('ok');
  });

  it('passes through primitives', () => {
    expect(redactObject('hello')).toBe('hello');
    expect(redactObject(42)).toBe(42);
    expect(redactObject(null)).toBeNull();
  });
});

describe('redactEvent', () => {
  it('returns a redacted copy of a Sentry event', () => {
    const event = {
      message: 'test',
      extra: { email: 'user@test.com', safe: 'data' },
    };
    const result = redactEvent(event) as { extra: Record<string, unknown> };
    expect(result.extra['email']).toBe('[REDACTED]');
    expect(result.extra['safe']).toBe('data');
  });
});
