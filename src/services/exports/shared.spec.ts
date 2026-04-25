import { describe, expect, it } from 'vitest';
import type { Student } from '@/models/types';
import { firstNonEmpty, getEmergencyPhone, getInstanceSheetName, getSecondaryCellPhone, sanitizeSheetName, studentSortCompare, yesOrBlank, yesOrNo } from './shared';

const makeStudent = (overrides: Partial<Student> = {}): Student => ({
  id: 's1',
  firstName: 'Jane',
  lastName: 'Smith',
  gender: 'female',
  age: 9,
  custody: 'Both',
  photo: true,
  preCamp: false,
  postCamp: false,
  specialRequest: '',
  medicalIssues: '',
  tshirtSize: '',
  primary: { name: '', homePhone: '', cellPhone: '' },
  secondary: { name: '', homePhone: '', cellPhone: '' },
  emergency: { name: '', homePhone: '', cellPhone: '' },
  ...overrides,
});

describe('sanitizeSheetName', () => {
  it('strips forbidden characters', () => {
    expect(sanitizeSheetName('A/B\\C?D*E[F]G:H')).toBe('ABCDEFGH');
  });

  it('collapses whitespace and trims', () => {
    expect(sanitizeSheetName('  a   b  ')).toBe('a b');
  });

  it('returns "Sheet" for empty or purely illegal input', () => {
    expect(sanitizeSheetName('')).toBe('Sheet');
    expect(sanitizeSheetName('///')).toBe('Sheet');
  });

  it('truncates to 31 characters', () => {
    const long = 'a'.repeat(50);
    expect(sanitizeSheetName(long)).toHaveLength(31);
  });
});

describe('getInstanceSheetName', () => {
  it('omits instance number when only one instance exists', () => {
    const used = new Set<string>();
    expect(getInstanceSheetName('3D Creator', 1, 1, used)).toBe('3D Creator');
  });

  it('appends instance number when multiple exist', () => {
    const used = new Set<string>();
    expect(getInstanceSheetName('3D Creator', 2, 3, used)).toBe('3D Creator 2');
  });

  it('resolves collisions with a numeric suffix', () => {
    const used = new Set<string>();
    const a = getInstanceSheetName('Camp', 1, 1, used);
    const b = getInstanceSheetName('Camp', 1, 1, used);
    expect(a).toBe('Camp');
    expect(b).toBe('Camp (2)');
  });

  it('resolves collisions after 31-char truncation', () => {
    const used = new Set<string>();
    const long = 'A'.repeat(40);
    const a = getInstanceSheetName(long, 1, 1, used);
    const b = getInstanceSheetName(long, 1, 1, used);
    expect(a).toHaveLength(31);
    expect(b).toHaveLength(31);
    expect(a).not.toBe(b);
  });
});

describe('firstNonEmpty', () => {
  it('returns the first non-empty value', () => {
    expect(firstNonEmpty('', '', 'hit', 'miss')).toBe('hit');
  });

  it('returns empty string when all inputs empty', () => {
    expect(firstNonEmpty('', '  ', '')).toBe('');
  });
});

describe('getEmergencyPhone', () => {
  it('prefers home, falls back to cell', () => {
    expect(
      getEmergencyPhone(
        makeStudent({
          emergency: { name: 'x', homePhone: '555-1', cellPhone: '555-2' },
        })
      )
    ).toBe('555-1');
    expect(
      getEmergencyPhone(
        makeStudent({
          emergency: { name: 'x', homePhone: '', cellPhone: '555-2' },
        })
      )
    ).toBe('555-2');
  });
});

describe('getSecondaryCellPhone', () => {
  it('prefers cell, falls back to home', () => {
    expect(
      getSecondaryCellPhone(
        makeStudent({
          secondary: { name: 'x', homePhone: '555-1', cellPhone: '555-2' },
        })
      )
    ).toBe('555-2');
    expect(
      getSecondaryCellPhone(
        makeStudent({
          secondary: { name: 'x', homePhone: '555-1', cellPhone: '' },
        })
      )
    ).toBe('555-1');
  });
});

describe('studentSortCompare', () => {
  it('sorts by lastName then firstName, case-insensitive', () => {
    const students = [
      makeStudent({ lastName: 'Brown', firstName: 'Zoe' }),
      makeStudent({ lastName: 'adams', firstName: 'John' }),
      makeStudent({ lastName: 'Adams', firstName: 'Alice' }),
    ];
    const sorted = [...students].sort(studentSortCompare);
    expect(sorted.map((s) => `${s.lastName} ${s.firstName}`)).toEqual(['Adams Alice', 'adams John', 'Brown Zoe']);
  });
});

describe('yesOrBlank / yesOrNo', () => {
  it('yesOrBlank', () => {
    expect(yesOrBlank(true)).toBe('Yes');
    expect(yesOrBlank(false)).toBe('');
  });
  it('yesOrNo', () => {
    expect(yesOrNo(true)).toBe('Yes');
    expect(yesOrNo(false)).toBe('No');
  });
});
