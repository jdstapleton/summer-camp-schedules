import { describe, it, expect } from 'vitest';
import { normalizeTshirtSize } from './tshirtSizeNormalization';

describe('normalizeTshirtSize', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeTshirtSize('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeTshirtSize('   ')).toBe('');
  });

  it('returns trimmed original for an unknown value', () => {
    expect(normalizeTshirtSize('UnknownSize')).toBe('UnknownSize');
    expect(normalizeTshirtSize('  UnknownSize  ')).toBe('UnknownSize');
  });

  it.each([
    ['youth extra small', 'Youth Extra Small'],
    ['yxs', 'Youth Extra Small'],
    ['youth small', 'Youth Small'],
    ['ys', 'Youth Small'],
    ['youth medium', 'Youth Medium'],
    ['ym', 'Youth Medium'],
    ['youth large', 'Youth Large'],
    ['yl', 'Youth Large'],
    ['youth extra large', 'Youth Extra Large'],
    ['yxl', 'Youth Extra Large'],
  ])('maps youth size "%s" → "%s"', (input, expected) => {
    expect(normalizeTshirtSize(input)).toBe(expected);
  });

  it.each([
    ['small', 'Small'],
    ['s', 'Small'],
    ['medium', 'Medium'],
    ['m', 'Medium'],
    ['large', 'Large'],
    ['l', 'Large'],
    ['extra large', 'Extra Large'],
    ['xl', 'Extra Large'],
    ['2xl', '2XL'],
    ['xxl', '2XL'],
    ['3xl', '3XL'],
    ['4xl', '4XL'],
  ])('maps adult size "%s" → "%s"', (input, expected) => {
    expect(normalizeTshirtSize(input)).toBe(expected);
  });

  it('maps child size variants to Youth equivalents', () => {
    expect(normalizeTshirtSize('child small')).toBe('Youth Small');
    expect(normalizeTshirtSize("child's large")).toBe('Youth Large');
    expect(normalizeTshirtSize('childs xl')).toBe('Youth Extra Large');
  });

  it('maps Adult-prefixed sizes', () => {
    expect(normalizeTshirtSize('adult small')).toBe('Adult Small');
    expect(normalizeTshirtSize('adult medium')).toBe('Adult Medium');
    expect(normalizeTshirtSize('adult large')).toBe('Adult Large');
  });

  it('is case-insensitive', () => {
    expect(normalizeTshirtSize('SMALL')).toBe('Small');
    expect(normalizeTshirtSize('Youth MEDIUM')).toBe('Youth Medium');
  });

  it('trims leading and trailing whitespace before lookup', () => {
    expect(normalizeTshirtSize('  small  ')).toBe('Small');
  });
});
