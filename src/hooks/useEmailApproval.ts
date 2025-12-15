import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface EmailApprovalHook {
  processEmailApproval: (
    redactorId: string,
    action: 'approve' | 'reject',
    reason?: string
  ) => Promise<boolean>;
  checkPendingApprovals: () => void;
  isProcessing: boolean;
  error: string | null;
}

export const useEmailApproval = (): EmailApprovalHook => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processEmailApproval = async (
    redactorId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<boolean> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Buscar dados do redator
      const { data: redator, error: fetchError } = await supabase
        .from('redatores')
        .select('*')
        .eq('id', redactorId)
        .single();

      if (fetchError || !redator) {
        throw new Error('Redator não encontrado.');
      }

      // Atualizar status no Supabase
      const updateData =
        action === 'approve'
          ? { status: 'approved', motivo_rejeicao: null, aceite_em: new Date().toISOString() }
          : { status: 'rejected', motivo_rejeicao: reason || 'Não especificado' };

      const { error: updateError } = await supabase
        .from('redatores')
        .update(updateData)
        .eq('id', redactorId);

      if (updateError) throw updateError;

      // Enviar e-mail via função Edge
      await fetch('https://dmsodonmkfifyvbuxtxec.functions.supabase.co/enviar-email-aprovacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: redator.email,
          subject: action === 'approve'
            ? 'Sua conta foi aprovada!'
            : 'Sua conta foi rejeitada',
          html: action === 'approve'
            ? `<p>Olá ${redator.nome}, sua conta foi <strong>aprovada</strong>! Bem-vindo(a) ao Veredicta.</p>`
            : `<p>Olá ${redator.nome}, sua conta foi <strong>rejeitada</strong>.<br>Motivo: ${reason}</p>`,
        }),
      });

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(msg);
      console.error('Erro ao processar aprovação:', err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPendingApprovals = async () => {
    try {
      const { data, error } = await supabase
        .from('redatores')
        .select('*')
        .eq('status', 'pending');

      if (error) throw error;

      console.log(`🔎 Encontrados ${data.length} redatores pendentes:`);
      data.forEach(r => {
        console.log(`${r.nome} (${r.email}) - ID: ${r.id}`);
      });
    } catch (err) {
      console.error('Erro ao buscar redatores pendentes:', err);
    }
  };

  useEffect(() => {
    checkPendingApprovals();
  }, []);

  return {
    processEmailApproval,
    checkPendingApprovals,
    isProcessing,
    error
  };
};
