import { useMemo } from 'react';
import type { Petition } from '@/lib/types'; // Certifique-se que o caminho e tipo estão corretos

type ChatControlStatus = {
  isEnabled: boolean;
  reason?: 'chat_disabled' | 'petition_delivered' | 'auto_disabled';
  canReactivate: boolean;
  statusMessage?: string;
};

/**
 * Verifica o status atual do chat baseado nas regras da plataforma.
 */
export function useChatControl(petition: Petition | null): ChatControlStatus {
  return useMemo(() => {
    if (!petition) {
      return {
        isEnabled: false,
        reason: 'chat_disabled',
        canReactivate: false,
        statusMessage: 'Nenhuma petição selecionada.',
      };
    }

    // Se o chat estiver desabilitado por qualquer motivo
    if (!petition.chat_enabled) {
      if (petition.status === 'DELIVERED') {
        return {
          isEnabled: false,
          reason: 'petition_delivered',
          canReactivate: true,
          statusMessage: 'Chat finalizado após entrega. Você pode reativar solicitando uma correção.',
        };
      }

      if (petition.chat_auto_disabled) {
        return {
          isEnabled: false,
          reason: 'auto_disabled',
          canReactivate: true,
          statusMessage: 'Chat desativado automaticamente. Solicite reativação pela equipe.',
        };
      }

      return {
        isEnabled: false,
        reason: 'chat_disabled',
        canReactivate: false,
        statusMessage: 'O chat está desabilitado para esta petição.',
      };
    }

    return {
      isEnabled: true,
      canReactivate: false,
    };
  }, [petition]);
}
