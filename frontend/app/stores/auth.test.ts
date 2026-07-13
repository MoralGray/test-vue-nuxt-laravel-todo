import { describe, expect, it } from 'vitest';
import type { Task } from '~/stores/tasks';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

function isValidAuthData(data: unknown): data is { token: string; user: User } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'token' in data &&
    typeof (data as Record<string, unknown>).token === 'string' &&
    'user' in data &&
    typeof (data as Record<string, unknown>).user === 'object'
  );
}

function canModify(user: User | null, task: Task): boolean {
  if (!user) {
    return false;
  }
  return user.is_admin || user.id === task.user_id;
}

describe('isValidAuthData', () => {
  it('accepts valid data', () => {
    const data = { token: 'abc', user: { id: 1, name: 'Test', email: 't@t.com', is_admin: false } };
    expect(isValidAuthData(data)).toBe(true);
  });

  it('rejects null', () => {
    expect(isValidAuthData(null)).toBe(false);
  });

  it('rejects missing token', () => {
    const data = { user: { id: 1 } };
    expect(isValidAuthData(data)).toBe(false);
  });

  it('rejects non-string token', () => {
    const data = { token: 123, user: { id: 1 } };
    expect(isValidAuthData(data)).toBe(false);
  });

  it('rejects missing user', () => {
    const data = { token: 'abc' };
    expect(isValidAuthData(data)).toBe(false);
  });
});

describe('canModify', () => {
  const task: Task = {
    id: 1,
    user_id: 1,
    title: 't',
    description: null,
    due_date: null,
    status: 'pending',
    created_at: '',
    updated_at: '',
  };

  it('allows owner', () => {
    const user: User = { id: 1, name: 'U', email: 'u@u.com', is_admin: false };
    expect(canModify(user, task)).toBe(true);
  });

  it('allows admin', () => {
    const user: User = { id: 2, name: 'A', email: 'a@a.com', is_admin: true };
    expect(canModify(user, task)).toBe(true);
  });

  it('denies non-owner non-admin', () => {
    const user: User = { id: 2, name: 'U', email: 'u@u.com', is_admin: false };
    expect(canModify(user, task)).toBe(false);
  });

  it('denies null user', () => {
    expect(canModify(null, task)).toBe(false);
  });
});
