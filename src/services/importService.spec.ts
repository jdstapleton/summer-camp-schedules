import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import {
  extractCampName,
  makeDedupeKey,
  parseXlsx,
} from './importService';
import { DEFAULT_IMPORT_COLUMNS } from './importColumnConfig';

describe('makeDedupeKey', () => {
  it('normalizes case and whitespace', () => {
    expect(makeDedupeKey(' Jane ', 'Smith', 9)).toBe('smith|jane|9');
    expect(makeDedupeKey('Jane', 'SMITH', 9)).toBe('smith|jane|9');
  });
});

describe('extractCampName', () => {
  it('strips the suffix after the last hyphen', () => {
    expect(extractCampName('3D Creator-Richmond Academy')).toBe('3D Creator');
  });

  it('handles multiple hyphens by splitting on the last', () => {
    expect(extractCampName('Foo-Bar-Location')).toBe('Foo-Bar');
  });

  it('returns the whole name when no hyphen is present', () => {
    expect(extractCampName('Minecraft Mania')).toBe('Minecraft Mania');
  });

  it('normalizes en-dashes before splitting', () => {
    expect(extractCampName('3D Creator–Richmond Academy')).toBe(
      '3D Creator'
    );
  });

  it('trims whitespace', () => {
    expect(extractCampName('  3D Creator - Richmond  ')).toBe('3D Creator');
  });
});

const HEADER_ROW = [
  DEFAULT_IMPORT_COLUMNS.lastName,
  DEFAULT_IMPORT_COLUMNS.firstName,
  DEFAULT_IMPORT_COLUMNS.gender,
  DEFAULT_IMPORT_COLUMNS.age,
  'Date of birth',
  'Session location',
  DEFAULT_IMPORT_COLUMNS.sessionName,
  DEFAULT_IMPORT_COLUMNS.selections,
  DEFAULT_IMPORT_COLUMNS.specialRequest,
  DEFAULT_IMPORT_COLUMNS.medicalIssues,
  DEFAULT_IMPORT_COLUMNS.photo,
  DEFAULT_IMPORT_COLUMNS.primaryName,
  DEFAULT_IMPORT_COLUMNS.primaryHomePhone,
  DEFAULT_IMPORT_COLUMNS.primaryCellPhone,
  DEFAULT_IMPORT_COLUMNS.secondaryName,
  DEFAULT_IMPORT_COLUMNS.secondaryCellPhone,
  DEFAULT_IMPORT_COLUMNS.emergencyName,
  DEFAULT_IMPORT_COLUMNS.emergencyPhone,
  "Participant: Doctor's Name",
  "Participant: Doctor's phone number?",
  DEFAULT_IMPORT_COLUMNS.custody,
  'Waivers',
];

async function buildXlsx(rows: unknown[][]): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet('test');
  sheet.addRow(HEADER_ROW);
  for (const row of rows) sheet.addRow(row);
  const buffer = await wb.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

function dataRow(overrides: Partial<Record<string, unknown>> = {}): unknown[] {
  const defaults = {
    lastName: 'Smith',
    firstName: 'Jane',
    gender: 'Female',
    age: 9,
    dob: '1/1/2015',
    sessionLocation: 'Richmond Academy - Richmond, VA',
    sessionName: '3D Creator-Richmond Academy',
    selections: 'Price',
    specialRequest: '',
    medicalIssues: 'None',
    photo: 'Yes',
    primaryName: 'Mary Smith',
    primaryHomePhone: '555-0100',
    primaryCellPhone: '555-0101',
    secondaryName: 'Joe Smith',
    secondaryCellPhone: '555-0200',
    emergencyName: 'Grandma Smith',
    emergencyPhone: '555-0300',
    doctorName: 'Dr. Who',
    doctorPhone: '555-9999',
    custody: 'Both',
    waivers: 'Summer Camp Waiver - Received',
    ...overrides,
  };
  return [
    defaults.lastName,
    defaults.firstName,
    defaults.gender,
    defaults.age,
    defaults.dob,
    defaults.sessionLocation,
    defaults.sessionName,
    defaults.selections,
    defaults.specialRequest,
    defaults.medicalIssues,
    defaults.photo,
    defaults.primaryName,
    defaults.primaryHomePhone,
    defaults.primaryCellPhone,
    defaults.secondaryName,
    defaults.secondaryCellPhone,
    defaults.emergencyName,
    defaults.emergencyPhone,
    defaults.doctorName,
    defaults.doctorPhone,
    defaults.custody,
    defaults.waivers,
  ];
}

