import { ScheduleData } from '@/models/types';
import { supabase } from './supabaseClient';

const SESSION_ID = crypto.randomUUID();

export async function fetchScheduleData(): Promise<ScheduleData | null> {
  try {
    const { data: row, error } = await supabase.from('schedule_data').select('data').eq('id', 'main').single();

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

export async function saveScheduleData(data: ScheduleData): Promise<boolean> {
  try {
    const session = await supabase.auth.getSession();
    const userEmail = session.data.session?.user?.email ?? 'unknown';

    const { error } = await supabase.from('schedule_data').upsert(
      {
        id: 'main',
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

export function subscribeToChanges(callback: (data: ScheduleData) => void): () => void {
  const channel = supabase
    .channel('schedule_data')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'schedule_data' }, (payload) => {
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
        console.log('[Realtime] subscribed to schedule_data');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('[Realtime] subscription failed:', status, err);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
