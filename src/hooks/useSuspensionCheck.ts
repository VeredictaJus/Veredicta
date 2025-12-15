import { useEffect, useState } from 'react';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { supabase } from '@/lib/supabaseClient';

interface SuspensionInfo {
  isSuspended: boolean;
  isBlocked: boolean;
  suspendedUntil: string | null;
  reason: string | null;
  daysRemaining: number | null;
}

export function useSuspensionCheck() {
  const { user } = useNewAuth();
  const [suspensionInfo, setSuspensionInfo] = useState<SuspensionInfo>({
    isSuspended: false,
    isBlocked: false,
    suspendedUntil: null,
    reason: null,
    daysRemaining: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    checkSuspension();
  }, [user?.uid]);

  const checkSuspension = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles_v2')
        .select('suspended_until, is_blocked, suspension_reason')
        .eq('firebase_uid', user?.uid)
        .single();

      if (error) throw error;

      if (data) {
        const suspendedUntil = data.suspended_until ? new Date(data.suspended_until) : null;
        const now = new Date();
        const isSuspended = suspendedUntil ? now < suspendedUntil : false;
        const daysRemaining = suspendedUntil && isSuspended
          ? Math.ceil((suspendedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        setSuspensionInfo({
          isSuspended,
          isBlocked: data.is_blocked || false,
          suspendedUntil: data.suspended_until,
          reason: data.suspension_reason,
          daysRemaining
        });
      }
    } catch (error) {
      console.error('Erro ao verificar suspensão:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (feature: 'petitions' | 'calculator' | 'payments' | 'my-petitions' | 'chat' | 'settings') => {
    // Se bloqueado permanentemente, só pode acessar chat e settings
    if (suspensionInfo.isBlocked) {
      return feature === 'chat' || feature === 'settings';
    }

    // Se suspenso temporariamente
    if (suspensionInfo.isSuspended) {
      // Pode acessar: minhas petições (concluir as em andamento), chat e settings
      return feature === 'my-petitions' || feature === 'chat' || feature === 'settings';
    }

    // Se não suspenso, pode acessar tudo
    return true;
  };

  const getBlockMessage = (feature: string) => {
    if (suspensionInfo.isBlocked) {
      return '🚫 Sua conta está bloqueada. Entre em contato com o suporte.';
    }

    if (suspensionInfo.isSuspended) {
      return `⏸️ Você está suspenso por mais ${suspensionInfo.daysRemaining} dias. Durante a suspensão, você não pode ${feature}.`;
    }

    return '';
  };

  return {
    suspensionInfo,
    loading,
    canAccess,
    getBlockMessage,
    isSuspendedOrBlocked: suspensionInfo.isSuspended || suspensionInfo.isBlocked
  };
}







