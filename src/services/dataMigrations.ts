/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ScheduleData } from '@/models/types';

const CURRENT_VERSION = 4;

export const randomSafetyCode = () =>
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

  // Ensure version is set
  if (!currentData.version) {
    currentData.version = CURRENT_VERSION;
  }

  return currentData as ScheduleData;
};

export const getSchemaVersion = (): number => CURRENT_VERSION;
