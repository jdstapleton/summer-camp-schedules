import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ScheduleProvider } from './ScheduleProvider';
import { useSchedule } from '@/hooks/useSchedule';
import type { ImportBatchPayload } from '@/models/contexts';

const wrapper = ({ children }: { children: ReactNode }) => <ScheduleProvider>{children}</ScheduleProvider>;

const blankContact = { name: '', homePhone: '', cellPhone: '' };

const makeStudent = (firstName: string, lastName: string, specialRequest = ''): ImportBatchPayload['newStudents'][number] => ({
  firstName,
  lastName,
  gender: 'male',
  age: 10,
  custody: 'Both',
  photo: false,
  preCamp: false,
  postCamp: false,
  specialRequest,
  medicalIssues: '',
  tshirtSize: '',
  primary: blankContact,
  secondary: blankContact,
  emergency: blankContact,
  dedupeKey: `${lastName.trim().toLowerCase()}|${firstName.trim().toLowerCase()}|10`,
});

const makeCamp = (name: string): ImportBatchPayload['newCamps'][number] => ({
  name,
  gradeRange: 'Grades 1-3',
  week: 'June 8',
  maxSize: 10,
});

describe('ScheduleProvider importBatch', () => {
  beforeEach(() => localStorage.clear());

  it('adds students, camps, and registration entries', () => {
    const { result } = renderHook(() => useSchedule(), { wrapper });

    act(() =>
      result.current.importBatch({
        newStudents: [makeStudent('Alice', 'Smith')],
        newCamps: [makeCamp('Art')],
        registrationRows: [{ campName: 'Art', dedupeKey: 'smith|alice|10' }],
      })
    );

    expect(result.current.data.students).toHaveLength(1);
    expect(result.current.data.students[0].firstName).toBe('Alice');
    expect(result.current.data.camps).toHaveLength(1);
    expect(result.current.data.camps[0].name).toBe('Art');
    const campId = result.current.data.camps[0].id;
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    expect(reg?.studentIds).toHaveLength(1);
  });

  it('deduplicates students by dedupeKey on repeated imports', () => {
    const { result } = renderHook(() => useSchedule(), { wrapper });
    const student = makeStudent('Alice', 'Smith');

    act(() =>
      result.current.importBatch({
        newStudents: [student],
        newCamps: [],
        registrationRows: [],
      })
    );
    act(() =>
      result.current.importBatch({
        newStudents: [student],
        newCamps: [],
        registrationRows: [],
      })
    );

    expect(result.current.data.students).toHaveLength(1);
  });

  it('deduplicates camps by name on repeated imports', () => {
    const { result } = renderHook(() => useSchedule(), { wrapper });
    const camp = makeCamp('Art');

    act(() =>
      result.current.importBatch({
        newStudents: [],
        newCamps: [camp],
        registrationRows: [],
      })
    );
    act(() =>
      result.current.importBatch({
        newStudents: [],
        newCamps: [camp],
        registrationRows: [],
      })
    );

    expect(result.current.data.camps).toHaveLength(1);
  });

  it('places mutually mentioning students in the same friend group', () => {
    const { result } = renderHook(() => useSchedule(), { wrapper });
    const alice = makeStudent('Alice', 'Smith', 'Please group me with Bob');
    const bob = makeStudent('Bob', 'Jones', 'Please group me with Alice');
    const charlie = makeStudent('Charlie', 'Brown');

    act(() =>
      result.current.importBatch({
        newStudents: [alice, bob, charlie],
        newCamps: [makeCamp('Art')],
        registrationRows: [
          { campName: 'Art', dedupeKey: alice.dedupeKey },
          { campName: 'Art', dedupeKey: bob.dedupeKey },
          { campName: 'Art', dedupeKey: charlie.dedupeKey },
        ],
      })
    );

    const campId = result.current.data.camps[0].id;
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    const aliceId = result.current.data.students.find((s) => s.firstName === 'Alice')?.id;
    const bobId = result.current.data.students.find((s) => s.firstName === 'Bob')?.id;

    expect(reg?.friendGroups).toHaveLength(1);
    expect(reg?.friendGroups[0]).toContain(aliceId);
    expect(reg?.friendGroups[0]).toContain(bobId);
  });

  it('transitively merges friend groups (A→B, B→C become one group)', () => {
    const { result } = renderHook(() => useSchedule(), { wrapper });
    const alice = makeStudent('Alice', 'Smith', 'I want to be with Bob');
    const bob = makeStudent('Bob', 'Jones', 'Please group me with Charlie');
    const charlie = makeStudent('Charlie', 'Brown');

    act(() =>
      result.current.importBatch({
        newStudents: [alice, bob, charlie],
        newCamps: [makeCamp('Art')],
        registrationRows: [
          { campName: 'Art', dedupeKey: alice.dedupeKey },
          { campName: 'Art', dedupeKey: bob.dedupeKey },
          { campName: 'Art', dedupeKey: charlie.dedupeKey },
        ],
      })
    );

    const campId = result.current.data.camps[0].id;
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    const aliceId = result.current.data.students.find((s) => s.firstName === 'Alice')?.id;
    const bobId = result.current.data.students.find((s) => s.firstName === 'Bob')?.id;
    const charlieId = result.current.data.students.find((s) => s.firstName === 'Charlie')?.id;

    expect(reg?.friendGroups).toHaveLength(1);
    expect(reg?.friendGroups[0]).toContain(aliceId);
    expect(reg?.friendGroups[0]).toContain(bobId);
    expect(reg?.friendGroups[0]).toContain(charlieId);
  });

  it('does not create friend groups when no students have special requests', () => {
    const { result } = renderHook(() => useSchedule(), { wrapper });
    const alice = makeStudent('Alice', 'Smith');
    const bob = makeStudent('Bob', 'Jones');

    act(() =>
      result.current.importBatch({
        newStudents: [alice, bob],
        newCamps: [makeCamp('Art')],
        registrationRows: [
          { campName: 'Art', dedupeKey: alice.dedupeKey },
          { campName: 'Art', dedupeKey: bob.dedupeKey },
        ],
      })
    );

    const campId = result.current.data.camps[0].id;
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    expect(reg?.friendGroups).toHaveLength(0);
  });

  it('filters out friend groups with fewer than 2 members', () => {
    const { result } = renderHook(() => useSchedule(), { wrapper });
    // Alice mentions Dave who is not enrolled in the camp — no valid pair
    const alice = makeStudent('Alice', 'Smith', 'I want to be with Dave');
    const bob = makeStudent('Bob', 'Jones');

    act(() =>
      result.current.importBatch({
        newStudents: [alice, bob],
        newCamps: [makeCamp('Art')],
        registrationRows: [
          { campName: 'Art', dedupeKey: alice.dedupeKey },
          { campName: 'Art', dedupeKey: bob.dedupeKey },
        ],
      })
    );

    const campId = result.current.data.camps[0].id;
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    expect(reg?.friendGroups).toHaveLength(0);
  });

  it('silently ignores registration rows referencing unknown camp or student', () => {
    const { result } = renderHook(() => useSchedule(), { wrapper });

    act(() =>
      result.current.importBatch({
        newStudents: [makeStudent('Alice', 'Smith')],
        newCamps: [makeCamp('Art')],
        registrationRows: [
          { campName: 'NonExistentCamp', dedupeKey: 'smith|alice|10' },
          { campName: 'Art', dedupeKey: 'nobody|nobody|10' },
        ],
      })
    );

    const campId = result.current.data.camps[0].id;
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    expect(result.current.data.students).toHaveLength(1);
    expect(reg?.studentIds).toHaveLength(0);
  });
});
