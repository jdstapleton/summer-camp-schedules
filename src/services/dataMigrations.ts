/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ScheduleData } from '@/models/types';
import { normalizeNegativeResponses } from './normalizeFieldValues';

const CURRENT_VERSION = 7;

export const migrateData = (data: any): ScheduleData => {
  if (!data || typeof data !== 'object') {
    return {
      version: CURRENT_VERSION,
      students: [],
      camps: [],
      registrations: [],
      schedule: null,
    };
  }

  const version = data.version ?? 0;
  if (version < CURRENT_VERSION) {
    throw new Error(`Data version ${version} is no longer supported.`);
  }

  // Normalize negative responses in medical and special request fields
  const normalizedStudents = (data.students ?? []).map((student: any) => ({
    ...student,
    medicalIssues: normalizeNegativeResponses(student.medicalIssues ?? ''),
    specialRequest: normalizeNegativeResponses(student.specialRequest ?? ''),
  }));

  return {
    version: CURRENT_VERSION,
    students: normalizedStudents,
    camps: data.camps ?? [],
    registrations: data.registrations ?? [],
    schedule: data.schedule ?? null,
  };
};

export const getSchemaVersion = (): number => CURRENT_VERSION;
