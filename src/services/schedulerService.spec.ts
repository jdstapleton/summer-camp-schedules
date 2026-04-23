import { describe, expect, it } from 'vitest';
import { generateSchedule } from './schedulerService';
import type { ScheduleData } from '@/models/types';

const makeStudent = (id: string, gender: 'male' | 'female' | 'other') => ({
  id,
  firstName: id,
  lastName: 'Test',
  gender,
  safetyCode: '0000',
  preCamp: false,
  postCamp: false,
  emergency: { name: 'Emergency Contact', phone: '555-0000' },
  backup: { name: 'Backup Contact', phone: '555-0001' },
});

describe('generateSchedule', () => {
  it('returns no instances for empty registrations', () => {
    const data: ScheduleData = {
      version: 2,
      students: [],
      camps: [
        {
          id: 'c1',
          name: 'Art',
          gradeRange: 'Grades 1-3',
          week: 'June 8',
          maxSize: 10,
        },
      ],
      registrations: [{ campId: 'c1', studentIds: [], friendGroups: [] }],
    };
    const result = generateSchedule(data);
    expect(result.instances).toHaveLength(0);
  });

  it('creates a single instance when enrollment is within maxSize', () => {
    const students = ['s1', 's2', 's3'].map((id) => makeStudent(id, 'male'));
    const data: ScheduleData = {
      version: 2,
      students,
      camps: [
        {
          id: 'c1',
          name: 'Art',
          gradeRange: 'Grades 1-3',
          week: 'June 8',
          maxSize: 10,
        },
      ],
      registrations: [
        { campId: 'c1', studentIds: ['s1', 's2', 's3'], friendGroups: [] },
      ],
    };
    const result = generateSchedule(data);
    expect(result.instances).toHaveLength(1);
    expect(result.instances[0].studentIds).toHaveLength(3);
  });

  it('splits into multiple instances when enrollment exceeds maxSize', () => {
    const students = Array.from({ length: 20 }, (_, i) =>
      makeStudent(`s${i}`, 'male')
    );
    const data: ScheduleData = {
      version: 2,
      students,
      camps: [
        {
          id: 'c1',
          name: 'Chemistry',
          gradeRange: 'Grades 4-7',
          week: 'June 15',
          maxSize: 16,
        },
      ],
      registrations: [
        {
          campId: 'c1',
          studentIds: students.map((s) => s.id),
          friendGroups: [],
        },
      ],
    };
    const result = generateSchedule(data);
    expect(result.instances).toHaveLength(2);
    const total = result.instances.reduce(
      (sum, inst) => sum + inst.studentIds.length,
      0
    );
    expect(total).toBe(20);
    result.instances.forEach((inst) => {
      expect(inst.studentIds.length).toBeLessThanOrEqual(16);
    });
  });

  it('distributes genders evenly across instances', () => {
    const males = Array.from({ length: 8 }, (_, i) =>
      makeStudent(`m${i}`, 'male')
    );
    const females = Array.from({ length: 8 }, (_, i) =>
      makeStudent(`f${i}`, 'female')
    );
    const data: ScheduleData = {
      version: 2,
      students: [...males, ...females],
      camps: [
        {
          id: 'c1',
          name: 'Science',
          gradeRange: 'Grades 1-3',
          week: 'June 22',
          maxSize: 10,
        },
      ],
      registrations: [
        {
          campId: 'c1',
          studentIds: [...males, ...females].map((s) => s.id),
          friendGroups: [],
        },
      ],
    };
    const result = generateSchedule(data);
    expect(result.instances).toHaveLength(2);
    result.instances.forEach((inst) => {
      const maleCount = inst.studentIds.filter((id) =>
        id.startsWith('m')
      ).length;
      const femaleCount = inst.studentIds.filter((id) =>
        id.startsWith('f')
      ).length;
      expect(maleCount).toBe(4);
      expect(femaleCount).toBe(4);
    });
  });

  it('consolidates girls when count falls below minimum per instance', () => {
    // 5 girls, 2 instances (maxSize 10 → numInstances 1 for ≤10, need >10)
    // Use 21 students total to force 2 instances, only 5 of whom are female
    const males = Array.from({ length: 16 }, (_, i) =>
      makeStudent(`m${i}`, 'male')
    );
    const females = Array.from({ length: 5 }, (_, i) =>
      makeStudent(`f${i}`, 'female')
    );
    const data: ScheduleData = {
      version: 2,
      students: [...males, ...females],
      camps: [
        {
          id: 'c1',
          name: 'Archery',
          gradeRange: 'Grades 4-7',
          week: 'June 22',
          maxSize: 16,
        },
      ],
      registrations: [
        {
          campId: 'c1',
          studentIds: [...males, ...females].map((s) => s.id),
          friendGroups: [],
        },
      ],
    };
    const result = generateSchedule(data);
    expect(result.instances).toHaveLength(2);
    const femaleCounts = result.instances.map(
      (inst) => inst.studentIds.filter((id) => id.startsWith('f')).length
    );
    // All 5 girls should be in one instance; the other should have 0
    expect(femaleCounts).toContain(0);
    expect(femaleCounts).toContain(5);
  });

  it('consolidates boys when count falls below minimum per instance', () => {
    // 3 boys across 2 instances — should consolidate into 1 instance (min is 2)
    const females = Array.from({ length: 18 }, (_, i) =>
      makeStudent(`f${i}`, 'female')
    );
    const males = Array.from({ length: 3 }, (_, i) =>
      makeStudent(`m${i}`, 'male')
    );
    const data: ScheduleData = {
      version: 2,
      students: [...females, ...males],
      camps: [
        {
          id: 'c1',
          name: 'Coding',
          gradeRange: 'Grades 1-3',
          week: 'June 22',
          maxSize: 16,
        },
      ],
      registrations: [
        {
          campId: 'c1',
          studentIds: [...females, ...males].map((s) => s.id),
          friendGroups: [],
        },
      ],
    };
    const result = generateSchedule(data);
    expect(result.instances).toHaveLength(2);
    const maleCounts = result.instances.map(
      (inst) => inst.studentIds.filter((id) => id.startsWith('m')).length
    );
    // All 3 boys should be in one instance (3/2 = 1 instance)
    expect(maleCounts).toContain(0);
    expect(maleCounts).toContain(3);
  });

  it('keeps friend groups together in the same instance', () => {
    const students = Array.from({ length: 20 }, (_, i) =>
      makeStudent(`s${i}`, i < 10 ? 'male' : 'female')
    );
    const friendGroup = ['s0', 's1', 's2'];
    const data: ScheduleData = {
      version: 2,
      students,
      camps: [
        {
          id: 'c1',
          name: 'Coding',
          gradeRange: 'Grades 4-7',
          week: 'July 6',
          maxSize: 16,
        },
      ],
      registrations: [
        {
          campId: 'c1',
          studentIds: students.map((s) => s.id),
          friendGroups: [friendGroup],
        },
      ],
    };
    const result = generateSchedule(data);
    const instanceWithFriends = result.instances.find((inst) =>
      friendGroup.every((id) => inst.studentIds.includes(id))
    );
    expect(instanceWithFriends).toBeDefined();
  });

  it('assigns correct instanceNumber and campId', () => {
    const students = Array.from({ length: 5 }, (_, i) =>
      makeStudent(`s${i}`, 'male')
    );
    const data: ScheduleData = {
      version: 2,
      students,
      camps: [
        {
          id: 'cls1',
          name: 'Art',
          gradeRange: 'Grades 1-3',
          week: 'June 8',
          maxSize: 3,
        },
      ],
      registrations: [
        {
          campId: 'cls1',
          studentIds: students.map((s) => s.id),
          friendGroups: [],
        },
      ],
    };
    const result = generateSchedule(data);
    expect(result.instances).toHaveLength(2);
    result.instances.forEach((inst, i) => {
      expect(inst.campId).toBe('cls1');
      expect(inst.instanceNumber).toBe(i + 1);
    });
  });
});
