// src/components/integrations/PetitionChatIntegration.tsx
import { useEffect } from 'react';
import { usePetitionChat } from '@/hooks/usePetitionChat';

/**
 * Componente de integração que monitora mudanças nas petições
 * e cria/fecha conversas automaticamente
 * 
 * Este componente NÃO interfere no sistema de chat existente
 * Ele apenas adiciona funcionalidade automática baseada em petições
 */
interface PetitionChatIntegrationProps {
  petitionId?: string;
  petitionStatus?: string;
  onStatusChange?: (petitionId: string, newStatus: string, oldStatus: string) => void;
}

export default function PetitionChatIntegration({ 
  petitionId, 
  petitionStatus,
  onStatusChange 
}: PetitionChatIntegrationProps) {
  const { handlePetitionStatusChange } = usePetitionChat();

  // Monitorar mudanças de status quando prop petitionStatus muda
  useEffect(() => {
    if (petitionId && petitionStatus) {
      // Aqui você pode implementar lógica para detectar mudanças de status
      // Por exemplo, comparar com status anterior armazenado em estado
      console.log(`🔄 [PetitionChatIntegration] Petição ${petitionId} com status: ${petitionStatus}`);
      
      // Notificar o sistema pai sobre a mudança (se necessário)
      if (onStatusChange) {
        onStatusChange(petitionId, petitionStatus, 'unknown'); // oldStatus seria obtido do estado anterior
      }
    }
  }, [petitionId, petitionStatus, onStatusChange]);

  // Este componente não renderiza nada visualmente
  // Ele apenas monitora e executa ações automáticas
  return null;
}

/**
 * Hook utilitário para usar em componentes de petições
 * Facilita a integração com o sistema de chat automático
 */
export function usePetitionChatIntegration(petitionId: string) {
  const { handlePetitionStatusChange } = usePetitionChat();

  const handleStatusChange = (newStatus: string, oldStatus: string) => {
    console.log(`🔄 [usePetitionChatIntegration] Status mudou: ${oldStatus} → ${newStatus}`);
    handlePetitionStatusChange(petitionId, newStatus, oldStatus);
  };

  return {
    handleStatusChange
  };
}
