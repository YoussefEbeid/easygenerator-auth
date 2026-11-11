import { describe, expect, it } from 'vitest';
import { signUpSchema } from './schemas';

const valid = { email: 'jane@example.com', name: 'Jane', password: 'hunter2025!' };

describe('signUpSchema', () => {
  it('accepts valid input', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a bad email', () => {
    expect(signUpSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false);
  });

  it('rejects names shorter than 3 characters', () => {
    expect(signUpSchema.safeParse({ ...valid, name: 'Jo' }).success).toBe(false);
  });

  it.each([
    ['too short', 'a1!'],
    ['no letter', '12345678!'],
    ['no number', 'abcdefgh!'],
    ['no special character', 'abcdefg1'],
  ])('rejects a password that is %s', (_label, password) => {
    expect(signUpSchema.safeParse({ ...valid, password }).success).toBe(false);
  });
});
