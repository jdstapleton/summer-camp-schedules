import { useParams } from '@tanstack/react-router';
import { LocationProvider } from '@/contexts/LocationProvider';
import { ScheduleProvider } from '@/contexts/ScheduleProvider';
import { Layout } from './Layout';

export function LocationLayout() {
  const { locationTag } = useParams({ strict: false });
  return (
    <LocationProvider urlTag={locationTag ?? ''}>
      <ScheduleProvider>
        <Layout />
      </ScheduleProvider>
    </LocationProvider>
  );
}
