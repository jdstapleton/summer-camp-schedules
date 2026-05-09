import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import type { Location } from '@/models/types';
import { fetchLocations, insertLocation, removeLocation } from '@/services/supabaseStorage';
import { LocationContext } from './LocationContext';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

interface LocationProviderProps {
  urlTag: string;
  children: ReactNode;
}

export function LocationProvider({ urlTag, children }: LocationProviderProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations().then((locs) => {
      setLocations(locs);
      setLoading(false);
    });
  }, []);

  const createLocation = useCallback(async (name: string, address: string): Promise<Location> => {
    const id = crypto.randomUUID();
    const tag = slugify(name);
    await insertLocation(id, name, address, tag);
    const newLocation: Location = { id, name, address, urlTag: tag };
    setLocations((prev) => [...prev, newLocation].sort((a, b) => a.name.localeCompare(b.name)));
    return newLocation;
  }, []);

  const deleteLocation = useCallback(async (id: string): Promise<void> => {
    await removeLocation(id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const location = locations.find((l) => l.urlTag === urlTag);

  if (!location) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Location &quot;{urlTag}&quot; not found.</Typography>
      </Box>
    );
  }

  return <LocationContext.Provider value={{ location, locations, createLocation, deleteLocation }}>{children}</LocationContext.Provider>;
}
