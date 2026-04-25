export type Gender = 'male' | 'female' | 'other';
export type Custody = 'Both' | 'Father' | 'Mother';

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
}

export interface GeneratedSchedule {
  instances: CampInstance[];
}
