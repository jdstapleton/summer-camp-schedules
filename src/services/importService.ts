import type { Contact, Custody, Gender } from '@/models/types';
import {
  DEFAULT_IMPORT_COLUMNS,
  type ImportColumnConfig,
} from './importColumnConfig';

export interface ParsedStudent {
  dedupeKey: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
  custody: Custody;
  photo: boolean;
  preCamp: boolean;
  postCamp: boolean;
  specialRequest: string;
  medicalIssues: string;
  primary: Contact;
  secondary: Contact;
  emergency: Contact;
}

export interface ParsedImport {
  students: ParsedStudent[];
  campNames: string[];
  registrationRows: { campName: string; dedupeKey: string }[];
  warnings: string[];
  skippedRows: { rowNumber: number; reason: string }[];
}

export const makeDedupeKey = (
  firstName: string,
  lastName: string,
  age: number
): string =>
  `${lastName.trim().toLowerCase()}|${firstName.trim().toLowerCase()}|${age}`;

export const extractCampName = (sessionName: string): string => {
  const normalized = sessionName.replace(/–|—/g, '-').trim();
  const lastDash = normalized.lastIndexOf('-');
  if (lastDash === -1) return normalized;
  return normalized.slice(0, lastDash).trim();
};

const normalizeGender = (raw: string): Gender => {
  const v = raw.trim().toLowerCase();
  if (v === 'male' || v === 'm') return 'male';
  if (v === 'female' || v === 'f') return 'female';
  return 'other';
};

const normalizeCustody = (raw: string): Custody => {
  const v = raw.trim().toLowerCase();
  if (v === 'father') return 'Father';
  if (v === 'mother') return 'Mother';
  return 'Both';
};

const detectPreCamp = (selections: string): boolean =>
  /pre[- ]?camp care/i.test(selections);

const detectPostCamp = (selections: string): boolean =>
  /post[- ]?camp care/i.test(selections);

const parsePhoto = (raw: string): boolean => raw.trim().toLowerCase() === 'yes';

interface CellLike {
  text?: string;
  value?: unknown;
}

const readCell = (cell: CellLike | undefined): string => {
  if (!cell) return '';
  const text = cell.text;
  if (typeof text === 'string' && text.length > 0) return text.trim();
  const value = cell.value;
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  if (typeof value === 'object') {
    const obj = value as { result?: unknown; text?: unknown };
    if (obj.result != null) return String(obj.result).trim();
    if (obj.text != null) return String(obj.text).trim();
  }
  return '';
};

