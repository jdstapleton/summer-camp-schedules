export type Gender = 'male' | 'female' | 'other';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
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
  students: Student[];
  camps: Camp[];
  registrations: CampRegistration[];
}

export interface GeneratedSchedule {
  instances: CampInstance[];
}

// Legacy type aliases for backwards compatibility during migration
export type ClassType = Camp;
export type ClassRegistration = CampRegistration;
export type ClassInstance = CampInstance;
