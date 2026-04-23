import { useContext } from 'react';
import type { ScheduleContextValue } from '@/models/contexts';
import { ScheduleContext } from '@/contexts/ScheduleContext';

export function useSchedule(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
}
