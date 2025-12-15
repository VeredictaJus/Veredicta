// RedactorApprovalPanel.tsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, FileText } from 'lucide-react';
import { useEmailApproval } from '../../hooks/useEmailApproval';
import { RedactorData } from '../../services/redactorApprovalService';

const ENABLE_PANEL = import.meta.env.VITE_REDACTOR_PANEL_ENABLED === 'true';

export const RedactorApprovalPanel: React.FC = () => {
  if (!ENABLE_PANEL) {
    return (
      <div className="p-6 text-center text-gray-500">
        Painel de aprovação desativado neste ambiente.
      </div>
    );
  }

  const [pendingRedactors, setPendingRedactors] = useState<RedactorData[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedRedactor, setSelectedRedactor] = useState<RedactorData | null>(null);

  const { processEmailApproval, checkPendingApprovals, isProcessing } = useEmailApproval();

  const loadData = async () => {
    await checkPendingApprovals();
    const res = await fetch('/api/redactors'); // Endpoint hipotético
    const data = await res.json();
    setPendingRedactors(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    const success = await processEmailApproval(id, 'approve');
    if (success) {
      alert('Redator aprovado com sucesso!');
      loadData();
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Digite o motivo da rejeição.');
      return;
    }

    const success = await processEmailApproval(id, 'reject', rejectionReason);
    if (success) {
      alert('Redator rejeitado.');
      setRejectionReason('');
      loadData();
    }
  };

  const RedactorCard: React.FC<{ redactor: RedactorData }> = ({ redactor }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <User className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">{redactor.name}</h3>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
              Pendente
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{redactor.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{redactor.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">OAB:</span>
              <span>{redactor.oab}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">Especialidade:</span>
              <span>{redactor.specialty}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{redactor.petitions?.length || 0} petições enviadas</span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Cadastrado em: {new Date(redactor.createdAt).toLocaleString('pt-BR')}
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          <button
            onClick={() => handleApprove(redactor.id)}
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Aprovar
          </button>

          <textarea
            placeholder="Motivo da rejeição..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            rows={2}
          />

          <button
            onClick={() => handleReject(redactor.id)}
            disabled={isProcessing || !rejectionReason.trim()}
            className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Painel de Aprovação de Redatores</h1>
      {pendingRedactors.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação pendente</h3>
          <p className="mt-1 text-sm text-gray-500">Todas as solicitações foram processadas.</p>
        </div>
      ) : (
        pendingRedactors.map(redactor => (
          <RedactorCard key={redactor.id} redactor={redactor} />
        ))
      )}
    </div>
  );
};
