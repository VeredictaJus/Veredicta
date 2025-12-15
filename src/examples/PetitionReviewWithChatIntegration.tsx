// src/examples/PetitionReviewWithChatIntegration.tsx
// EXEMPLO de como integrar o sistema de chat automático com PetitionReview

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usePetitionChat } from '@/hooks/usePetitionChat';

// Este é um EXEMPLO de como você pode integrar o sistema de chat automático
// com o componente PetitionReview existente, SEM MODIFICAR o original

interface PetitionForReview {
  id: string;
  title: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  // ... outros campos
}

export default function PetitionReviewWithChatIntegration() {
  const [petitions, setPetitions] = useState<PetitionForReview[]>([]);
  const [selectedPetition, setSelectedPetition] = useState<PetitionForReview | null>(null);
  
  // Hook para gerenciar chat automático de petições
  const { handlePetitionStatusChange } = usePetitionChat();

  // Função de aprovação com integração de chat automático
  const handleApprove = (petitionId: string, comments?: string) => {
    // 1. Atualizar status local
    setPetitions(prev => prev.map(p => 
      p.id === petitionId ? { ...p, status: 'approved' as const } : p
    ));
    
    // 2. Mostrar notificação
    toast.success('Petição aprovada e enviada ao cliente!');
    
    // 3. Fechar conversa automaticamente (NOVA FUNCIONALIDADE)
    handlePetitionStatusChange(petitionId, 'completed', 'in_progress');
    
    // 4. Fechar modal
    setSelectedPetition(null);
  };

  // Função de rejeição com integração de chat automático
  const handleReject = (petitionId: string, comments: string) => {
    if (!comments.trim()) {
      toast.error('É necessário informar o motivo da rejeição');
      return;
    }
    
    // 1. Atualizar status local
    setPetitions(prev => prev.map(p => 
      p.id === petitionId ? { ...p, status: 'rejected' as const } : p
    ));
    
    // 2. Mostrar notificação
    toast.error('Petição rejeitada. Redator foi notificado.');
    
    // 3. Manter conversa aberta para discussão (NOVA FUNCIONALIDADE)
    // handlePetitionStatusChange(petitionId, 'revision', 'in_progress');
    
    // 4. Fechar modal
    setSelectedPetition(null);
  };

  // Função de solicitar correção com integração de chat automático
  const handleRequestCorrection = (petitionId: string, comments: string) => {
    if (!comments.trim()) {
      toast.error('É necessário informar as correções solicitadas');
      return;
    }
    
    // 1. Atualizar status local
    setPetitions(prev => prev.map(p => 
      p.id === petitionId ? { ...p, status: 'revision' as const } : p
    ));
    
    // 2. Mostrar notificação
    toast.info('Correções solicitadas. Redator foi notificado.');
    
    // 3. Manter conversa aberta para discussão (NOVA FUNCIONALIDADE)
    handlePetitionStatusChange(petitionId, 'revision', 'in_progress');
    
    // 4. Fechar modal
    setSelectedPetition(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Revisão de Petições com Chat Automático</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">🔄 Sistema de Chat Automático Ativo</h3>
        <p className="text-blue-700 text-sm">
          • <strong>Aprovar:</strong> Fecha conversa automaticamente<br/>
          • <strong>Rejeitar:</strong> Mantém conversa aberta<br/>
          • <strong>Solicitar Correção:</strong> Mantém conversa aberta para discussão
        </p>
      </div>

      {/* Lista de petições */}
      <div className="space-y-4">
        {petitions.map(petition => (
          <div key={petition.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{petition.title}</h3>
                <p className="text-sm text-gray-600">Status: {petition.status}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApprove(petition.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => handleReject(petition.id, 'Motivo da rejeição')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Rejeitar
                </button>
                <button
                  onClick={() => handleRequestCorrection(petition.id, 'Correções solicitadas')}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  Solicitar Correção
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instruções de integração */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-3">📋 Como Integrar com Seu Sistema Existente:</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>1.</strong> Importe o hook: <code className="bg-gray-200 px-1 rounded">usePetitionChat</code></p>
          <p><strong>2.</strong> Chame <code className="bg-gray-200 px-1 rounded">handlePetitionStatusChange</code> nas suas funções de aprovação/rejeição</p>
          <p><strong>3.</strong> O sistema criará/fechará conversas automaticamente</p>
          <p><strong>4.</strong> Não modifique o sistema de chat existente</p>
        </div>
      </div>
    </div>
  );
}
