import {
  WhoAmI,
  ReviewQueueItem,
  ReviewsQueue,
  DecisionRequest,
  DecisionResponse,
  AuditLog,
} from '../../../src/features/reviews/types';

// ---------------------------------------------------------------------------
// WhoAmI
// ---------------------------------------------------------------------------
describe('WhoAmI schema', () => {
  it('parses a valid /accounts/me response', () => {
    const payload = { email: 'local-dev', role: 'admin', displayName: 'local-dev', isActive: true };
    expect(WhoAmI.parse(payload)).toMatchObject({ email: 'local-dev', role: 'admin' });
  });

  it('rejects a response missing required fields', () => {
    const bad = { displayName: 'x' }; // missing email and role
    expect(() => WhoAmI.parse(bad)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// ReviewQueueItem
// ---------------------------------------------------------------------------
describe('ReviewQueueItem schema', () => {
  const valid = {
    review_id: 'abc-123',
    case_id: 'case-001',
    queued_at: '2026-01-01T00:00:00Z',
    priority: 'high',
    status: 'new',
    assigned_to: null,
    notes: null,
    last_updated: null,
    classification_result: null,
    tags: null,
  };

  it('parses a valid queue item', () => {
    const result = ReviewQueueItem.parse(valid);
    expect(result.review_id).toBe('abc-123');
    expect(result.priority).toBe('high');
  });

  it('rejects a queue item missing review_id', () => {
    const bad = { ...valid, review_id: undefined };
    expect(() => ReviewQueueItem.parse(bad)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// ReviewsQueue
// ---------------------------------------------------------------------------
describe('ReviewsQueue schema', () => {
  it('parses a valid queue response', () => {
    const payload = {
      items: [
        {
          review_id: 'r1',
          case_id: 'c1',
          queued_at: '2026-01-01T00:00:00Z',
          priority: 'medium',
          status: 'new',
        },
      ],
      count: 1,
    };
    const result = ReviewsQueue.parse(payload);
    expect(result.count).toBe(1);
    expect(result.items).toHaveLength(1);
  });

  it('rejects a queue missing items', () => {
    expect(() => ReviewsQueue.parse({ count: 0 })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// DecisionRequest
// ---------------------------------------------------------------------------
describe('DecisionRequest schema', () => {
  it('parses approve with notes', () => {
    const result = DecisionRequest.parse({ decision: 'approve', notes: 'Looks good' });
    expect(result.decision).toBe('approve');
    expect(result.notes).toBe('Looks good');
  });

  it('parses reject with no notes', () => {
    const result = DecisionRequest.parse({ decision: 'reject' });
    expect(result.decision).toBe('reject');
  });

  it('rejects an invalid decision value', () => {
    expect(() => DecisionRequest.parse({ decision: 'maybe' })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// DecisionResponse
// ---------------------------------------------------------------------------
describe('DecisionResponse schema', () => {
  it('parses a valid response', () => {
    const result = DecisionResponse.parse({ reviewId: 'r1', status: 'approved' });
    expect(result.reviewId).toBe('r1');
  });

  it('rejects a response missing reviewId', () => {
    expect(() => DecisionResponse.parse({ status: 'approved' })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// AuditLog
// ---------------------------------------------------------------------------
describe('AuditLog schema', () => {
  it('parses a valid actions response', () => {
    const payload = {
      reviewId: 'r1',
      actions: [
        {
          action_id: 'a1',
          actor: 'analyst@example.com',
          action: 'status_change',
          payload: { old: 'new', new: 'approved' },
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
    };
    const result = AuditLog.parse(payload);
    expect(result.actions).toHaveLength(1);
  });

  it('rejects a response missing reviewId', () => {
    expect(() => AuditLog.parse({ actions: [] })).toThrow();
  });
});
