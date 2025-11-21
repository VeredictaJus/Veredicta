// src/hooks/useRealTimeAlerts.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'

export type AlertType = 'warning' | 'error' | 'info' | 'success';

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  timestamp: string;
  user_id?: string | null;
  target_role?: string | null;
}

/**
 * Assina em tempo real a tabela `public.alerts`.
 * - Se `currentUserId` existir, assina alertas específicos do usuário.
 * - (Opcional) também assina alertas globais para um papel/role (ex.: 'admin').
 */
export function useRealTimeAlerts(
  currentUserId: string | null | undefined,
  onNewAlert: (alert: Alert) => void,
  options?: { listenRole?: string } // ex.: { listenRole: 'admin' }
) {
  useEffect(() => {
    // se não houver usuário logado ainda, não assina
    if (!currentUserId && !options?.listenRole) return;

    const channel = supabase.channel('realtime:alerts');

    if (currentUserId) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `user_id=eq.${currentUserId}` // uuid
        },
        (payload) => {
          const row = payload.new as any;
          const alert: Alert = {
            id: String(row.id),
            type: row.type as AlertType,
            message: row.message,
            timestamp: row.timestamp ?? new Date().toISOString(),
            user_id: row.user_id ?? null,
            target_role: row.target_role ?? null,
          };
          onNewAlert(alert);
        }
      );
    }

    // opcional: alertas endereçados por papel (ex.: todos os admins)
    if (options?.listenRole) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `target_role=eq.${options.listenRole}`
        },
        (payload) => {
          const row = payload.new as any;
          const alert: Alert = {
            id: String(row.id),
            type: row.type as AlertType,
            message: row.message,
            timestamp: row.timestamp ?? new Date().toISOString(),
            user_id: row.user_id ?? null,
            target_role: row.target_role ?? null,
          };
          onNewAlert(alert);
        }
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, onNewAlert, options?.listenRole]);
}
