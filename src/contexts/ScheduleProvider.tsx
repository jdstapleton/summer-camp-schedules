import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Camp, CampRegistration, GeneratedSchedule, ScheduleData, Student } from '@/models/types';
import type { ImportBatchPayload } from '@/models/contexts';
import { fileService } from '@/services/fileService';
import { generateSchedule } from '@/services/schedulerService';
import { migrateData } from '@/services/dataMigrations';
import { extractMentionedStudents } from '@/services/friendGroupService';
import { fetchScheduleData, saveScheduleData, subscribeToChanges } from '@/services/supabaseStorage';
import { ScheduleContext } from './ScheduleContext';

const existingStudentKey = (s: Student): string => `${s.lastName.trim().toLowerCase()}|${s.firstName.trim().toLowerCase()}|${s.age}`;

const emptyData: ScheduleData = {
  version: 7,
  students: [],
  camps: [],
  registrations: [],
  schedule: null,
};

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ScheduleData>(emptyData);
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch from Supabase on mount
  useEffect(() => {
    const init = async () => {
      const remote = await fetchScheduleData();
      if (remote) {
        const migrated = migrateData(remote);
        setData(migrated);
        setGeneratedSchedule(migrated.schedule ?? null);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    const unsubscribe = subscribeToChanges((incoming) => {
      const migrated = migrateData(incoming);
      setData(migrated);
      setGeneratedSchedule(migrated.schedule ?? null);
    });
    return unsubscribe;
  }, []);

  // Refs for serialized saves: ensure only one in-flight at a time, always save latest state
  const savePendingRef = useRef<ScheduleData | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const doSave = useCallback(async () => {
    if (saveInFlightRef.current || !savePendingRef.current) return;
    const toSave = savePendingRef.current;
    savePendingRef.current = null;
    saveInFlightRef.current = true;
    try {
      await saveScheduleData(toSave);
    } catch (err) {
      console.error('Failed to save to Supabase:', err);
    } finally {
      saveInFlightRef.current = false;
      if (savePendingRef.current) doSave(); // flush any change that arrived while saving
    }
  }, []);

  const applyAndSave = useCallback(
    (newData: ScheduleData) => {
      setData(newData);
      if (!loading) {
        savePendingRef.current = newData;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(doSave, 300);
      }
    },
    [loading, doSave]
  );

  const addStudent = useCallback(
    (student: Omit<Student, 'id'>) => {
      const newData = {
        ...data,
        students: [...data.students, { ...student, id: crypto.randomUUID() }],
      };
      applyAndSave(newData);
    },
    [data, applyAndSave]
  );

  const updateStudent = useCallback(
    (student: Student) => {
      const newData = {
        ...data,
        students: data.students.map((s) => (s.id === student.id ? student : s)),
      };
      applyAndSave(newData);
    },
    [data, applyAndSave]
  );

  const deleteStudent = useCallback(
    (id: string) => {
      const newData = {
        ...data,
        students: data.students.filter((s) => s.id !== id),
        registrations: data.registrations.map((r) => ({
          ...r,
          studentIds: r.studentIds.filter((sid) => sid !== id),
          friendGroups: r.friendGroups.map((g) => g.filter((sid) => sid !== id)).filter((g) => g.length >= 2),
        })),
      };
      applyAndSave(newData);
    },
    [data, applyAndSave]
  );

  const addCamp = useCallback(
    (camp: Omit<Camp, 'id'>) => {
      const id = crypto.randomUUID();
      const newData = {
        ...data,
        camps: [...data.camps, { ...camp, id }],
        registrations: [...data.registrations, { campId: id, studentIds: [], friendGroups: [] }],
      };
      applyAndSave(newData);
    },
    [data, applyAndSave]
  );

  const updateCamp = useCallback(
    (camp: Camp) => {
      const newData = {
        ...data,
        camps: data.camps.map((c) => (c.id === camp.id ? camp : c)),
      };
      applyAndSave(newData);
    },
    [data, applyAndSave]
  );

  const deleteCamp = useCallback(
    (id: string) => {
      const newData = {
        ...data,
        camps: data.camps.filter((c) => c.id !== id),
        registrations: data.registrations.filter((r) => r.campId !== id),
      };
      applyAndSave(newData);
    },
    [data, applyAndSave]
  );

  const updateRegistration = useCallback(
    (registration: CampRegistration) => {
      const newData = {
        ...data,
        registrations: data.registrations.map((r) => (r.campId === registration.campId ? registration : r)),
      };
      applyAndSave(newData);
    },
    [data, applyAndSave]
  );

  const moveStudentBetweenInstances = useCallback(
    (studentId: string, fromInstanceId: string, toInstanceId: string) => {
      if (!generatedSchedule) return;
      const updatedSchedule = {
        ...generatedSchedule,
        instances: generatedSchedule.instances.map((inst) => {
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
      setGeneratedSchedule(updatedSchedule);
      const newData = {
        ...data,
        schedule: updatedSchedule,
      };
      applyAndSave(newData);
    },
    [data, generatedSchedule, applyAndSave]
  );

  const refreshSchedule = useCallback(() => {
    const newSchedule = generateSchedule(data);
    setGeneratedSchedule(newSchedule);
    const newData = {
      ...data,
      schedule: newSchedule,
    };
    applyAndSave(newData);
  }, [data, applyAndSave]);

  const loadFromFile = useCallback(async () => {
    const loaded = await fileService.openFile();
    if (loaded) {
      const migratedData = migrateData(loaded);
      applyAndSave(migratedData);
      setGeneratedSchedule(migratedData.schedule ?? null);
    }
  }, [applyAndSave]);

  const saveToFile = useCallback(() => {
    fileService.saveFile(data, 'summer-camp-schedules.json');
  }, [data]);

  const clearData = useCallback(() => {
    applyAndSave(emptyData);
    setGeneratedSchedule(null);
  }, [applyAndSave]);

  const importBatch = useCallback(
    (payload: ImportBatchPayload) => {
      const keyToStudentId = new Map<string, string>();
      for (const existing of data.students) {
        keyToStudentId.set(existingStudentKey(existing), existing.id);
      }

      const mergedStudents = [...data.students];
      for (const parsed of payload.newStudents) {
        const { dedupeKey, ...studentFields } = parsed;
        if (keyToStudentId.has(dedupeKey)) continue;
        const id = crypto.randomUUID();
        mergedStudents.push({ ...studentFields, id });
        keyToStudentId.set(dedupeKey, id);
      }

      const nameToCampId = new Map<string, string>();
      for (const existing of data.camps) {
        nameToCampId.set(existing.name.trim().toLowerCase(), existing.id);
      }

      const mergedCamps = [...data.camps];
      const mergedRegistrations = [...data.registrations];
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

      const newData = {
        ...data,
        students: mergedStudents,
        camps: mergedCamps,
        registrations: Array.from(registrationByCampId.values()),
      };
      applyAndSave(newData);
    },
    [data, applyAndSave]
  );

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
