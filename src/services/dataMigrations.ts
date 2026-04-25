/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ScheduleData } from '@/models/types';
import { normalizeNegativeResponses } from './normalizeFieldValues';

const CURRENT_VERSION = 7;

const randomSafetyCode = () =>
  Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

// Version 1 → Version 2: Add emergency and backup contacts
const migrateV1toV2 = (data: any): ScheduleData => {
  const migratedStudents = data.students.map((student: any) => ({
    ...student,
    safetyCode: student.safetyCode ?? randomSafetyCode(),
    emergency: student.emergency ?? { name: '', phone: '' },
    backup: student.backup ?? { name: '', phone: '' },
  }));
  return { ...data, version: 2, students: migratedStudents };
};

// Version 2 → Version 3: Add preCamp and postCamp flags
const migrateV2toV3 = (data: any): ScheduleData => {
  const migratedStudents = data.students.map((student: any) => ({
    ...student,
    preCamp: student.preCamp ?? false,
    postCamp: student.postCamp ?? false,
  }));
  return { ...data, version: 3, students: migratedStudents };
};

// Version 3 → Version 4: Restructure contacts (primary/secondary with homePhone/cellPhone),
// add age, custody, photo, specialRequest, medicalIssues
const migrateV3toV4 = (data: any): ScheduleData => {
  const migratedStudents = data.students.map((student: any) => {
    const { emergency, backup, ...rest } = student;
    return {
      ...rest,
      age: student.age ?? 0,
      custody: student.custody ?? 'Both',
      photo: student.photo ?? false,
      specialRequest: student.specialRequest ?? '',
      medicalIssues: student.medicalIssues ?? '',
      primary: {
        name: emergency?.name ?? '',
        homePhone: '',
        cellPhone: emergency?.phone ?? '',
      },
      secondary: {
        name: backup?.name ?? '',
        homePhone: '',
        cellPhone: backup?.phone ?? '',
      },
      emergency: { name: '', homePhone: '', cellPhone: '' },
    };
  });
  return { ...data, version: 4, students: migratedStudents };
};

// Version 4 → Version 5: Remove safetyCode field
const migrateV4toV5 = (data: any): ScheduleData => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const migratedStudents = data.students.map(({ safetyCode, ...rest }: any) => rest);
  return { ...data, version: 5, students: migratedStudents };
};

// Version 5 → Version 6: Add tshirtSize field
const migrateV5toV6 = (data: any): ScheduleData => {
  const migratedStudents = data.students.map((student: any) => ({
    ...student,
    tshirtSize: student.tshirtSize ?? '',
  }));
  return { ...data, version: 6, students: migratedStudents };
};

// Version 6 → Version 7: Add schedule field for persisting generated schedules
const migrateV6toV7 = (data: any): ScheduleData => {
  return { ...data, version: 7, schedule: data.schedule ?? null };
};

export const migrateData = (data: any): ScheduleData => {
  if (!data || typeof data !== 'object') {
    return {
      version: CURRENT_VERSION,
      students: [],
      camps: [],
      registrations: [],
    };
  }

  let currentData = { ...data };
  const startVersion = currentData.version ?? 1;

  // Apply migrations in sequence
  if (startVersion < 2) {
    currentData = migrateV1toV2(currentData);
  }
  if (startVersion < 3) {
    currentData = migrateV2toV3(currentData);
  }
  if (startVersion < 4) {
    currentData = migrateV3toV4(currentData);
  }
  if (startVersion < 5) {
    currentData = migrateV4toV5(currentData);
  }
  if (startVersion < 6) {
    currentData = migrateV5toV6(currentData);
  }
  if (startVersion < 7) {
    currentData = migrateV6toV7(currentData);
  }

  // Ensure version is set
  if (!currentData.version) {
    currentData.version = CURRENT_VERSION;
  }

  // Normalize negative responses in medical and special request fields
  const normalizedStudents = currentData.students.map((student: any) => ({
    ...student,
    medicalIssues: normalizeNegativeResponses(student.medicalIssues ?? ''),
    specialRequest: normalizeNegativeResponses(student.specialRequest ?? ''),
  }));
  currentData.students = normalizedStudents;

  return currentData as ScheduleData;
};

export const getSchemaVersion = (): number => CURRENT_VERSION;
