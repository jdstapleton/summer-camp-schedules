import { createContext, useContext } from 'react';
import type { useStudentFilters } from '@/hooks/useStudentFilters';

type StudentsFiltersContextValue = ReturnType<typeof useStudentFilters>;

export const StudentsFiltersContext = createContext<StudentsFiltersContextValue | null>(null);

export function useStudentsFilters(): StudentsFiltersContextValue {
  const ctx = useContext(StudentsFiltersContext);
  if (!ctx) throw new Error('useStudentsFilters must be used within StudentsFiltersProvider');
  return ctx;
}
