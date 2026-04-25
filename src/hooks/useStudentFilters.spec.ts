import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStudentFilters } from './useStudentFilters';
import type {
  ScheduleData,
  Student,
  Camp,
  CampRegistration,
} from '@/models/types';

const blankContact = { name: '', homePhone: '', cellPhone: '' };

const makeStudent = (
  overrides: Partial<Student> & { id: string }
): Student => ({
  firstName: 'Test',
  lastName: 'Student',
  gender: 'male',
  age: 10,
  custody: 'Both',
  photo: true,
  preCamp: false,
  postCamp: false,
  specialRequest: '',
  medicalIssues: '',
  tshirtSize: '',
  primary: blankContact,
  secondary: blankContact,
  emergency: blankContact,
  ...overrides,
});

const makeCamp = (
  overrides: Partial<Camp> & { id: string; name: string }
): Camp => ({
  gradeRange: 'Grades 1-3',
  week: 'June 8',
  maxSize: 10,
  ...overrides,
});

const makeData = (
  students: Student[],
  camps: Camp[] = [],
  registrations: CampRegistration[] = []
): ScheduleData => ({
  version: 7,
  students,
  camps,
  registrations,
  schedule: null,
});

const emptyData = makeData([]);

describe('useStudentFilters', () => {
  describe('initial state', () => {
    it('returns all students unsorted (asc by name)', () => {
      const alice = makeStudent({
        id: '1',
        firstName: 'Alice',
        lastName: 'Smith',
      });
      const bob = makeStudent({ id: '2', firstName: 'Bob', lastName: 'Jones' });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([alice, bob]))
      );
      expect(result.current.sortedStudents.map((s) => s.id)).toEqual([
        '2',
        '1',
      ]);
    });

    it('returns empty array for empty data', () => {
      const { result } = renderHook(() => useStudentFilters(emptyData));
      expect(result.current.sortedStudents).toHaveLength(0);
    });
  });

  describe('name filter', () => {
    it('matches by last name (case-insensitive)', () => {
      const alice = makeStudent({
        id: '1',
        firstName: 'Alice',
        lastName: 'Smith',
      });
      const bob = makeStudent({ id: '2', firstName: 'Bob', lastName: 'Jones' });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([alice, bob]))
      );

      act(() =>
        result.current.setFilters({ ...result.current.filters, name: 'smi' })
      );

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('1');
    });

    it('matches by first name', () => {
      const alice = makeStudent({
        id: '1',
        firstName: 'Alice',
        lastName: 'Smith',
      });
      const bob = makeStudent({ id: '2', firstName: 'Bob', lastName: 'Jones' });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([alice, bob]))
      );

      act(() =>
        result.current.setFilters({ ...result.current.filters, name: 'bob' })
      );

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('2');
    });

    it('returns no results when name matches nothing', () => {
      const alice = makeStudent({
        id: '1',
        firstName: 'Alice',
        lastName: 'Smith',
      });
      const { result } = renderHook(() => useStudentFilters(makeData([alice])));

      act(() =>
        result.current.setFilters({ ...result.current.filters, name: 'xyz' })
      );

      expect(result.current.sortedStudents).toHaveLength(0);
    });
  });

  describe('age filter', () => {
    it('matches exact age as string', () => {
      const s8 = makeStudent({ id: '1', age: 8 });
      const s10 = makeStudent({ id: '2', age: 10 });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s8, s10]))
      );

      act(() =>
        result.current.setFilters({ ...result.current.filters, age: '10' })
      );

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('2');
    });

    it('shows all students when age filter is empty', () => {
      const s8 = makeStudent({ id: '1', age: 8 });
      const s10 = makeStudent({ id: '2', age: 10 });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s8, s10]))
      );

      expect(result.current.sortedStudents).toHaveLength(2);
    });
  });

  describe('custody filter', () => {
    it('filters to matching custody values', () => {
      const both = makeStudent({ id: '1', custody: 'Both' });
      const mother = makeStudent({ id: '2', custody: 'Mother' });
      const father = makeStudent({ id: '3', custody: 'Father' });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([both, mother, father]))
      );

      act(() =>
        result.current.setFilters({
          ...result.current.filters,
          custody: ['Mother', 'Father'],
        })
      );

      expect(result.current.sortedStudents).toHaveLength(2);
      expect(
        result.current.sortedStudents.map((s) => s.custody).sort()
      ).toEqual(['Father', 'Mother']);
    });
  });

  describe('tshirtSize filter', () => {
    it('filters to matching sizes', () => {
      const sm = makeStudent({ id: '1', tshirtSize: 'Small' });
      const lg = makeStudent({ id: '2', tshirtSize: 'Large' });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([sm, lg]))
      );

      act(() =>
        result.current.setFilters({
          ...result.current.filters,
          tshirtSize: ['Small'],
        })
      );

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('1');
    });
  });

  describe('camps filter', () => {
    it('filters to students enrolled in the selected camp', () => {
      const alice = makeStudent({ id: 's1' });
      const bob = makeStudent({ id: 's2' });
      const art = makeCamp({ id: 'c1', name: 'Art' });
      const science = makeCamp({ id: 'c2', name: 'Science' });
      const registrations: CampRegistration[] = [
        { campId: 'c1', studentIds: ['s1'], friendGroups: [] },
        { campId: 'c2', studentIds: ['s2'], friendGroups: [] },
      ];
      const { result } = renderHook(() =>
        useStudentFilters(makeData([alice, bob], [art, science], registrations))
      );

      act(() =>
        result.current.setFilters({ ...result.current.filters, camps: ['Art'] })
      );

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('s1');
    });

    it('matches students enrolled in any of the selected camps', () => {
      const alice = makeStudent({ id: 's1' });
      const bob = makeStudent({ id: 's2' });
      const charlie = makeStudent({ id: 's3' });
      const art = makeCamp({ id: 'c1', name: 'Art' });
      const science = makeCamp({ id: 'c2', name: 'Science' });
      const music = makeCamp({ id: 'c3', name: 'Music' });
      const registrations: CampRegistration[] = [
        { campId: 'c1', studentIds: ['s1'], friendGroups: [] },
        { campId: 'c2', studentIds: ['s2'], friendGroups: [] },
        { campId: 'c3', studentIds: ['s3'], friendGroups: [] },
      ];
      const { result } = renderHook(() =>
        useStudentFilters(
          makeData([alice, bob, charlie], [art, science, music], registrations)
        )
      );

      act(() =>
        result.current.setFilters({
          ...result.current.filters,
          camps: ['Art', 'Science'],
        })
      );

      expect(result.current.sortedStudents).toHaveLength(2);
    });
  });

  describe('boolean flags', () => {
    it('showOnlyAllergies filters by medical issues containing allerg', () => {
      const s1 = makeStudent({ id: '1', medicalIssues: 'Peanut allergy' });
      const s2 = makeStudent({ id: '2', medicalIssues: '' });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s1, s2]))
      );

      act(() => result.current.setShowOnlyAllergies(true));

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('1');
    });

    it('showOnlyAllergies matches nut mention in specialRequest', () => {
      const s1 = makeStudent({
        id: '1',
        specialRequest: 'Nut-free table please',
      });
      const s2 = makeStudent({ id: '2', specialRequest: '' });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s1, s2]))
      );

      act(() => result.current.setShowOnlyAllergies(true));

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('1');
    });

    it('filterMedical shows only students with medicalIssues', () => {
      const s1 = makeStudent({ id: '1', medicalIssues: 'Asthma' });
      const s2 = makeStudent({ id: '2', medicalIssues: '' });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s1, s2]))
      );

      act(() => result.current.setFilterMedical(true));

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('1');
    });

    it('filterSpecialRequest shows only students with specialRequest', () => {
      const s1 = makeStudent({ id: '1', specialRequest: 'Vegetarian' });
      const s2 = makeStudent({ id: '2', specialRequest: '' });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s1, s2]))
      );

      act(() => result.current.setFilterSpecialRequest(true));

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('1');
    });

    it('filterNoPhoto shows only students without photo consent', () => {
      const s1 = makeStudent({ id: '1', photo: false });
      const s2 = makeStudent({ id: '2', photo: true });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s1, s2]))
      );

      act(() => result.current.setFilterNoPhoto(true));

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('1');
    });

    it('filterPreCamp shows only students with preCamp', () => {
      const s1 = makeStudent({ id: '1', preCamp: true });
      const s2 = makeStudent({ id: '2', preCamp: false });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s1, s2]))
      );

      act(() => result.current.setFilterPreCamp(true));

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('1');
    });

    it('filterPostCamp shows only students with postCamp', () => {
      const s1 = makeStudent({ id: '1', postCamp: true });
      const s2 = makeStudent({ id: '2', postCamp: false });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s1, s2]))
      );

      act(() => result.current.setFilterPostCamp(true));

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('1');
    });

    it('stacks multiple boolean flags (AND logic)', () => {
      const s1 = makeStudent({ id: '1', preCamp: true, postCamp: true });
      const s2 = makeStudent({ id: '2', preCamp: true, postCamp: false });
      const s3 = makeStudent({ id: '3', preCamp: false, postCamp: false });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s1, s2, s3]))
      );

      act(() => {
        result.current.setFilterPreCamp(true);
        result.current.setFilterPostCamp(true);
      });

      expect(result.current.sortedStudents).toHaveLength(1);
      expect(result.current.sortedStudents[0].id).toBe('1');
    });
  });

  describe('sorting', () => {
    it('sorts by name ascending by default (lastName, firstName)', () => {
      const charlie = makeStudent({
        id: '1',
        firstName: 'Charlie',
        lastName: 'Brown',
      });
      const alice = makeStudent({
        id: '2',
        firstName: 'Alice',
        lastName: 'Smith',
      });
      const bob = makeStudent({ id: '3', firstName: 'Bob', lastName: 'Brown' });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([charlie, alice, bob]))
      );

      const names = result.current.sortedStudents.map(
        (s) => `${s.lastName}, ${s.firstName}`
      );
      expect(names).toEqual(['Brown, Bob', 'Brown, Charlie', 'Smith, Alice']);
    });

    it('sorts by name descending after handleSort on already-asc name column', () => {
      const charlie = makeStudent({
        id: '1',
        firstName: 'Charlie',
        lastName: 'Brown',
      });
      const alice = makeStudent({
        id: '2',
        firstName: 'Alice',
        lastName: 'Smith',
      });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([charlie, alice]))
      );

      act(() => result.current.handleSort('name'));

      const names = result.current.sortedStudents.map(
        (s) => `${s.lastName}, ${s.firstName}`
      );
      expect(names).toEqual(['Smith, Alice', 'Brown, Charlie']);
    });

    it('sorts by age ascending', () => {
      const s12 = makeStudent({ id: '1', age: 12 });
      const s8 = makeStudent({ id: '2', age: 8 });
      const s10 = makeStudent({ id: '3', age: 10 });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s12, s8, s10]))
      );

      act(() => result.current.handleSort('age'));

      expect(result.current.sortedStudents.map((s) => s.age)).toEqual([
        8, 10, 12,
      ]);
    });

    it('sorts by age descending on second click', () => {
      const s12 = makeStudent({ id: '1', age: 12 });
      const s8 = makeStudent({ id: '2', age: 8 });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s12, s8]))
      );

      act(() => result.current.handleSort('age'));
      act(() => result.current.handleSort('age'));

      expect(result.current.sortedStudents.map((s) => s.age)).toEqual([12, 8]);
    });

    it('sorts by custody alphabetically', () => {
      const both = makeStudent({ id: '1', custody: 'Both' });
      const father = makeStudent({ id: '2', custody: 'Father' });
      const mother = makeStudent({ id: '3', custody: 'Mother' });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([mother, both, father]))
      );

      act(() => result.current.handleSort('custody'));

      expect(result.current.sortedStudents.map((s) => s.custody)).toEqual([
        'Both',
        'Father',
        'Mother',
      ]);
    });

    it('sorts by tshirtSize alphabetically', () => {
      const xl = makeStudent({ id: '1', tshirtSize: 'XL' });
      const sm = makeStudent({ id: '2', tshirtSize: 'Small' });
      const lg = makeStudent({ id: '3', tshirtSize: 'Large' });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([xl, sm, lg]))
      );

      act(() => result.current.handleSort('tshirtSize'));

      expect(result.current.sortedStudents.map((s) => s.tshirtSize)).toEqual([
        'Large',
        'Small',
        'XL',
      ]);
    });

    it('switches to asc when a different column is selected', () => {
      const s12 = makeStudent({ id: '1', age: 12 });
      const s8 = makeStudent({ id: '2', age: 8 });
      const { result } = renderHook(() =>
        useStudentFilters(makeData([s12, s8]))
      );

      // First click age → asc
      act(() => result.current.handleSort('age'));
      // Click age again → desc
      act(() => result.current.handleSort('age'));
      expect(result.current.order).toBe('desc');

      // Now click custody (different column) → resets to asc
      act(() => result.current.handleSort('custody'));
      expect(result.current.order).toBe('asc');
      expect(result.current.orderBy).toBe('custody');
    });
  });

  describe('handleMultiSelectChange', () => {
    it('sets the multi-select value', () => {
      const { result } = renderHook(() => useStudentFilters(emptyData));

      act(() =>
        result.current.handleMultiSelectChange('custody', ['Both', 'Mother'])
      );

      expect(result.current.filters.custody).toEqual(['Both', 'Mother']);
    });

    it('clears the filter when empty string is included in the value array', () => {
      const { result } = renderHook(() => useStudentFilters(emptyData));

      act(() => result.current.handleMultiSelectChange('custody', ['Both']));
      act(() =>
        result.current.handleMultiSelectChange('custody', ['Both', ''])
      );

      expect(result.current.filters.custody).toEqual([]);
    });
  });

  describe('derived unique values', () => {
    it('uniqueCamps is sorted and deduplicated', () => {
      const camps = [
        makeCamp({ id: 'c1', name: 'Science' }),
        makeCamp({ id: 'c2', name: 'Art' }),
        makeCamp({ id: 'c3', name: 'Science' }),
      ];
      const { result } = renderHook(() =>
        useStudentFilters(makeData([], camps))
      );

      expect(result.current.uniqueCamps).toEqual(['Art', 'Science']);
    });

    it('uniqueCustody is sorted and deduplicated', () => {
      const students = [
        makeStudent({ id: '1', custody: 'Mother' }),
        makeStudent({ id: '2', custody: 'Both' }),
        makeStudent({ id: '3', custody: 'Mother' }),
      ];
      const { result } = renderHook(() =>
        useStudentFilters(makeData(students))
      );

      expect(result.current.uniqueCustody).toEqual(['Both', 'Mother']);
    });

    it('uniqueTshirtSizes is sorted and deduplicated', () => {
      const students = [
        makeStudent({ id: '1', tshirtSize: 'XL' }),
        makeStudent({ id: '2', tshirtSize: 'Small' }),
        makeStudent({ id: '3', tshirtSize: 'XL' }),
      ];
      const { result } = renderHook(() =>
        useStudentFilters(makeData(students))
      );

      expect(result.current.uniqueTshirtSizes).toEqual(['Small', 'XL']);
    });
  });
});
