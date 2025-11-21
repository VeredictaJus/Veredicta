import { Petition } from '@/lib/types';

/**
 * Retorna o status do chat com base nas regras de negócio da petição.
 */
export function getChatStatus(petition: Petition | null) {
  if (!petition) {
    return {
      isEnabled: false,
      canReactivate: false,
      statusMessage: 'Nenhuma petição selecionada.',
      reason: 'no_petition',
    };
  }

  if (!petition.chat_enabled) {
    const isDelivered = petition.status === 'DELIVERED';
    return {
      isEnabled: false,
      canReactivate: isDelivered,
      statusMessage: 'Chat finalizado.',
      reason: isDelivered ? 'petition_delivered' : 'chat_disabled',
    };
  }

  return {
    isEnabled: true,
    canReactivate: false,
    statusMessage: '',
    reason: null,
  };
}

/**
 * Calcula quantas horas faltam até o prazo da petição.
 */
export function calculateHoursUntilDeadline(deadline: string): number {
  const now = Date.now();
  const target = new Date(deadline).getTime();
  return Math.max(0, Math.floor((target - now) / (1000 * 60 * 60)));
}

/**
 * Verifica se o prazo está próximo (menos de X horas).
 */
export function isDeadlineNear(deadline: string, thresholdHours = 24): boolean {
  return calculateHoursUntilDeadline(deadline) <= thresholdHours;
}

/**
 * Formata o tempo restante até o prazo.
 */
export function formatTimeUntilDeadline(deadline: string): string {
  const hours = calculateHoursUntilDeadline(deadline);
  if (hours <= 0) return 'Expirado';
  if (hours < 24) return `${hours}h restantes`;

  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h restantes`;
}