export async function parseXlsx(
  buffer: ArrayBuffer,
  config: ImportColumnConfig = DEFAULT_IMPORT_COLUMNS
): Promise<ParsedImport> {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error('The workbook contains no worksheets.');
  }

  const headerRow = sheet.getRow(1);
  const headerToIndex = new Map<string, number>();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const text = readCell(cell).toLowerCase();
    if (text.length > 0 && !headerToIndex.has(text)) {
      headerToIndex.set(text, colNumber);
    }
  });

  const resolve = (header: string): number | undefined =>
    headerToIndex.get(header.trim().toLowerCase());

  const required: { key: keyof ImportColumnConfig; header: string }[] = (
    Object.keys(config) as (keyof ImportColumnConfig)[]
  ).map((key) => ({ key, header: config[key] }));

  const missing = required.filter(({ header }) => resolve(header) === undefined);
  if (missing.length > 0) {
    const names = missing.map((m) => `"${m.header}"`).join(', ');
    throw new Error(
      `The import file is missing required column header(s): ${names}. ` +
        `Update the expected headers in importColumnConfig.ts if the source format changed.`
    );
  }

  const col = {
    lastName: resolve(config.lastName)!,
    firstName: resolve(config.firstName)!,
    gender: resolve(config.gender)!,
    age: resolve(config.age)!,
    sessionName: resolve(config.sessionName)!,
    selections: resolve(config.selections)!,
    specialRequest: resolve(config.specialRequest)!,
    medicalIssues: resolve(config.medicalIssues)!,
    photo: resolve(config.photo)!,
    primaryName: resolve(config.primaryName)!,
    primaryHomePhone: resolve(config.primaryHomePhone)!,
    primaryCellPhone: resolve(config.primaryCellPhone)!,
    secondaryName: resolve(config.secondaryName)!,
    secondaryCellPhone: resolve(config.secondaryCellPhone)!,
    emergencyName: resolve(config.emergencyName)!,
    emergencyPhone: resolve(config.emergencyPhone)!,
    custody: resolve(config.custody)!,
  };

  const warnings: string[] = [];
  const skippedRows: { rowNumber: number; reason: string }[] = [];
  const studentsByKey = new Map<string, ParsedStudent>();
  const campNames = new Set<string>();
  const campNameCanonical = new Map<string, string>();
  const registrationRows: { campName: string; dedupeKey: string }[] = [];

  const lastRow = sheet.actualRowCount || sheet.rowCount;
  for (let r = 2; r <= lastRow; r++) {
    const row = sheet.getRow(r);
    const lastName = readCell(row.getCell(col.lastName));
    const firstName = readCell(row.getCell(col.firstName));

    if (lastName.toLowerCase() === 'count') continue;
    if (lastName === '' && firstName === '') continue;

    const ageRaw = readCell(row.getCell(col.age));
    let age = parseInt(ageRaw, 10);
    if (isNaN(age)) {
      warnings.push(
        `Row ${r} (${lastName}, ${firstName}): age "${ageRaw}" is not numeric; defaulting to 0.`
      );
      age = 0;
    }

    const genderRaw = readCell(row.getCell(col.gender));
    const gender = normalizeGender(genderRaw);
    if (gender === 'other' && genderRaw !== '' && genderRaw.toLowerCase() !== 'other') {
      warnings.push(
        `Row ${r} (${lastName}, ${firstName}): gender "${genderRaw}" not recognized; defaulting to "other".`
      );
    }

    const custodyRaw = readCell(row.getCell(col.custody));
    const custody = normalizeCustody(custodyRaw);
    if (
      custody === 'Both' &&
      custodyRaw !== '' &&
      custodyRaw.toLowerCase() !== 'both'
    ) {
      warnings.push(
        `Row ${r} (${lastName}, ${firstName}): custody "${custodyRaw}" not recognized; defaulting to "Both".`
      );
    }

    const sessionName = readCell(row.getCell(col.sessionName));
    if (sessionName === '') {
      skippedRows.push({
        rowNumber: r,
        reason: 'Session name is empty.',
      });
      continue;
    }
    const campName = extractCampName(sessionName);
    if (campName === '') {
      skippedRows.push({
        rowNumber: r,
        reason: `Session name "${sessionName}" yielded an empty camp name.`,
      });
      continue;
    }

    const selections = readCell(row.getCell(col.selections));
    const preCamp = detectPreCamp(selections);
    const postCamp = detectPostCamp(selections);

    const photo = parsePhoto(readCell(row.getCell(col.photo)));
    const specialRequest = readCell(row.getCell(col.specialRequest));
    const medicalIssues = readCell(row.getCell(col.medicalIssues));

    const primary: Contact = {
      name: readCell(row.getCell(col.primaryName)),
      homePhone: readCell(row.getCell(col.primaryHomePhone)),
      cellPhone: readCell(row.getCell(col.primaryCellPhone)),
    };
    const secondary: Contact = {
      name: readCell(row.getCell(col.secondaryName)),
      homePhone: '',
      cellPhone: readCell(row.getCell(col.secondaryCellPhone)),
    };
    const emergency: Contact = {
      name: readCell(row.getCell(col.emergencyName)),
      homePhone: '',
      cellPhone: readCell(row.getCell(col.emergencyPhone)),
    };

    const dedupeKey = makeDedupeKey(firstName, lastName, age);

    if (!studentsByKey.has(dedupeKey)) {
      studentsByKey.set(dedupeKey, {
        dedupeKey,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        age,
        custody,
        photo,
        preCamp,
        postCamp,
        specialRequest,
        medicalIssues,
        primary,
        secondary,
        emergency,
      });
    }

    const canonicalKey = campName.toLowerCase();
    if (!campNameCanonical.has(canonicalKey)) {
      campNameCanonical.set(canonicalKey, campName);
      campNames.add(campName);
    }

    registrationRows.push({
      campName: campNameCanonical.get(canonicalKey)!,
      dedupeKey,
    });
  }

  return {
    students: Array.from(studentsByKey.values()),
    campNames: Array.from(campNames),
    registrationRows,
    warnings,
    skippedRows,
  };
}
