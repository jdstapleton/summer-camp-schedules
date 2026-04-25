import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Camp, CampRegistration, GeneratedSchedule, ScheduleData, Student } from '@/models/types';
import type { ImportBatchPayload } from '@/models/contexts';
import { fileService } from '@/services/fileService';
import { generateSchedule } from '@/services/schedulerService';
import { migrateData } from '@/services/dataMigrations';
import { extractMentionedStudents } from '@/services/friendGroupService';
import { safeSetItem } from '@/services/safeStorage';
import { ScheduleContext } from './ScheduleContext';

const existingStudentKey = (s: Student): string => `${s.lastName.trim().toLowerCase()}|${s.firstName.trim().toLowerCase()}|${s.age}`;

const STORAGE_KEY = 'summer-camp-schedules';

const emptyData: ScheduleData = {
  version: 7,
  students: [],
  camps: [],
  registrations: [],
  schedule: null,
};

const isValidScheduleData = (data: unknown): data is ScheduleData => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  const isValidSchedule = (sched: unknown): sched is GeneratedSchedule | null =>
    sched === null || (typeof sched === 'object' && Array.isArray((sched as Record<string, unknown>).instances));
  return Array.isArray(obj.students) && Array.isArray(obj.camps) && Array.isArray(obj.registrations) && isValidSchedule(obj.schedule);
};

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ScheduleData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isValidScheduleData(parsed)) return migrateData(parsed);
        // Schema mismatch (likely old format), clear and start fresh
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // corrupted data, clear it and fall back to empty
      localStorage.removeItem(STORAGE_KEY);
    }
    return emptyData;
  });
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedSchedule | null>(data.schedule ?? null);

  useEffect(() => {
    safeSetItem(STORAGE_KEY, JSON.stringify(data));
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
        friendGroups: r.friendGroups.map((g) => g.filter((sid) => sid !== id)).filter((g) => g.length >= 2),
      })),
    }));
  }, []);

  const addCamp = useCallback((camp: Omit<Camp, 'id'>) => {
    const id = crypto.randomUUID();
    setData((prev) => ({
      ...prev,
      camps: [...prev.camps, { ...camp, id }],
      registrations: [...prev.registrations, { campId: id, studentIds: [], friendGroups: [] }],
    }));
  }, []);

  const updateCamp = useCallback((camp: Camp) => {
    setData((prev) => ({
      ...prev,
      camps: prev.camps.map((c) => (c.id === camp.id ? camp : c)),
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
      registrations: prev.registrations.map((r) => (r.campId === registration.campId ? registration : r)),
    }));
  }, []);

  const moveStudentBetweenInstances = useCallback((studentId: string, fromInstanceId: string, toInstanceId: string) => {
    setGeneratedSchedule((prev) => {
      if (!prev) return prev;
      const updatedSchedule = {
        ...prev,
        instances: prev.instances.map((inst) => {
          if (inst.id === fromInstanceId) {
            return {
              ...inst,
              studentIds: inst.studentIds.filter((id) => id !== studentId),
            };
          }
          if (inst.id === toInstanceId) {
            return {
              ...inst,
              studentIds: [...inst.studentIds, studentId],
            };
          }
          return inst;
        }),
      };
      setData((prevData) => ({
        ...prevData,
        schedule: updatedSchedule,
      }));
      return updatedSchedule;
    });
  }, []);

  const refreshSchedule = useCallback(() => {
    const newSchedule = generateSchedule(data);
    setGeneratedSchedule(newSchedule);
    setData((prevData) => ({
      ...prevData,
      schedule: newSchedule,
    }));
  }, [data]);

  const loadFromFile = useCallback(async () => {
    const loaded = await fileService.openFile();
    if (loaded) {
      const migratedData = migrateData(loaded);
      setData(migratedData);
      setGeneratedSchedule(migratedData.schedule ?? null);
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

  const importBatch = useCallback((payload: ImportBatchPayload) => {
    setData((prev) => {
      const keyToStudentId = new Map<string, string>();
      for (const existing of prev.students) {
        keyToStudentId.set(existingStudentKey(existing), existing.id);
      }

      const mergedStudents = [...prev.students];
      for (const parsed of payload.newStudents) {
        const { dedupeKey, ...studentFields } = parsed;
        if (keyToStudentId.has(dedupeKey)) continue;
        const id = crypto.randomUUID();
        mergedStudents.push({ ...studentFields, id });
        keyToStudentId.set(dedupeKey, id);
      }

      const nameToCampId = new Map<string, string>();
      for (const existing of prev.camps) {
        nameToCampId.set(existing.name.trim().toLowerCase(), existing.id);
      }

      const mergedCamps = [...prev.camps];
      const mergedRegistrations = [...prev.registrations];
      for (const newCamp of payload.newCamps) {
        const canonical = newCamp.name.trim().toLowerCase();
        if (nameToCampId.has(canonical)) continue;
        const id = crypto.randomUUID();
        mergedCamps.push({ ...newCamp, id });
        mergedRegistrations.push({
          campId: id,
          studentIds: [],
          friendGroups: [],
        });
        nameToCampId.set(canonical, id);
      }

      const registrationByCampId = new Map<string, CampRegistration>();
      for (const r of mergedRegistrations) {
        registrationByCampId.set(r.campId, { ...r, studentIds: [...r.studentIds] });
      }

      for (const row of payload.registrationRows) {
        const campId = nameToCampId.get(row.campName.trim().toLowerCase());
        const studentId = keyToStudentId.get(row.dedupeKey);
        if (!campId || !studentId) continue;
        const reg = registrationByCampId.get(campId);
        if (!reg) continue;
        if (!reg.studentIds.includes(studentId)) {
          reg.studentIds.push(studentId);
        }
      }

      // Create friend groups based on special request mentions with transitive merging
      for (const reg of registrationByCampId.values()) {
        const campStudents = mergedStudents.filter((s) => reg.studentIds.includes(s.id));

        const unionFind = new Map<string, string>();
        const find = (id: string): string => {
          if (!unionFind.has(id)) unionFind.set(id, id);
          const parent = unionFind.get(id)!;
          if (parent === id) return id;
          const root = find(parent);
          unionFind.set(id, root);
          return root;
        };
        const union = (id1: string, id2: string) => {
          const root1 = find(id1);
          const root2 = find(id2);
          if (root1 !== root2) {
            unionFind.set(root1, root2);
          }
        };

        for (const student of campStudents) {
          if (!student.specialRequest.trim()) continue;

          const mentioned = extractMentionedStudents(student.specialRequest, campStudents);

          for (const mentionedId of mentioned) {
            if (mentionedId === student.id) continue;
            union(student.id, mentionedId);
          }
        }

        const groupMap = new Map<string, string[]>();
        for (const studentId of reg.studentIds) {
          const root = find(studentId);
          if (!groupMap.has(root)) groupMap.set(root, []);
          groupMap.get(root)!.push(studentId);
        }

        reg.friendGroups = Array.from(groupMap.values()).filter((g) => g.length >= 2);
      }

      return {
        ...prev,
        students: mergedStudents,
        camps: mergedCamps,
        registrations: Array.from(registrationByCampId.values()),
      };
    });
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
        moveStudentBetweenInstances,
        refreshSchedule,
        loadFromFile,
        saveToFile,
        clearData,
        importBatch,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}
