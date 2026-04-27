import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScheduleProvider } from './ScheduleProvider';
import { useSchedule } from '@/hooks/useSchedule';
import type { ImportBatchPayload } from '@/models/contexts';
import type { Camp, ScheduleData, Student } from '@/models/types';
import { fileService } from '@/services/fileService';

vi.mock('@/services/fileService', () => ({
  fileService: {
    openFile: vi.fn(),
    saveFile: vi.fn(),
  },
}));

vi.mock('@/services/supabaseStorage', () => ({
  fetchScheduleData: vi.fn().mockResolvedValue(null),
  saveScheduleData: vi.fn().mockResolvedValue(true),
  subscribeToChanges: vi.fn().mockReturnValue(() => {}),
}));

const wrapper = ({ children }: { children: ReactNode }) => <ScheduleProvider>{children}</ScheduleProvider>;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

// Initialize hook and wait for loading to complete
const initHook = async () => {
  const result = renderHook(() => useSchedule(), { wrapper });
  await waitFor(() => {
    expect(result.result.current).toBeDefined();
  });
  return result;
};

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

  it('adds students, camps, and registration entries', async () => {
    const { result } = await initHook();

    act(() => {
      result.current.importBatch({
        newStudents: [makeStudent('Alice', 'Smith')],
        newCamps: [makeCamp('Art')],
        registrationRows: [{ campName: 'Art', dedupeKey: 'smith|alice|10' }],
      });
      vi.advanceTimersByTime(300);
    });

    expect(result.current.data.students).toHaveLength(1);
    expect(result.current.data.students[0].firstName).toBe('Alice');
    expect(result.current.data.camps).toHaveLength(1);
    expect(result.current.data.camps[0].name).toBe('Art');
    const campId = result.current.data.camps[0].id;
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    expect(reg?.studentIds).toHaveLength(1);
  });

  it('deduplicates students by dedupeKey on repeated imports', async () => {
    const { result } = await initHook();
    const student = makeStudent('Alice', 'Smith');

    act(() => {
      result.current.importBatch({
        newStudents: [student],
        newCamps: [],
        registrationRows: [],
      });
      vi.advanceTimersByTime(300);
    });
    act(() => {
      result.current.importBatch({
        newStudents: [student],
        newCamps: [],
        registrationRows: [],
      });
      vi.advanceTimersByTime(300);
    });

    expect(result.current.data.students).toHaveLength(1);
  });

  it('deduplicates camps by name on repeated imports', async () => {
    const { result } = await initHook();
    const camp = makeCamp('Art');

    act(() => {
      result.current.importBatch({
        newStudents: [],
        newCamps: [camp],
        registrationRows: [],
      });
      vi.advanceTimersByTime(300);
    });
    act(() => {
      result.current.importBatch({
        newStudents: [],
        newCamps: [camp],
        registrationRows: [],
      });
      vi.advanceTimersByTime(300);
    });

    expect(result.current.data.camps).toHaveLength(1);
  });

  it('places mutually mentioning students in the same friend group', async () => {
    const { result } = await initHook();
    const alice = makeStudent('Alice', 'Smith', 'Please group me with Bob');
    const bob = makeStudent('Bob', 'Jones', 'Please group me with Alice');
    const charlie = makeStudent('Charlie', 'Brown');

    act(() => {
      result.current.importBatch({
        newStudents: [alice, bob, charlie],
        newCamps: [makeCamp('Art')],
        registrationRows: [
          { campName: 'Art', dedupeKey: alice.dedupeKey },
          { campName: 'Art', dedupeKey: bob.dedupeKey },
          { campName: 'Art', dedupeKey: charlie.dedupeKey },
        ],
      });
      vi.advanceTimersByTime(300);
    });

    const campId = result.current.data.camps[0].id;
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    const aliceId = result.current.data.students.find((s) => s.firstName === 'Alice')?.id;
    const bobId = result.current.data.students.find((s) => s.firstName === 'Bob')?.id;

    expect(reg?.friendGroups).toHaveLength(1);
    expect(reg?.friendGroups[0]).toContain(aliceId);
    expect(reg?.friendGroups[0]).toContain(bobId);
  });

  it('transitively merges friend groups (A→B, B→C become one group)', async () => {
    const { result } = await initHook();
    const alice = makeStudent('Alice', 'Smith', 'I want to be with Bob');
    const bob = makeStudent('Bob', 'Jones', 'Please group me with Charlie');
    const charlie = makeStudent('Charlie', 'Brown');

    act(() => {
      result.current.importBatch({
        newStudents: [alice, bob, charlie],
        newCamps: [makeCamp('Art')],
        registrationRows: [
          { campName: 'Art', dedupeKey: alice.dedupeKey },
          { campName: 'Art', dedupeKey: bob.dedupeKey },
          { campName: 'Art', dedupeKey: charlie.dedupeKey },
        ],
      });
      vi.advanceTimersByTime(300);
    });

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

  it('does not create friend groups when no students have special requests', async () => {
    const { result } = await initHook();
    const alice = makeStudent('Alice', 'Smith');
    const bob = makeStudent('Bob', 'Jones');

    act(() => {
      result.current.importBatch({
        newStudents: [alice, bob],
        newCamps: [makeCamp('Art')],
        registrationRows: [
          { campName: 'Art', dedupeKey: alice.dedupeKey },
          { campName: 'Art', dedupeKey: bob.dedupeKey },
        ],
      });
      vi.advanceTimersByTime(300);
    });

    const campId = result.current.data.camps[0].id;
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    expect(reg?.friendGroups).toHaveLength(0);
  });

  it('filters out friend groups with fewer than 2 members', async () => {
    const { result } = await initHook();
    // Alice mentions Dave who is not enrolled in the camp — no valid pair
    const alice = makeStudent('Alice', 'Smith', 'I want to be with Dave');
    const bob = makeStudent('Bob', 'Jones');

    act(() => {
      result.current.importBatch({
        newStudents: [alice, bob],
        newCamps: [makeCamp('Art')],
        registrationRows: [
          { campName: 'Art', dedupeKey: alice.dedupeKey },
          { campName: 'Art', dedupeKey: bob.dedupeKey },
        ],
      });
      vi.advanceTimersByTime(300);
    });

    const campId = result.current.data.camps[0].id;
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    expect(reg?.friendGroups).toHaveLength(0);
  });

  it('silently ignores registration rows referencing unknown camp or student', async () => {
    const { result } = await initHook();

    act(() => {
      result.current.importBatch({
        newStudents: [makeStudent('Alice', 'Smith')],
        newCamps: [makeCamp('Art')],
        registrationRows: [
          { campName: 'NonExistentCamp', dedupeKey: 'smith|alice|10' },
          { campName: 'Art', dedupeKey: 'nobody|nobody|10' },
        ],
      });
      vi.advanceTimersByTime(300);
    });

    const campId = result.current.data.camps[0].id;
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    expect(result.current.data.students).toHaveLength(1);
    expect(reg?.studentIds).toHaveLength(0);
  });
});

