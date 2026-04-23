import { createContext } from 'react';

import { ScheduleContextValue } from '@/models/contexts';

export const ScheduleContext = createContext<ScheduleContextValue | null>(null);
