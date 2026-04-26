import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CampInstance, Student } from '@/models/types';
import {
  applyCellBorders,
  applyCellFill,
  buildInstancesGroupedByCamp,
  firstNonEmpty,
  getEmergencyPhone,
  getInstanceSheetName,
  getSecondaryCellPhone,
  sanitizeSheetName,
  saveWorkbook,
  studentSortCompare,
  yesOrBlank,
  yesOrNo,
} from './shared';

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

describe('applyCellFill', () => {
  it('sets the fill pattern on the cell and returns it', () => {
    const cell = { fill: undefined as unknown };
    const returned = applyCellFill(cell as Parameters<typeof applyCellFill>[0], 'FFFF0000');
    expect(cell.fill).toEqual({
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF0000' },
    });
    expect(returned).toBe(cell);
  });
});

describe('applyCellBorders', () => {
  it('sets thin borders on all four sides and returns the cell', () => {
    const cell = { border: undefined as unknown };
    const returned = applyCellBorders(cell as Parameters<typeof applyCellBorders>[0]);
    expect(cell.border).toEqual({
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    });
    expect(returned).toBe(cell);
  });

  it('returns undefined without throwing when called with no argument', () => {
    expect(() => applyCellBorders(undefined)).not.toThrow();
    expect(applyCellBorders(undefined)).toBeUndefined();
  });
});

describe('buildInstancesGroupedByCamp', () => {
  it('groups instances by campId and sorts each group by instanceNumber', () => {
    const instances: CampInstance[] = [
      { id: 'c1-2', campId: 'c1', instanceNumber: 2, studentIds: [] },
      { id: 'c2-1', campId: 'c2', instanceNumber: 1, studentIds: [] },
      { id: 'c1-1', campId: 'c1', instanceNumber: 1, studentIds: [] },
    ];
    const grouped = buildInstancesGroupedByCamp(instances);
    expect(grouped.size).toBe(2);
    const c1 = grouped.get('c1')!;
    expect(c1).toHaveLength(2);
    expect(c1[0].instanceNumber).toBe(1);
    expect(c1[1].instanceNumber).toBe(2);
    expect(grouped.get('c2')).toHaveLength(1);
  });

  it('returns an empty map for empty input', () => {
    expect(buildInstancesGroupedByCamp([])).toEqual(new Map());
  });
});

describe('saveWorkbook', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes the workbook buffer, triggers a download, and revokes the URL', async () => {
    const anchor = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor as unknown as HTMLElement);
    const mockWorkbook = {
      xlsx: { writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)) },
    };

    await saveWorkbook(mockWorkbook as unknown as Parameters<typeof saveWorkbook>[0], 'report.xlsx');

    expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalledOnce();
    expect(anchor.download).toBe('report.xlsx');
    expect(anchor.click).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });
});

describe('getInstanceSheetName fallback', () => {
  it('returns a timestamp-based name after 999 collision slots are exhausted', () => {
    const used = new Set<string>();
    const candidate = sanitizeSheetName('Camp');
    used.add(candidate);
    for (let n = 2; n < 1000; n++) {
      const suffix = ` (${n})`;
      const trimmed = candidate.slice(0, 31 - suffix.length);
      used.add(`${trimmed}${suffix}`);
    }
    vi.spyOn(Date, 'now').mockReturnValueOnce(1234567890);
    const result = getInstanceSheetName('Camp', 1, 1, used);
    expect(result).toContain('1234567890');
    vi.restoreAllMocks();
  });
});