const makeStudentInput = (firstName = 'Alice', lastName = 'Smith'): Omit<Student, 'id'> => ({
  firstName,
  lastName,
  gender: 'female',
  age: 10,
  custody: 'Both',
  photo: false,
  preCamp: false,
  postCamp: false,
  specialRequest: '',
  medicalIssues: '',
  tshirtSize: '',
  primary: blankContact,
  secondary: blankContact,
  emergency: blankContact,
});

const makeCampInput = (name = 'Art', maxSize = 10): Omit<Camp, 'id'> => ({
  name,
  gradeRange: 'Grades 1-3',
  week: 'June 8',
  maxSize,
});

describe('ScheduleProvider student CRUD', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('addStudent adds a student with a generated id', async () => {
    const { result } = await initHook();
    act(() => {
      result.current.addStudent(makeStudentInput());
      vi.advanceTimersByTime(300);
    });
    expect(result.current.data.students).toHaveLength(1);
    expect(result.current.data.students[0].firstName).toBe('Alice');
    expect(result.current.data.students[0].id).toBeTruthy();
  });

  it('updateStudent replaces only the matching student', async () => {
    const { result } = await initHook();
    act(() => {
      result.current.addStudent(makeStudentInput('Alice', 'Smith'));
      vi.advanceTimersByTime(300);
    });
    act(() => {
      result.current.addStudent(makeStudentInput('Bob', 'Jones'));
      vi.advanceTimersByTime(300);
    });
    const alice = result.current.data.students.find((s) => s.firstName === 'Alice')!;
    act(() => {
      result.current.updateStudent({ ...alice, firstName: 'Alicia' });
      vi.advanceTimersByTime(300);
    });
    expect(result.current.data.students).toHaveLength(2);
    expect(result.current.data.students.find((s) => s.id === alice.id)?.firstName).toBe('Alicia');
    expect(result.current.data.students.find((s) => s.firstName === 'Bob')).toBeDefined();
  });

  it('deleteStudent removes the student and cleans up registrations', async () => {
    const { result } = await initHook();
    act(() => {
      result.current.importBatch({
        newStudents: [makeStudent('Alice', 'Smith')],
        newCamps: [makeCamp('Art')],
        registrationRows: [{ campName: 'Art', dedupeKey: 'smith|alice|10' }],
      });
      vi.advanceTimersByTime(300);
    });
    const studentId = result.current.data.students[0].id;
    act(() => {
      result.current.deleteStudent(studentId);
      vi.advanceTimersByTime(300);
    });
    expect(result.current.data.students).toHaveLength(0);
    const reg = result.current.data.registrations[0];
    expect(reg.studentIds).not.toContain(studentId);
  });
});

