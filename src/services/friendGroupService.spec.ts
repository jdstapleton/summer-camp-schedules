import { describe, it, expect } from 'vitest';
import { extractMentionedStudents } from './friendGroupService';
import type { Student } from '@/models/types';

describe('friendGroupService', () => {
  const students: Student[] = [
    {
      id: '1',
      firstName: 'Alice',
      lastName: 'Smith',
      gender: 'female',
      age: 8,
      custody: 'Both',
      photo: false,
      preCamp: false,
      postCamp: false,
      specialRequest: '',
      medicalIssues: '',
      tshirtSize: '',
      primary: { name: '', homePhone: '', cellPhone: '' },
      secondary: { name: '', homePhone: '', cellPhone: '' },
      emergency: { name: '', homePhone: '', cellPhone: '' },
    },
    {
      id: '2',
      firstName: 'Bob',
      lastName: 'Jones',
      gender: 'male',
      age: 9,
      custody: 'Both',
      photo: false,
      preCamp: false,
      postCamp: false,
      specialRequest: '',
      medicalIssues: '',
      tshirtSize: '',
      primary: { name: '', homePhone: '', cellPhone: '' },
      secondary: { name: '', homePhone: '', cellPhone: '' },
      emergency: { name: '', homePhone: '', cellPhone: '' },
    },
    {
      id: '3',
      firstName: 'Charlie',
      lastName: 'Brown',
      gender: 'male',
      age: 7,
      custody: 'Both',
      photo: false,
      preCamp: false,
      postCamp: false,
      specialRequest: '',
      medicalIssues: '',
      tshirtSize: '',
      primary: { name: '', homePhone: '', cellPhone: '' },
      secondary: { name: '', homePhone: '', cellPhone: '' },
      emergency: { name: '', homePhone: '', cellPhone: '' },
    },
  ];

  it('should extract mentioned students by first name', () => {
    const text = 'Please group me with Alice';
    const result = extractMentionedStudents(text, students);
    expect(result).toContain('1');
    expect(result.length).toBe(1);
  });

  it('should extract mentioned students by last name', () => {
    const text = 'I want to be with Jones';
    const result = extractMentionedStudents(text, students);
    expect(result).toContain('2');
    expect(result.length).toBe(1);
  });

  it('should extract mentioned students by full name', () => {
    const text = 'Group me with Charlie Brown please';
    const result = extractMentionedStudents(text, students);
    expect(result).toContain('3');
    expect(result.length).toBe(1);
  });

  it('should be case-insensitive', () => {
    const text = 'Please group me with ALICE and bob';
    const result = extractMentionedStudents(text, students);
    expect(result).toContain('1');
    expect(result).toContain('2');
    expect(result.length).toBe(2);
  });

  it('should extract multiple mentioned students', () => {
    const text = 'I want to be with Alice and Bob';
    const result = extractMentionedStudents(text, students);
    expect(result).toContain('1');
    expect(result).toContain('2');
    expect(result.length).toBe(2);
  });

  it('should handle empty text', () => {
    const result = extractMentionedStudents('', students);
    expect(result).toEqual([]);
  });

  it('should handle whitespace-only text', () => {
    const result = extractMentionedStudents('   ', students);
    expect(result).toEqual([]);
  });

  it('should not return duplicates', () => {
    const text = 'Group me with Alice Smith and Alice';
    const result = extractMentionedStudents(text, students);
    expect(result).toContain('1');
    expect(result.filter((id) => id === '1').length).toBe(1);
  });

  it('should not match partial names incorrectly', () => {
    const text = 'I like my job';
    const result = extractMentionedStudents(text, students);
    expect(result).not.toContain('2');
  });

  it('should not match last names as substrings of other words', () => {
    const studentsWithHo: Student[] = [
      {
        ...students[0],
        id: '4',
        lastName: 'Ho',
      },
    ];
    const text = 'He cannot be outside on Hot days';
    const result = extractMentionedStudents(text, studentsWithHo);
    expect(result).not.toContain('4');
  });
});
