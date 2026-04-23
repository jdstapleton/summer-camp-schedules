import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  Camp,
  CampRegistration,
  GeneratedSchedule,
  ScheduleData,
  Student,
} from '@/models/types';
import { fileService } from '@/services/fileService';
import { generateSchedule } from '@/services/schedulerService';

const STORAGE_KEY = 'summer-camp-schedules';

const emptyData: ScheduleData = {
  students: [],
  camps: [],
  registrations: [],
};

const isValidScheduleData = (data: unknown): data is ScheduleData => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    Array.isArray(obj.students) &&
    Array.isArray(obj.camps) &&
    Array.isArray(obj.registrations)
  );
};

interface ScheduleContextValue {
  data: ScheduleData;
  generatedSchedule: GeneratedSchedule | null;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addCamp: (camp: Omit<Camp, 'id'>) => void;
  updateCamp: (camp: Camp) => void;
  deleteCamp: (id: string) => void;
  updateRegistration: (registration: CampRegistration) => void;
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isValidScheduleData(parsed)) return parsed;
        // Schema mismatch (likely old format), clear and start fresh
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // corrupted data, clear it and fall back to empty
      localStorage.removeItem(STORAGE_KEY);
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

  const addCamp = useCallback((camp: Omit<Camp, 'id'>) => {
    const id = crypto.randomUUID();
    setData((prev) => ({
      ...prev,
      camps: [...prev.camps, { ...camp, id }],
      registrations: [
        ...prev.registrations,
        { campId: id, studentIds: [], friendGroups: [] },
      ],
    }));
  }, []);

  const updateCamp = useCallback((camp: Camp) => {
    setData((prev) => ({
      ...prev,
      camps: prev.camps.map((c) =>
        c.id === camp.id ? camp : c
      ),
    }));
  }, []);

  const deleteCamp = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      camps: prev.camps.filter((c) => c.id !== id),
      registrations: prev.registrations.filter((r) => r.campId !== id),
    }));
  }, []);

  const updateRegistration = useCallback((registration: CampRegistration) => {
    setData((prev) => ({
      ...prev,
      registrations: prev.registrations.map((r) =>
        r.campId === registration.campId ? registration : r
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
        addCamp,
        updateCamp,
        deleteCamp,
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
