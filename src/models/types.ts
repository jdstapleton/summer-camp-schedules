export type Gender = 'male' | 'female' | 'other';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
}

export interface ClassType {
  id: string;
  name: string;
  maxSize: number;
}

export interface ClassRegistration {
  classTypeId: string;
  studentIds: string[];
  friendGroups: string[][];
}

export interface ClassInstance {
  id: string;
  classTypeId: string;
  instanceNumber: number;
  studentIds: string[];
}

export interface ScheduleData {
  students: Student[];
  classTypes: ClassType[];
  registrations: ClassRegistration[];
}

export interface GeneratedSchedule {
  instances: ClassInstance[];
}
