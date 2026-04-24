import {
  ScheduleData,
  GeneratedSchedule,
  Student,
  Camp,
  CampRegistration,
} from './types';

export interface ImportBatchPayload {
  newStudents: (Omit<Student, 'id'> & { dedupeKey: string })[];
  newCamps: Omit<Camp, 'id'>[];
  registrationRows: { campName: string; dedupeKey: string }[];
}

export interface ScheduleContextValue {
  data: ScheduleData;
  generatedSchedule: GeneratedSchedule | null;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  randomizeAllSafetyCodes: () => void;
  addCamp: (camp: Omit<Camp, 'id'>) => void;
  updateCamp: (camp: Camp) => void;
  deleteCamp: (id: string) => void;
  updateRegistration: (registration: CampRegistration) => void;
  moveStudentBetweenInstances: (
    studentId: string,
    fromInstanceId: string,
    toInstanceId: string
  ) => void;
  refreshSchedule: () => void;
  loadFromFile: () => Promise<void>;
  saveToFile: () => void;
  clearData: () => void;
  importBatch: (payload: ImportBatchPayload) => void;
}
