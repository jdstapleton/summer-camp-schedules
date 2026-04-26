import { describe, it, expect } from 'vitest';
import { normalizeNegativeResponses } from './normalizeFieldValues';

describe('normalizeNegativeResponses', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeNegativeResponses('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeNegativeResponses('   ')).toBe('');
  });

  it.each(['no', 'n', 'none', 'n/a', 'na', 'not applicable', 'nothing', 'nope', '-', 'none known'])('normalizes "%s" to empty string', (value) => {
    expect(normalizeNegativeResponses(value)).toBe('');
  });

  it('is case-insensitive', () => {
    expect(normalizeNegativeResponses('No')).toBe('');
    expect(normalizeNegativeResponses('NONE')).toBe('');
    expect(normalizeNegativeResponses('N/A')).toBe('');
  });

  it('strips trailing punctuation before matching (line 11 branch)', () => {
    expect(normalizeNegativeResponses('No.')).toBe('');
    expect(normalizeNegativeResponses('None!')).toBe('');
    expect(normalizeNegativeResponses('n/a,')).toBe('');
    expect(normalizeNegativeResponses('none—')).toBe('');
  });

  it('returns the original value when trailing punctuation strip leaves non-negative content', () => {
    // 'allergy.' → strip trailing '.' → 'allergy' → not in set → return original
    expect(normalizeNegativeResponses('allergy.')).toBe('allergy.');
  });

  it('preserves real medical or special-request content', () => {
    expect(normalizeNegativeResponses('Peanut allergy')).toBe('Peanut allergy');
    expect(normalizeNegativeResponses('Please group with Bob')).toBe('Please group with Bob');
  });
});
