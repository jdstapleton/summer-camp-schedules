import { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

const STORAGE_KEY = 'summer-camp-schedules';

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
  clearData: () => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ScheduleData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as ScheduleData;
    } catch {
      // corrupted data, fall back to empty
    }
    return emptyData;
  });
  const [generatedSchedule, setGeneratedSchedule] =
    useState<GeneratedSchedule | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

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

  const clearData = useCallback(() => {
    setData(emptyData);
    setGeneratedSchedule(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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
        clearData,
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
