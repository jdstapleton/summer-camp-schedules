import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  ClassRegistration,
  ClassType,
  GeneratedSchedule,
  ScheduleData,
  Student,
} from '@/models/types';
import { fileService } from '@/services/fileService';
import { generateSchedule } from '@/services/schedulerService';

const emptyData: ScheduleData = {
  students: [],
  classTypes: [],
  registrations: [],
};

interface ScheduleContextValue {
  data: ScheduleData;
  generatedSchedule: GeneratedSchedule | null;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addClassType: (classType: Omit<ClassType, 'id'>) => void;
  updateClassType: (classType: ClassType) => void;
  deleteClassType: (id: string) => void;
  updateRegistration: (registration: ClassRegistration) => void;
  refreshSchedule: () => void;
  loadFromFile: () => Promise<void>;
  saveToFile: () => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ScheduleData>(emptyData);
  const [generatedSchedule, setGeneratedSchedule] =
    useState<GeneratedSchedule | null>(null);

  const addStudent = useCallback((student: Omit<Student, 'id'>) => {
    setData((prev) => ({
      ...prev,
      students: [...prev.students, { ...student, id: crypto.randomUUID() }],
    }));
  }, []);

  const updateStudent = useCallback((student: Student) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === student.id ? student : s)),
    }));
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
      registrations: prev.registrations.map((r) => ({
        ...r,
        studentIds: r.studentIds.filter((sid) => sid !== id),
        friendGroups: r.friendGroups
          .map((g) => g.filter((sid) => sid !== id))
          .filter((g) => g.length >= 2),
      })),
    }));
  }, []);

  const addClassType = useCallback((classType: Omit<ClassType, 'id'>) => {
    const id = crypto.randomUUID();
    setData((prev) => ({
      ...prev,
      classTypes: [...prev.classTypes, { ...classType, id }],
      registrations: [
        ...prev.registrations,
        { classTypeId: id, studentIds: [], friendGroups: [] },
      ],
    }));
  }, []);

  const updateClassType = useCallback((classType: ClassType) => {
    setData((prev) => ({
      ...prev,
      classTypes: prev.classTypes.map((ct) =>
        ct.id === classType.id ? classType : ct
      ),
    }));
  }, []);

  const deleteClassType = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      classTypes: prev.classTypes.filter((ct) => ct.id !== id),
      registrations: prev.registrations.filter((r) => r.classTypeId !== id),
    }));
  }, []);

  const updateRegistration = useCallback((registration: ClassRegistration) => {
    setData((prev) => ({
      ...prev,
      registrations: prev.registrations.map((r) =>
        r.classTypeId === registration.classTypeId ? registration : r
      ),
    }));
  }, []);

  const refreshSchedule = useCallback(() => {
    setGeneratedSchedule(generateSchedule(data));
  }, [data]);

  const loadFromFile = useCallback(async () => {
    const loaded = await fileService.openFile();
    if (loaded) {
      setData(loaded);
      setGeneratedSchedule(null);
    }
  }, []);

  const saveToFile = useCallback(() => {
    fileService.saveFile(data, 'summer-camp-schedules.json');
  }, [data]);

  return (
    <ScheduleContext.Provider
      value={{
        data,
        generatedSchedule,
        addStudent,
        updateStudent,
        deleteStudent,
        addClassType,
        updateClassType,
        deleteClassType,
        updateRegistration,
        refreshSchedule,
        loadFromFile,
        saveToFile,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
}
