export type Gender = 'male' | 'female' | 'other';
export type Custody = 'Both' | 'Father' | 'Mother';

export interface ImportColumnConfig {
  lastName: string[];
  firstName: string[];
  gender: string[];
  age: string[];
  sessionName: string[];
  selections: string[];
  specialRequest: string[];
  medicalIssues: string[];
  photo: string[];
  tshirtSize: string[];
  primaryName: string[];
  primaryHomePhone: string[];
  primaryCellPhone: string[];
  secondaryName: string[];
  secondaryCellPhone: string[];
  emergencyName: string[];
  emergencyPhone: string[];
  custody: string[];
}

export interface AppConfig {
  gradeRanges: string[];
  extraWeeks: string[];
  defaultMaxSize: number;
  importColumnConfig: ImportColumnConfig;
}

export interface Contact {
  name: string;
  homePhone: string;
  cellPhone: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
  custody: Custody;
  photo: boolean;
  preCamp: boolean;
  postCamp: boolean;
  specialRequest: string;
  medicalIssues: string;
  tshirtSize: string;
  primary: Contact;
  secondary: Contact;
  emergency: Contact;
}

export interface Camp {
  id: string;
  name: string;
  gradeRange: string;
  week: string;
  maxSize: number;
}

export interface CampRegistration {
  campId: string;
  studentIds: string[];
  friendGroups: string[][];
}

export interface CampInstance {
  id: string;
  campId: string;
  instanceNumber: number;
  studentIds: string[];
}

export interface ScheduleData {
  version: number;
  students: Student[];
  camps: Camp[];
  registrations: CampRegistration[];
  schedule: GeneratedSchedule | null;
}

export interface GeneratedSchedule {
  instances: CampInstance[];
}
