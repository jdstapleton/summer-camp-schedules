import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSchedule } from './useSchedule';
import { ScheduleProvider } from '@/contexts/ScheduleProvider';

const wrapper = ({ children }: { children: ReactNode }) => <ScheduleProvider>{children}</ScheduleProvider>;

describe('useSchedule', () => {
  beforeEach(() => localStorage.clear());

  it('throws when called outside a ScheduleProvider', () => {
    expect(() => renderHook(() => useSchedule())).toThrow('useSchedule must be used within ScheduleProvider');
  });

  it('returns the context value when wrapped in ScheduleProvider', () => {
    const { result } = renderHook(() => useSchedule(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current.data).toBeDefined();
    expect(typeof result.current.addStudent).toBe('function');
  });
});
