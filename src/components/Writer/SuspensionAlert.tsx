import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Ban, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { Button } from '@/components/ui/button';

interface SuspensionStatus {
  is_suspended: boolean;
  is_blocked: boolean;
  suspended_until: string | null;
  suspension_reason: string | null;
  total_late_deliveries: number;
  days_remaining: number | null;
  suspension_type: string | null;
  average_rating: number | null;
  total_ratings: number;
}

export default function SuspensionAlert() {
  const { user } = useNewAuth();
  const [suspensionStatus, setSuspensionStatus] = useState<SuspensionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    
    checkSuspensionStatus();
  }, [user?.uid]);

  const checkSuspensionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles_v2')
        .select('suspended_until, is_blocked, suspension_reason, total_late_deliveries, suspension_type, average_rating, total_ratings')
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

        setSuspensionStatus({
          is_suspended: isSuspended,
          is_blocked: data.is_blocked || false,
          suspended_until: data.suspended_until,
          suspension_reason: data.suspension_reason,
          total_late_deliveries: data.total_late_deliveries || 0,
          days_remaining: daysRemaining,
          suspension_type: data.suspension_type,
          average_rating: data.average_rating,
          total_ratings: data.total_ratings || 0
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status de suspensão:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !suspensionStatus) return null;

  // 🚫 BLOQUEADO PERMANENTEMENTE
  if (suspensionStatus.is_blocked) {
    return (
      <Alert className="mb-6 border-2 border-red-600 bg-red-50 dark:bg-red-950/50">
        <Ban className="h-5 w-5 text-red-700 dark:text-red-400" />
        <AlertTitle className="text-lg font-bold text-red-900 dark:text-red-100">
          🚫 Conta Bloqueada Permanentemente
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3 text-red-900 dark:text-red-100">
          <p className="font-medium">
            Sua conta foi bloqueada devido a {suspensionStatus.total_late_deliveries} atrasos acumulados.
          </p>
          {suspensionStatus.suspension_reason && (
            <p className="text-sm bg-red-200 dark:bg-red-900/80 text-red-950 dark:text-red-50 p-3 rounded font-medium">
              <strong>Motivo:</strong> {suspensionStatus.suspension_reason}
            </p>
          )}
          <div className="bg-red-200 dark:bg-red-900/80 text-red-950 dark:text-red-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">⚠️ O que fazer:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Entre em contato com o suporte para revisão</li>
              <li>Explique as circunstâncias dos atrasos</li>
              <li>Aguarde análise do time de suporte</li>
            </ul>
          </div>
          <Button 
            variant="destructive" 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={() => window.location.href = 'mailto:suporte@veredictajus.com'}
          >
            📧 Contatar Suporte
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // ⚠️ SUSPENSO POR BAIXA AVALIAÇÃO
  if (suspensionStatus.is_suspended && suspensionStatus.suspension_type === 'low_rating') {
    return (
      <Alert className="mb-6 border-2 border-red-500 bg-red-50 dark:bg-red-950/50 dark:border-red-600">
        <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-400" />
        <AlertTitle className="text-lg font-bold text-red-900 dark:text-red-100">
          ⚠️ Conta Suspensa por Baixa Avaliação
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3 text-red-900 dark:text-red-100">
          <p className="font-medium">
            Sua conta foi suspensa devido à baixa média de avaliações dos clientes.
          </p>
          
          <div className="bg-red-200 dark:bg-red-900/80 text-red-950 dark:text-red-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">📊 Suas Avaliações:</p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-3xl font-bold">
                  {suspensionStatus.average_rating?.toFixed(1) || 'N/A'} ⭐
                </p>
                <p className="text-sm">Média atual</p>
              </div>
              <div className="border-l-2 border-red-300 dark:border-red-700 pl-4">
                <p className="text-2xl font-bold">{suspensionStatus.total_ratings}</p>
                <p className="text-sm">Avaliações</p>
              </div>
            </div>
            <p className="text-sm mt-2 font-medium">
              ⚠️ Mínimo necessário: <strong>3.8 estrelas</strong>
            </p>
          </div>

          {suspensionStatus.suspension_reason && (
            <p className="text-sm bg-red-200 dark:bg-red-900/80 text-red-950 dark:text-red-50 p-3 rounded font-medium">
              <strong>Observação:</strong> {suspensionStatus.suspension_reason}
            </p>
          )}

          <div className="bg-red-200 dark:bg-red-900/80 text-red-950 dark:text-red-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">🔒 Restrições:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Você não pode aceitar novas petições</li>
              <li>Acesso limitado à plataforma</li>
              <li>Suspensão permanece até revisão do suporte</li>
            </ul>
          </div>

          <div className="bg-red-200 dark:bg-red-900/80 text-red-950 dark:text-red-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">📞 Como Resolver:</p>
            <p className="text-sm mb-3">
              Entre em contato com nossa equipe de suporte para discutir sua situação e possível reabilitação.
            </p>
            <Button 
              variant="destructive" 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.location.href = 'mailto:suporte@veredictajus.com'}
            >
              📧 Contatar Suporte
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // ⏸️ SUSPENSO TEMPORARIAMENTE (por atrasos)
  if (suspensionStatus.is_suspended && suspensionStatus.suspended_until) {
    return (
      <Alert className="mb-6 border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/50 dark:border-orange-600">
        <Clock className="h-5 w-5 text-orange-700 dark:text-orange-400" />
        <AlertTitle className="text-lg font-bold text-orange-900 dark:text-orange-100">
          ⏸️ Conta Suspensa Temporariamente
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3 text-orange-900 dark:text-orange-100">
          <p className="font-medium">
            Você está suspenso devido a {suspensionStatus.total_late_deliveries} atrasos acumulados.
          </p>
          {suspensionStatus.suspension_reason && (
            <p className="text-sm bg-orange-200 dark:bg-orange-900/80 text-orange-950 dark:text-orange-50 p-3 rounded font-medium">
              <strong>Motivo:</strong> {suspensionStatus.suspension_reason}
            </p>
          )}
          <div className="bg-orange-200 dark:bg-orange-900/80 text-orange-950 dark:text-orange-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">⏰ Período de Suspensão:</p>
            <p className="text-2xl font-bold">
              {suspensionStatus.days_remaining} dia{suspensionStatus.days_remaining !== 1 ? 's' : ''} restante{suspensionStatus.days_remaining !== 1 ? 's' : ''}
            </p>
            <p className="text-sm mt-2">
              Suspensão até: {new Date(suspensionStatus.suspended_until).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="bg-orange-200 dark:bg-orange-900/80 text-orange-950 dark:text-orange-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">⚠️ Durante a suspensão:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Você não pode aceitar novas petições</li>
              <li>Pode concluir petições em andamento</li>
              <li>Acesso ao chat e suporte disponível</li>
              <li>Use este tempo para revisar o Manual do Redator</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // ⚠️ AVISO DE RISCO (2 atrasos)
  if (suspensionStatus.total_late_deliveries === 2) {
    return (
      <Alert className="mb-6 border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50 dark:border-yellow-600">
        <AlertTriangle className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
        <AlertTitle className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
          ⚠️ Atenção: Próximo ao Limite
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-2 text-yellow-900 dark:text-yellow-100">
          <p className="font-medium">
            Você tem {suspensionStatus.total_late_deliveries} atrasos registrados.
          </p>
          <p className="text-sm bg-yellow-200 dark:bg-yellow-900/80 text-yellow-950 dark:text-yellow-50 p-3 rounded font-medium">
            <strong>⚠️ ATENÇÃO:</strong> O próximo atraso resultará em suspensão de <strong>30 dias</strong>.
          </p>
          <div className="text-sm">
            <p className="font-semibold mb-1">💡 Dicas para evitar atrasos:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Aceite apenas petições que conseguir cumprir</li>
              <li>Monitore o prazo no dashboard</li>
              <li>Entre em contato com suporte se houver problemas</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // ⚠️ AVISO DE RISCO CRÍTICO (5 ou 8 atrasos)
  if (suspensionStatus.total_late_deliveries === 5 || suspensionStatus.total_late_deliveries === 8) {
    const nextPenalty = suspensionStatus.total_late_deliveries === 5 
      ? '60 dias de suspensão' 
      : 'bloqueio permanente';
    
    return (
      <Alert className="mb-6 border-2 border-red-600 bg-red-50 dark:bg-red-950/50">
        <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-400" />
        <AlertTitle className="text-lg font-bold text-red-900 dark:text-red-100">
          🚨 ALERTA CRÍTICO: Próximo ao {suspensionStatus.total_late_deliveries === 8 ? 'Bloqueio' : 'Suspensão Severa'}
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-2 text-red-900 dark:text-red-100">
          <p className="font-medium">
            Você tem {suspensionStatus.total_late_deliveries} atrasos registrados.
          </p>
          <p className="text-sm bg-red-200 dark:bg-red-900/80 text-red-950 dark:text-red-50 p-3 rounded font-bold">
            🚨 O próximo atraso resultará em: <span className="underline">{nextPenalty}</span>
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // ⚠️ AVISO: AVALIAÇÃO PRÓXIMA AO LIMITE (3.8 - 4.0)
  if (
    !suspensionStatus.is_suspended && 
    !suspensionStatus.is_blocked && 
    suspensionStatus.average_rating !== null && 
    suspensionStatus.average_rating >= 3.8 && 
    suspensionStatus.average_rating < 4.0 &&
    suspensionStatus.total_ratings >= 3
  ) {
    return (
      <Alert className="mb-6 border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50 dark:border-yellow-600">
        <AlertTriangle className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
        <AlertTitle className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
          ⚠️ Atenção: Avaliação Próxima ao Limite
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-2 text-yellow-900 dark:text-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sua média atual:</p>
              <p className="text-3xl font-bold">{suspensionStatus.average_rating.toFixed(1)} ⭐</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Mínimo necessário:</p>
              <p className="text-2xl font-bold">3.8 ⭐</p>
            </div>
          </div>
          
          <p className="text-sm bg-yellow-200 dark:bg-yellow-900/80 text-yellow-950 dark:text-yellow-50 p-3 rounded font-medium">
            ⚠️ Cuidado! Sua avaliação está próxima do limite mínimo. Avaliações abaixo de <strong>3.8 estrelas</strong> resultam em <strong>suspensão automática</strong>.
          </p>
          
          <div className="text-sm">
            <p className="font-semibold mb-1">💡 Como melhorar suas avaliações:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Entregue petições com qualidade e dentro do prazo</li>
              <li>Mantenha comunicação clara com os clientes</li>
              <li>Revise cuidadosamente antes de enviar</li>
              <li>Peça feedback aos clientes satisfeitos</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

