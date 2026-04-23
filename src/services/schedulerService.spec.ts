import { describe, expect, it } from 'vitest';
import { generateSchedule } from './schedulerService';
import type { ScheduleData } from '@/models/types';

const makeStudent = (
  id: string,
  gender: 'male' | 'female' | 'other'
) => ({ id, firstName: id, lastName: 'Test', gender });

describe('generateSchedule', () => {
  it('returns no instances for empty registrations', () => {
    const data: ScheduleData = {
      students: [],
      classTypes: [{ id: 'c1', name: 'Art', maxSize: 10 }],
      registrations: [{ classTypeId: 'c1', studentIds: [], friendGroups: [] }],
    };
    const result = generateSchedule(data);
    expect(result.instances).toHaveLength(0);
  });

  it('creates a single instance when enrollment is within maxSize', () => {
    const students = ['s1', 's2', 's3'].map((id) => makeStudent(id, 'male'));
    const data: ScheduleData = {
      students,
      classTypes: [{ id: 'c1', name: 'Art', maxSize: 10 }],
      registrations: [
        { classTypeId: 'c1', studentIds: ['s1', 's2', 's3'], friendGroups: [] },
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
      students,
      classTypes: [{ id: 'c1', name: 'Chemistry', maxSize: 16 }],
      registrations: [
        {
          classTypeId: 'c1',
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

  it('separates genders into different instances when possible', () => {
    const males = Array.from({ length: 8 }, (_, i) =>
      makeStudent(`m${i}`, 'male')
    );
    const females = Array.from({ length: 8 }, (_, i) =>
      makeStudent(`f${i}`, 'female')
    );
    const data: ScheduleData = {
      students: [...males, ...females],
      classTypes: [{ id: 'c1', name: 'Science', maxSize: 10 }],
      registrations: [
        {
          classTypeId: 'c1',
          studentIds: [...males, ...females].map((s) => s.id),
          friendGroups: [],
        },
      ],
    };
    const result = generateSchedule(data);
    expect(result.instances).toHaveLength(2);
    const inst1MaleCount = result.instances[0].studentIds.filter((id) =>
      id.startsWith('m')
    ).length;
    const inst2FemaleCount = result.instances[1].studentIds.filter((id) =>
      id.startsWith('f')
    ).length;
    expect(inst1MaleCount).toBe(8);
    expect(inst2FemaleCount).toBe(8);
  });

  it('keeps friend groups together in the same instance', () => {
    const students = Array.from({ length: 20 }, (_, i) =>
      makeStudent(`s${i}`, i < 10 ? 'male' : 'female')
    );
    const friendGroup = ['s0', 's1', 's2'];
    const data: ScheduleData = {
      students,
      classTypes: [{ id: 'c1', name: 'Coding', maxSize: 16 }],
      registrations: [
        {
          classTypeId: 'c1',
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

  it('assigns correct instanceNumber and classTypeId', () => {
    const students = Array.from({ length: 5 }, (_, i) =>
      makeStudent(`s${i}`, 'male')
    );
    const data: ScheduleData = {
      students,
      classTypes: [{ id: 'cls1', name: 'Art', maxSize: 3 }],
      registrations: [
        {
          classTypeId: 'cls1',
          studentIds: students.map((s) => s.id),
          friendGroups: [],
        },
      ],
    };
    const result = generateSchedule(data);
    expect(result.instances).toHaveLength(2);
    result.instances.forEach((inst, i) => {
      expect(inst.classTypeId).toBe('cls1');
      expect(inst.instanceNumber).toBe(i + 1);
    });
  });
});
