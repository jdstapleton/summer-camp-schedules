import {
  ScheduleData,
  GeneratedSchedule,
  Student,
  Camp,
  CampRegistration,
} from './types';

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
  refreshSchedule: () => void;
  loadFromFile: () => Promise<void>;
  saveToFile: () => void;
  clearData: () => void;
}
