import { useStudentFilters } from '@/hooks/useStudentFilters';
import { StudentsFiltersContext } from '@/contexts/StudentsFiltersContext';
import type { ScheduleData } from '@/models/types';

export function StudentsFiltersProvider({
  data,
  children,
}: {
  data: ScheduleData;
  children: React.ReactNode;
}) {
  const value = useStudentFilters(data);
  return (
    <StudentsFiltersContext.Provider value={value}>
      {children}
    </StudentsFiltersContext.Provider>
  );
}
