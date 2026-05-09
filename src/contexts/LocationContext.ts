import { createContext, useContext } from 'react';
import type { Location } from '@/models/types';

export interface LocationContextValue {
  location: Location;
  locations: Location[];
  createLocation: (name: string, address: string) => Promise<Location>;
  deleteLocation: (id: string) => Promise<void>;
}

export const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within a LocationProvider');
  return ctx;
}