describe('ScheduleProvider camp CRUD', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('addCamp adds a camp with a generated id and an empty registration', async () => {
    const { result } = await initHook();
    act(() => {
      result.current.addCamp(makeCampInput());
      vi.advanceTimersByTime(300);
    });
    expect(result.current.data.camps).toHaveLength(1);
    expect(result.current.data.camps[0].name).toBe('Art');
    expect(result.current.data.camps[0].id).toBeTruthy();
    const campId = result.current.data.camps[0].id;
    expect(result.current.data.registrations.find((r) => r.campId === campId)).toBeDefined();
  });

  it('updateCamp replaces only the matching camp', async () => {
    const { result } = await initHook();
    act(() => {
      result.current.addCamp(makeCampInput('Art'));
      vi.advanceTimersByTime(300);
    });
    act(() => {
      result.current.addCamp(makeCampInput('Science'));
      vi.advanceTimersByTime(300);
    });
    const art = result.current.data.camps.find((c) => c.name === 'Art')!;
    act(() => {
      result.current.updateCamp({ ...art, name: 'Arts & Crafts' });
      vi.advanceTimersByTime(300);
    });
    expect(result.current.data.camps).toHaveLength(2);
    expect(result.current.data.camps.find((c) => c.id === art.id)?.name).toBe('Arts & Crafts');
    expect(result.current.data.camps.find((c) => c.name === 'Science')).toBeDefined();
  });

  it('deleteCamp removes the camp and its registration', async () => {
    const { result } = await initHook();
    act(() => {
      result.current.addCamp(makeCampInput());
      vi.advanceTimersByTime(300);
    });
    const campId = result.current.data.camps[0].id;
    act(() => {
      result.current.deleteCamp(campId);
      vi.advanceTimersByTime(300);
    });
    expect(result.current.data.camps).toHaveLength(0);
    expect(result.current.data.registrations.find((r) => r.campId === campId)).toBeUndefined();
  });
});

describe('ScheduleProvider registration and schedule operations', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('updateRegistration replaces the matching registration', async () => {
    const { result } = await initHook();
    act(() => {
      result.current.addCamp(makeCampInput());
      vi.advanceTimersByTime(300);
    });
    const campId = result.current.data.camps[0].id;
    act(() => {
      result.current.updateRegistration({
        campId,
        studentIds: ['fake-id'],
        friendGroups: [],
      });
      vi.advanceTimersByTime(300);
    });
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    expect(reg?.studentIds).toEqual(['fake-id']);
  });

  it('refreshSchedule generates a schedule from current data', async () => {
    const { result } = await initHook();
    const students = Array.from({ length: 4 }, (_, i) => makeStudent(`S${i}`, `Last${i}`));
    act(() => {
      result.current.importBatch({
        newStudents: students,
        newCamps: [makeCamp('Art')],
        registrationRows: students.map((s) => ({ campName: 'Art', dedupeKey: s.dedupeKey })),
      });
      vi.advanceTimersByTime(300);
    });
    act(() => {
      result.current.refreshSchedule();
      vi.advanceTimersByTime(300);
    });
    expect(result.current.generatedSchedule).not.toBeNull();
    expect(result.current.generatedSchedule!.instances).toHaveLength(1);
  });

  it('moveStudentBetweenInstances moves a student and updates data.schedule', async () => {
    const { result } = await initHook();
    // 20 students in a camp with maxSize 10 → 2 instances
    const students = Array.from({ length: 20 }, (_, i) => makeStudent(`S${i}`, `Last${i}`));
    act(() => {
      result.current.importBatch({
        newStudents: students,
        newCamps: [makeCamp('Art')],
        registrationRows: students.map((s) => ({ campName: 'Art', dedupeKey: s.dedupeKey })),
      });
      vi.advanceTimersByTime(300);
    });
    act(() => {
      result.current.refreshSchedule();
      vi.advanceTimersByTime(300);
    });
    const schedule = result.current.generatedSchedule!;
    expect(schedule.instances).toHaveLength(2);

    const fromInstance = schedule.instances[0];
    const toInstance = schedule.instances[1];
    const studentToMove = fromInstance.studentIds[0];

    act(() => {
      result.current.moveStudentBetweenInstances(studentToMove, fromInstance.id, toInstance.id);
      vi.advanceTimersByTime(300);
    });

    const updated = result.current.generatedSchedule!;
    expect(updated.instances[0].studentIds).not.toContain(studentToMove);
    expect(updated.instances[1].studentIds).toContain(studentToMove);
    expect(result.current.data.schedule).toEqual(updated);
  });

  it('clearData resets state to empty', async () => {
    const { result } = await initHook();
    act(() => {
      result.current.addStudent(makeStudentInput());
      vi.advanceTimersByTime(300);
    });
    expect(result.current.data.students).toHaveLength(1);
    act(() => {
      result.current.clearData();
      vi.advanceTimersByTime(300);
    });
    expect(result.current.data.students).toHaveLength(0);
    expect(result.current.data.camps).toHaveLength(0);
    expect(result.current.generatedSchedule).toBeNull();
  });
});

