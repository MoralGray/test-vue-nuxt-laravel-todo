import { describe, expect, it } from 'vitest';
import { extractError } from './api';

describe('extractError', () => {
  it('returns message from data', () => {
    const err = { status: 422, data: { message: 'Validation failed.' } };
    expect(extractError(err, 'Fallback')).toBe('Validation failed.');
  });

  it('returns fallback when data is missing', () => {
    const err = { status: 500 };
    expect(extractError(err, 'Fallback')).toBe('Fallback');
  });

  it('returns fallback when message is missing', () => {
    const err = { status: 500, data: { errors: {} } };
    expect(extractError(err, 'Fallback')).toBe('Fallback');
  });
});
