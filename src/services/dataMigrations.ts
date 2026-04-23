/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ScheduleData } from '@/models/types';

const CURRENT_VERSION = 2;

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

  // Ensure version is set
  if (!currentData.version) {
    currentData.version = CURRENT_VERSION;
  }

  return currentData as ScheduleData;
};

export const getSchemaVersion = (): number => CURRENT_VERSION;
