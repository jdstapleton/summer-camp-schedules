import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSchedule } from './useSchedule';
import { ScheduleProvider } from '@/contexts/ScheduleProvider';
import { LocationContext } from '@/contexts/LocationContext';

vi.mock('@/services/supabaseStorage', () => ({
  fetchScheduleData: vi.fn().mockResolvedValue(null),
  saveScheduleData: vi.fn().mockResolvedValue(true),
  subscribeToChanges: vi.fn().mockReturnValue(() => {}),
}));

const testLocation = { id: 'test-loc', name: 'Test', address: '', urlTag: 'test' };
const locationContextValue = {
  location: testLocation,
  locations: [testLocation],
  createLocation: vi.fn(),
  deleteLocation: vi.fn(),
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <LocationContext.Provider value={locationContextValue}>
    <ScheduleProvider>{children}</ScheduleProvider>
  </LocationContext.Provider>
);

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
