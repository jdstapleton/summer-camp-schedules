import type { Student } from '@/models/types';

export function extractMentionedStudents(text: string, students: Student[]): string[] {
  if (!text.trim()) return [];

  const mentioned = new Set<string>();

  for (const student of students) {
    const firstName = student.firstName.toLowerCase();
    const lastName = student.lastName.toLowerCase();
    const fullName = `${firstName} ${lastName}`;

    // Use word boundary matching to avoid substring matches like "Ho" matching "Hot"
    const fullNameRegex = new RegExp(`\\b${escapeRegex(fullName)}\\b`, 'i');
    const firstNameRegex = new RegExp(`\\b${escapeRegex(firstName)}\\b`, 'i');
    const lastNameRegex = new RegExp(`\\b${escapeRegex(lastName)}\\b`, 'i');

    if (fullNameRegex.test(text) || firstNameRegex.test(text) || lastNameRegex.test(text)) {
      mentioned.add(student.id);
    }
  }

  return Array.from(mentioned);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