describe('ScheduleProvider file operations', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('saveToFile calls fileService.saveFile with current data', async () => {
    const { result } = await initHook();
    act(() => {
      result.current.saveToFile();
      vi.advanceTimersByTime(300);
    });
    expect(fileService.saveFile).toHaveBeenCalledWith(result.current.data, 'summer-camp-schedules.json');
  });

  it('loadFromFile updates state when openFile resolves with data', async () => {
    const { result } = await initHook();
    const mockData: ScheduleData = {
      version: 7,
      students: [
        {
          id: 's1',
          firstName: 'Loaded',
          lastName: 'User',
          gender: 'male',
          age: 8,
          custody: 'Both',
          photo: false,
          preCamp: false,
          postCamp: false,
          specialRequest: '',
          medicalIssues: '',
          tshirtSize: '',
          primary: blankContact,
          secondary: blankContact,
          emergency: blankContact,
        },
      ],
      camps: [],
      registrations: [],
      schedule: null,
    };
    vi.mocked(fileService.openFile).mockResolvedValueOnce(mockData);

    await act(async () => {
      await result.current.loadFromFile();
      vi.advanceTimersByTime(300);
    });

    expect(result.current.data.students).toHaveLength(1);
    expect(result.current.data.students[0].firstName).toBe('Loaded');
  });

  it('loadFromFile does not update state when openFile returns null', async () => {
    const { result } = await initHook();
    act(() => {
      result.current.addStudent(makeStudentInput());
      vi.advanceTimersByTime(300);
    });
    vi.mocked(fileService.openFile).mockResolvedValueOnce(null);

    await act(async () => {
      await result.current.loadFromFile();
      vi.advanceTimersByTime(300);
    });

    expect(result.current.data.students).toHaveLength(1);
  });
});

describe('ScheduleProvider localStorage edge cases', () => {
  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('falls back to empty data when localStorage contains corrupted JSON', async () => {
    localStorage.setItem('summer-camp-schedules', 'not-valid-json!!!');
    const { result } = await initHook();
    expect(result.current.data.students).toHaveLength(0);
  });

  it('falls back to empty data when localStorage contains valid JSON that fails schema check', async () => {
    localStorage.setItem('summer-camp-schedules', JSON.stringify({ unexpected: 'shape' }));
    const { result } = await initHook();
    expect(result.current.data.students).toHaveLength(0);
  });

  it('moveStudentBetweenInstances is a no-op when generatedSchedule is null', async () => {
    const { result } = await initHook();
    expect(result.current.generatedSchedule).toBeNull();
    act(() => {
      result.current.moveStudentBetweenInstances('s1', 'inst-1', 'inst-2');
      vi.advanceTimersByTime(300);
    });
    expect(result.current.generatedSchedule).toBeNull();
  });

  it('deleteStudent prunes friend groups when a member is removed', async () => {
    const { result } = await initHook();
    // Import two students with mutual mentions (creates a friend group)
    const alice = makeStudent('Alice', 'Smith', 'Please group with Bob');
    const bob = makeStudent('Bob', 'Jones', 'Please group with Alice');
    act(() => {
      result.current.importBatch({
        newStudents: [alice, bob],
        newCamps: [makeCamp('Art')],
        registrationRows: [
          { campName: 'Art', dedupeKey: alice.dedupeKey },
          { campName: 'Art', dedupeKey: bob.dedupeKey },
        ],
      });
      vi.advanceTimersByTime(300);
    });
    const campId = result.current.data.camps[0].id;
    const reg = result.current.data.registrations.find((r) => r.campId === campId);
    expect(reg?.friendGroups).toHaveLength(1);

    // Deleting Alice should remove the friend group (only 1 member left)
    const aliceFromData = result.current.data.students.find((s) => s.firstName === 'Alice');
    if (!aliceFromData) throw new Error('Alice not found');
    act(() => {
      result.current.deleteStudent(aliceFromData.id);
      vi.advanceTimersByTime(300);
    });
    const updatedReg = result.current.data.registrations.find((r) => r.campId === campId);
    expect(updatedReg?.friendGroups).toHaveLength(0);
  });
});
