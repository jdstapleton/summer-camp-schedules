import { ScheduleData } from '@/models/types';
import { supabase } from './supabaseClient';

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
        updated_by: userEmail,
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
      if (payload.new?.data) {
        callback(payload.new.data);
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
