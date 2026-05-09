import type { Location, ScheduleData } from '@/models/types';
import { supabase } from './supabaseClient';

const SESSION_ID = crypto.randomUUID();

export async function fetchLocations(): Promise<Location[]> {
  try {
    const { data, error } = await supabase.from('schedule_data').select('id, location_name, location_address, url_tag').order('location_name');

    if (error) {
      console.error('Failed to fetch locations:', error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.location_name as string,
      address: row.location_address as string,
      urlTag: row.url_tag as string,
    }));
  } catch (err) {
    console.error('Error fetching locations:', err);
    return [];
  }
}

export async function insertLocation(id: string, name: string, address: string, urlTag: string): Promise<void> {
  const { error } = await supabase.from('schedule_data').insert({
    id,
    location_name: name,
    location_address: address,
    url_tag: urlTag,
    data: { version: 7, students: [], camps: [], registrations: [], schedule: null },
  });

  if (error) throw new Error(`Failed to create location: ${error.message}`);
}

export async function removeLocation(id: string): Promise<void> {
  const { error } = await supabase.from('schedule_data').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete location: ${error.message}`);
}

export async function fetchScheduleData(locationId: string): Promise<ScheduleData | null> {
  try {
    const { data: row, error } = await supabase.from('schedule_data').select('data').eq('id', locationId).single();

    if (error) {
      console.error('Failed to fetch schedule data:', error);
      return null;
    }

    return row?.data ?? null;
  } catch (err) {
    console.error('Error fetching schedule data:', err);
    return null;
  }
}

export async function saveScheduleData(locationId: string, data: ScheduleData): Promise<boolean> {
  try {
    const session = await supabase.auth.getSession();
    const userEmail = session.data.session?.user?.email ?? 'unknown';

    const { error } = await supabase.from('schedule_data').upsert(
      {
        id: locationId,
        data,
        updated_by: `${userEmail}:${SESSION_ID}`,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Failed to save schedule data:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error saving schedule data:', err);
    return false;
  }
}

export function subscribeToChanges(locationId: string, callback: (data: ScheduleData) => void): () => void {
  const channel = supabase
    .channel(`schedule_data-${locationId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'schedule_data', filter: `id=eq.${locationId}` }, (payload) => {
      const updatedBy = payload.new?.updated_by ?? '';

      if (updatedBy.includes(SESSION_ID)) {
        console.log('[Realtime] skipping own update');
        return;
      }

      if (payload.new?.data) {
        console.log('[Realtime] applying remote update, students count:', payload.new.data.students.length);
        callback(payload.new.data);
      } else {
        console.warn('[Realtime] payload missing data field');
      }
    })
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Realtime] subscribed to schedule_data for location', locationId);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('[Realtime] subscription failed:', status, err);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
