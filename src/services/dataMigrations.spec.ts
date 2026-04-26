import { describe, it, expect } from 'vitest';
import { getSchemaVersion, migrateData } from './dataMigrations';

describe('getSchemaVersion', () => {
  it('returns 7', () => {
    expect(getSchemaVersion()).toBe(7);
  });
});

describe('migrateData', () => {
  it('returns empty ScheduleData for null', () => {
    const result = migrateData(null);
    expect(result.version).toBe(7);
    expect(result.students).toEqual([]);
    expect(result.camps).toEqual([]);
    expect(result.registrations).toEqual([]);
    expect(result.schedule).toBeNull();
  });

  it('returns empty ScheduleData for a non-object primitive', () => {
    const result = migrateData('invalid');
    expect(result.version).toBe(7);
    expect(result.students).toEqual([]);
  });

  it('throws when version is lower than current', () => {
    expect(() => migrateData({ version: 5, students: [], camps: [], registrations: [], schedule: null })).toThrow('Data version 5 is no longer supported.');
  });

  it('throws when version field is absent (treated as version 0)', () => {
    expect(() => migrateData({ students: [], camps: [], registrations: [], schedule: null })).toThrow('Data version 0 is no longer supported.');
  });

  it('normalizes negative medicalIssues and specialRequest to empty strings', () => {
    const input = {
      version: 7,
      students: [
        {
          id: 's1',
          firstName: 'Alice',
          lastName: 'Smith',
          medicalIssues: 'None',
          specialRequest: 'No',
        },
      ],
      camps: [],
      registrations: [],
      schedule: null,
    };
    const result = migrateData(input);
    expect(result.students[0].medicalIssues).toBe('');
    expect(result.students[0].specialRequest).toBe('');
  });

  it('preserves real content in medicalIssues and specialRequest', () => {
    const input = {
      version: 7,
      students: [
        {
          id: 's1',
          firstName: 'Alice',
          lastName: 'Smith',
          medicalIssues: 'Peanut allergy',
          specialRequest: 'Please group with Bob',
        },
      ],
      camps: [],
      registrations: [],
      schedule: null,
    };
    const result = migrateData(input);
    expect(result.students[0].medicalIssues).toBe('Peanut allergy');
    expect(result.students[0].specialRequest).toBe('Please group with Bob');
  });

  it('passes camps, registrations, and schedule through unchanged', () => {
    const input = {
      version: 7,
      students: [],
      camps: [{ id: 'c1', name: 'Art', gradeRange: 'Grades 1-3', week: 'June 8', maxSize: 10 }],
      registrations: [{ campId: 'c1', studentIds: [], friendGroups: [] }],
      schedule: null,
    };
    const result = migrateData(input);
    expect(result.camps).toHaveLength(1);
    expect(result.registrations).toHaveLength(1);
  });

  it('defaults missing arrays to empty when data object is incomplete', () => {
    const result = migrateData({ version: 7 });
    expect(result.students).toEqual([]);
    expect(result.camps).toEqual([]);
    expect(result.registrations).toEqual([]);
    expect(result.schedule).toBeNull();
  });

  it('normalizes students with missing medicalIssues or specialRequest fields', () => {
    const input = {
      version: 7,
      students: [{ id: 's1', firstName: 'Alice', lastName: 'Smith' }],
      camps: [],
      registrations: [],
      schedule: null,
    };
    const result = migrateData(input);
    expect(result.students[0].medicalIssues).toBe('');
    expect(result.students[0].specialRequest).toBe('');
  });
});
