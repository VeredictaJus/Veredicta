import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'
import { Alert } from '@/types/analytics'; // Ajuste o tipo conforme sua estrutura

export function useRealtimeAnalytics(onNewAlert: (alert: Alert) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('analytics-alerts-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          const newAlert = payload.new as Alert;
          onNewAlert(newAlert);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewAlert]);
}