describe('parseXlsx', () => {
  it('parses a simple row into a ParsedStudent + registrationRow', async () => {
    const buf = await buildXlsx([dataRow()]);
    const result = await parseXlsx(buf);

    expect(result.students).toHaveLength(1);
    expect(result.campNames).toEqual(['3D Creator']);
    expect(result.registrationRows).toEqual([
      { campName: '3D Creator', dedupeKey: 'smith|jane|9' },
    ]);

    const s = result.students[0];
    expect(s.firstName).toBe('Jane');
    expect(s.lastName).toBe('Smith');
    expect(s.gender).toBe('female');
    expect(s.age).toBe(9);
    expect(s.custody).toBe('Both');
    expect(s.photo).toBe(true);
    expect(s.preCamp).toBe(false);
    expect(s.postCamp).toBe(false);
    expect(s.primary).toEqual({
      name: 'Mary Smith',
      homePhone: '555-0100',
      cellPhone: '555-0101',
    });
    expect(s.secondary).toEqual({
      name: 'Joe Smith',
      homePhone: '',
      cellPhone: '555-0200',
    });
    expect(s.emergency).toEqual({
      name: 'Grandma Smith',
      homePhone: '',
      cellPhone: '555-0300',
    });
  });

  it('detects Pre-Camp and Post-Camp from Selections', async () => {
    const buf = await buildXlsx([
      dataRow({ selections: 'Price, Pre-Camp Care*' }),
      dataRow({
        firstName: 'John',
        selections: 'Price, Pre-Camp Care*, Post-Camp Care*',
      }),
      dataRow({ firstName: 'Ann', selections: 'Price, Post-Camp Care*' }),
    ]);
    const result = await parseXlsx(buf);
    expect(result.students).toHaveLength(3);
    const byName = new Map(result.students.map((s) => [s.firstName, s]));
    expect(byName.get('Jane')!.preCamp).toBe(true);
    expect(byName.get('Jane')!.postCamp).toBe(false);
    expect(byName.get('John')!.preCamp).toBe(true);
    expect(byName.get('John')!.postCamp).toBe(true);
    expect(byName.get('Ann')!.preCamp).toBe(false);
    expect(byName.get('Ann')!.postCamp).toBe(true);
  });

  it('dedupes students by (lastName, firstName, age) and collects both registrations', async () => {
    const buf = await buildXlsx([
      dataRow({ sessionName: '3D Creator-Richmond Academy' }),
      dataRow({ sessionName: 'Minecraft-Richmond Academy' }),
    ]);
    const result = await parseXlsx(buf);
    expect(result.students).toHaveLength(1);
    expect(new Set(result.campNames)).toEqual(
      new Set(['3D Creator', 'Minecraft'])
    );
    expect(result.registrationRows).toHaveLength(2);
    expect(result.registrationRows.every((r) => r.dedupeKey === 'smith|jane|9')).toBe(
      true
    );
  });

  it('skips the Count summary row and blank rows', async () => {
    const buf = await buildXlsx([
      dataRow(),
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Count', '', '', 10, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ]);
    const result = await parseXlsx(buf);
    expect(result.students).toHaveLength(1);
    expect(result.registrationRows).toHaveLength(1);
  });

  it('warns and defaults age to 0 when non-numeric', async () => {
    const buf = await buildXlsx([dataRow({ age: 'n/a' })]);
    const result = await parseXlsx(buf);
    expect(result.students[0].age).toBe(0);
    expect(result.warnings.some((w) => w.includes('age'))).toBe(true);
  });

  it('warns on unrecognized gender and falls back to other', async () => {
    const buf = await buildXlsx([dataRow({ gender: 'Unicorn' })]);
    const result = await parseXlsx(buf);
    expect(result.students[0].gender).toBe('other');
    expect(result.warnings.some((w) => w.includes('gender'))).toBe(true);
  });

  it('warns on unrecognized custody and falls back to Both', async () => {
    const buf = await buildXlsx([dataRow({ custody: 'Aunt' })]);
    const result = await parseXlsx(buf);
    expect(result.students[0].custody).toBe('Both');
    expect(result.warnings.some((w) => w.includes('custody'))).toBe(true);
  });

  it('skips rows with empty Session Name', async () => {
    const buf = await buildXlsx([dataRow({ sessionName: '' })]);
    const result = await parseXlsx(buf);
    expect(result.students).toHaveLength(0);
    expect(result.skippedRows).toHaveLength(1);
  });

  it('throws when required headers are missing', async () => {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('test');
    sheet.addRow(['Wrong', 'Headers']);
    sheet.addRow(['x', 'y']);
    const buf = (await wb.xlsx.writeBuffer()) as ArrayBuffer;
    await expect(parseXlsx(buf)).rejects.toThrow(/missing required column/);
  });

  it('resolves headers case-insensitively', async () => {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('test');
    sheet.addRow(HEADER_ROW.map((h) => h.toUpperCase()));
    sheet.addRow(dataRow());
    const buf = (await wb.xlsx.writeBuffer()) as ArrayBuffer;
    const result = await parseXlsx(buf);
    expect(result.students).toHaveLength(1);
  });
});
