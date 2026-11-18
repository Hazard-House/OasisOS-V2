import { describe, expect, it } from 'vitest';
import { normalizeCredential } from './base-provider';

describe('normalizeCredential', () => {
  it('strips quotes, a bearer prefix, and surrounding whitespace', () => {
    expect(normalizeCredential('  "Bearer sk-or-v1-example"  ')).toBe('sk-or-v1-example');
    expect(normalizeCredential("'sk-or-v1-example'\n")).toBe('sk-or-v1-example');
  });

  it('drops an empty or non-string value', () => {
    expect(normalizeCredential('   ')).toBeUndefined();
    expect(normalizeCredential(undefined)).toBeUndefined();
  });
});
