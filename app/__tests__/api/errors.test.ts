import {
  ApiError,
  AuthError,
  NetworkError,
  NotFoundError,
  ServerError,
  ValidationError,
  mapErrorToBanner,
} from '../../src/api/errors';

describe('mapErrorToBanner', () => {
  it('returns session-expired copy for AuthError', () => {
    expect(mapErrorToBanner(new AuthError(401, 'unauth', 'x'))).toMatch(/session/i);
  });

  it('returns offline copy for NetworkError', () => {
    expect(mapErrorToBanner(new NetworkError(0, 'network', 'x'))).toMatch(/offline/i);
  });

  it('returns not-found copy for NotFoundError', () => {
    expect(mapErrorToBanner(new NotFoundError(404, 'not_found', 'x'))).toMatch(/no longer exists/i);
  });

  it('returns schema copy for ValidationError', () => {
    expect(mapErrorToBanner(new ValidationError(200, 'schema', 'x'))).toMatch(/unexpected data/i);
  });

  it('returns server-error copy for ServerError', () => {
    expect(mapErrorToBanner(new ServerError(500, 'server_error', 'x'))).toMatch(/server/i);
  });

  it('returns generic copy for plain ApiError', () => {
    expect(mapErrorToBanner(new ApiError(400, 'api_error', 'x'))).toMatch(/failed/i);
  });

  it('returns generic copy for unknown errors', () => {
    expect(mapErrorToBanner(new Error('boom'))).toMatch(/something went wrong/i);
    expect(mapErrorToBanner('string error')).toMatch(/something went wrong/i);
    expect(mapErrorToBanner(null)).toMatch(/something went wrong/i);
  });
});
