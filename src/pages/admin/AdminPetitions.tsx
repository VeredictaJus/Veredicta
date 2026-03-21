import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

import {
  FileText, Search, Clock, CheckCircle2, AlertCircle, XCircle, Eye, MessageSquare, UserCog,
} from 'lucide-react';

import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient'
import { WriterService } from '@/services/writerService';
import { DatabaseService } from '@/services/databaseService';
import { addBusinessDays, setDeadlineCutoff } from '@/utils/businessDays';

type PetitionStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled' | 'disputed' | 'approved';
type PetitionPriority = 'normal' | 'urgent' | 'express';

interface AdminPetition {
  id: string;
  title: string;
  type: string;
  client_name: string;
  assigned_writer_id?: string | null;
  writer_name?: string | null;
  status: PetitionStatus;
  priority: PetitionPriority;
  price: number;
  created_at: string | null;
  deadline: string | null;
  deadline_paused_at?: string | null;
  deadline_remaining_seconds?: number | null;
  deadline_pause_reason?: string | null;
  status_before_pause?: string | null;
  completed_at?: string | null;
  description: string | null;
  admin_notes?: string | null;
  dispute_reason?: string | null;
  _raw?: any;
}

const statusConfig: Record<PetitionStatus, { label: string; color: string; icon: any }> = {
  pending:     { label: 'Pendente',       color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_progress: { label: 'Em Andamento',   color: 'bg-blue-100 text-blue-800',    icon: FileText },
  review:      { label: 'Em Revisão',      color: 'bg-purple-100 text-purple-800', icon: AlertCircle },
  approved:    { label: 'Aprovada',        color: 'bg-green-100 text-green-800',   icon: CheckCircle2 },
  completed:   { label: 'Concluída',       color: 'bg-green-100 text-green-800',   icon: CheckCircle2 },
  cancelled:   { label: 'Cancelada',       color: 'bg-gray-100 text-gray-800',     icon: XCircle },
  disputed:    { label: 'Disputada',       color: 'bg-red-100 text-red-800',       icon: AlertCircle },
};

const priorityConfig: Record<PetitionPriority, { label: string; color: string }> = {
  normal:  { label: 'Normal',  color: 'bg-gray-100 text-gray-800' },
  urgent:  { label: 'Urgente', color: 'bg-orange-100 text-orange-800' },
  express: { label: 'Express', color: 'bg-red-100 text-red-800' },
};

function mapRow(p: any): AdminPetition {
  const statusRaw = String(p.status ?? '').toLowerCase();
  const hasWriter = !!(p.assigned_writer_id || p.writer_name || p.redator);
  
  // Mapear status considerando o estado real da petição
  let status: PetitionStatus;
  
  if (statusRaw === 'approved') {
    status = 'approved';
  } else if (statusRaw === 'pending') {
    status = 'pending';
  } else if (statusRaw === 'revision' || statusRaw === 'pending_review' || statusRaw === 'review') {
    status = 'review';
  } else if (statusRaw === 'completed') {
    status = 'completed';
  } else if (statusRaw === 'cancelled') {
    status = 'cancelled';
  } else if (statusRaw === 'disputed') {
    status = 'disputed';
  } else if (statusRaw === 'in_progress' || statusRaw === 'assigned' || statusRaw === 'delivered') {
    status = 'in_progress';
  } else {
    // Se não tem redator atribuído, é "pendente" (sem atribuição)
    // Se tem redator, pode ser "in_progress" ou outro status
    status = hasWriter ? 'in_progress' : 'pending';
  }

  const prioRaw = String(p.priority ?? p.prioridade ?? '').toLowerCase();
  const priority: PetitionPriority =
    prioRaw === 'urgent' ? 'urgent' :
    prioRaw === 'express' ? 'express' : 'normal';

  return {
    id: String(p.id),
    title: p.title ?? 'Petição sem título',
    type: p.type ?? p.tipo ?? 'Diversos',
    client_name: p.client_name ?? p.cliente ?? 'Cliente',
    assigned_writer_id: p.assigned_writer_id ?? null,
    writer_name: p.writer_name ?? p.redator ?? null,
    status,
    priority,
    price: Number(p.price ?? p.valor ?? 0),
    created_at: p.created_at ?? null,
    deadline: p.deadline ?? p.prazo ?? null,
    deadline_paused_at: p.deadline_paused_at ?? null,
    deadline_remaining_seconds: p.deadline_remaining_seconds ?? null,
    deadline_pause_reason: p.deadline_pause_reason ?? null,
    status_before_pause: p.status_before_pause ?? null,
    completed_at: p.completed_at ?? p.data_conclusao ?? null,
    description: p.description ?? p.descricao ?? null,
    admin_notes: null, // Coluna não existe no banco
    dispute_reason: null, // Coluna não existe no banco
    _raw: p,
  };
}

export default function AdminPetitions() {
  const navigate = useNavigate();
  const [petitions, setPetitions] = useState<AdminPetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Função auxiliar para truncar nomes muito longos (> 50 caracteres)
  const truncateLongName = (name: string | undefined | null): string => {
    if (!name) return '';
    if (name.length > 50) {
      return name.substring(0, 47) + '...';
    }
    return name;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PetitionStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PetitionPriority>('all');

  const [selectedPetition, setSelectedPetition] = useState<AdminPetition | null>(null);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [reassignPetition, setReassignPetition] = useState<AdminPetition | null>(null);
  const [availableWriters, setAvailableWriters] = useState<Array<{ firebase_uid: string; full_name: string; email: string }>>([]);
  const [selectedWriterId, setSelectedWriterId] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);

  const loadPetitions = async (showLoading: boolean = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const { data, error } = await supabase
        .from('petitions')
        .select('id, title, type, client_name, assigned_writer_id, writer_name, status, priority, price, created_at, deadline, description, deadline_paused_at, deadline_remaining_seconds, deadline_pause_reason, status_before_pause')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      const mapped = (data ?? []).map(mapRow);
      
      // ✅ OTIMIZAÇÃO: Console.logs apenas em desenvolvimento
      if (import.meta.env.DEV) {
        // Log dos status das petições para debug
        const statusCounts = mapped.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        // Verificar se há petições com status "approved" que não foram mapeadas corretamente
        const rawStatusCounts = (data ?? []).reduce((acc: Record<string, number>, p: any) => {
          const rawStatus = String(p.status ?? '').toLowerCase();
          acc[rawStatus] = (acc[rawStatus] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        if (import.meta.env.DEV) {
          console.log('✅ [ADMIN PETITIONS] Petições carregadas:', {
            total: mapped.length,
            statusCounts: statusCounts,
            rawStatusCounts: rawStatusCounts,
            hasApproved: rawStatusCounts['approved'] > 0
          });
          
          // Se houver status "approved" no banco mas não mapeado, logar aviso
          if (rawStatusCounts['approved'] > 0 && !statusCounts['approved']) {
            console.warn('⚠️ [ADMIN PETITIONS] Petições com status "approved" encontradas mas não mapeadas corretamente!');
          }
        }
      }
      
      setPetitions(mapped);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar petições');
      console.error('❌ [ADMIN PETITIONS] Erro ao carregar:', e);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Carregar petições inicialmente
    loadPetitions();

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    // Função para criar/ativar subscription
    const activateSubscription = () => {
      if (channel) {
        // Se já existe, não criar novamente
        return;
      }

      // Configurar subscription para atualização em tempo real
      channel = supabase
        .channel('admin-petitions-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Escutar INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'petitions'
          },
          (payload: any) => {
            const newData = payload.new as any;
            const oldData = payload.old as any;
            const statusChanged = newData?.status !== oldData?.status;
            
            // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
            if (import.meta.env.DEV) {
              console.log('🔄 [ADMIN PETITIONS] Mudança detectada:', {
                eventType: payload.eventType,
                table: payload.table,
                id: newData?.id || oldData?.id,
                statusChanged: statusChanged,
                oldStatus: oldData?.status,
                newStatus: newData?.status
              });
            }
            
            // Se for uma atualização de status, atualizar imediatamente no estado local
            if (payload.eventType === 'UPDATE' && newData?.id) {
              try {
                // Buscar a petição completa do banco para garantir que temos todos os dados
                // Mas primeiro atualizar com os dados do payload para feedback imediato
                const updatedPetition = mapRow(payload.new);
                const oldPetition = payload.old ? mapRow(payload.old) : null;
                
                setPetitions(prev => {
                  const currentPetition = prev.find(p => p.id === updatedPetition.id);
                  const updated = prev.map(p => 
                    p.id === updatedPetition.id ? updatedPetition : p
                  );
                  
                  // Se o status mudou, mostrar toast
                  if (statusChanged && oldPetition && currentPetition) {
                    const oldStatusLabel = statusConfig[oldPetition.status]?.label || oldPetition.status;
                    const newStatusLabel = statusConfig[updatedPetition.status]?.label || updatedPetition.status;
                    toast.success(`Status atualizado: ${oldStatusLabel} → ${newStatusLabel}`, {
                      description: `Petição: ${updatedPetition.title}`
                    });
                  }
                  
                  return updated;
                });
                
                // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
                if (import.meta.env.DEV) {
                  console.log('✅ [ADMIN PETITIONS] Status atualizado localmente:', {
                    id: updatedPetition.id,
                    oldStatus: oldPetition?.status,
                    newStatus: updatedPetition.status,
                    title: updatedPetition.title
                  });
                }
              } catch (error) {
                console.error('❌ [ADMIN PETITIONS] Erro ao atualizar petição localmente:', error);
              }
            }
            
            // ✅ OTIMIZAÇÃO: Removido loadPetitions() para evitar "piscar"
            // A atualização local já é suficiente, e o polling de 10s garante sincronização periódica
            // Isso evita re-renders desnecessários que causam o efeito de "piscar" na tela
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error('❌ [ADMIN PETITIONS] Erro na subscription:', err);
          } else if (status === 'SUBSCRIBED') {
            // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
            if (import.meta.env.DEV) {
              console.log('✅ [ADMIN PETITIONS] Subscription ativa - atualizações em tempo real habilitadas');
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            // ✅ OTIMIZAÇÃO: Console.warn apenas em desenvolvimento
            if (import.meta.env.DEV) {
              console.warn('⚠️ [ADMIN PETITIONS] Realtime não disponível, usando polling como fallback');
            }
          }
        });
    };

    // Função para desativar subscription
    const deactivateSubscription = () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
        if (import.meta.env.DEV) {
          console.log('⏸️ [ADMIN PETITIONS] Subscription pausada (aba não visível)');
        }
      }
    };

    // ✅ OTIMIZAÇÃO: Gerenciar subscription baseado na visibilidade da aba
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Aba não está visível - pausar subscription para economizar recursos
        deactivateSubscription();
      } else {
        // Aba voltou a ficar visível - reativar subscription
        activateSubscription();
        // Recarregar dados ao voltar para garantir sincronização (sem mostrar loading)
        loadPetitions(false);
      }
    };

    // Ativar subscription inicialmente (se a aba estiver visível)
    if (!document.hidden) {
      activateSubscription();
    }

    // Escutar mudanças de visibilidade da aba
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Polling como fallback (a cada 10 segundos) caso o realtime não funcione
    // Isso garante que mesmo sem realtime, os dados sejam atualizados
    pollInterval = setInterval(() => {
      // Só fazer polling se a aba estiver visível
      if (!document.hidden) {
        // ✅ OTIMIZAÇÃO: Polling silencioso (sem mostrar loading) para não interromper o usuário
        loadPetitions(false);
      }
    }, 10000); // 10 segundos é um bom equilíbrio entre atualização e performance

    // Cleanup: remover subscription e polling quando componente desmontar
    return () => {
      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log('🔌 [ADMIN PETITIONS] Removendo subscription e polling');
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return petitions.filter(p => {
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.client_name.toLowerCase().includes(term) ||
        (p.writer_name ? p.writer_name.toLowerCase().includes(term) : false);

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesPrio   = priorityFilter === 'all' || p.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPrio;
    });
  }, [petitions, searchTerm, statusFilter, priorityFilter]);

  const stats = useMemo(() => ({
    total: petitions.length,
    pending: petitions.filter(p => p.status === 'pending').length, // Sem atribuição (já mapeado corretamente no mapRow)
    review: petitions.filter(p => p.status === 'review').length, // Em revisão
    approved: petitions.filter(p => p.status === 'approved').length, // Aprovada
    in_progress: petitions.filter(p => p.status === 'in_progress').length, // Em andamento (já mapeado corretamente no mapRow)
  }), [petitions]);

  const updateStatus = async (petitionId: string, newStatus: PetitionStatus) => {
    try {
      const currentPetition = petitions.find(p => p.id === petitionId);
      if (!currentPetition) {
        throw new Error('Petição não encontrada para atualizar status');
      }

      const hasWriterAssigned = !!currentPetition.assigned_writer_id;
      const isPauseTransition = newStatus === 'pending' && hasWriterAssigned;
      const isResumeTransition = currentPetition.status === 'pending' && newStatus === 'in_progress' && hasWriterAssigned;

      const updatePayload: Record<string, any> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (isPauseTransition) {
        const reason = window.prompt(
          'Motivo da pausa (obrigatório):\n\nEx.: Cliente não enviou documentos e não responde no chat.'
        );

        if (!reason || !reason.trim()) {
          toast.error('Informe o motivo da pausa para congelar o prazo.');
          return;
        }

        const currentDeadline = currentPetition.deadline ? new Date(currentPetition.deadline).getTime() : null;
        const now = Date.now();
        const remainingSeconds =
          currentDeadline !== null
            ? Math.max(0, Math.floor((currentDeadline - now) / 1000))
            : null;

        updatePayload.deadline_paused_at = new Date().toISOString();
        updatePayload.deadline_remaining_seconds = remainingSeconds;
        updatePayload.deadline_pause_reason = reason.trim();
        updatePayload.status_before_pause =
          currentPetition.status && currentPetition.status !== 'pending'
            ? currentPetition.status
            : 'in_progress';
      }

      if (isResumeTransition) {
        if (typeof currentPetition.deadline_remaining_seconds === 'number') {
          const resumedDeadline = new Date(
            Date.now() + Math.max(0, currentPetition.deadline_remaining_seconds) * 1000
          );
          updatePayload.deadline = resumedDeadline.toISOString();
        }

        updatePayload.deadline_paused_at = null;
        updatePayload.deadline_remaining_seconds = null;
        updatePayload.deadline_pause_reason = null;
        updatePayload.status_before_pause = null;
      }

      const { data: updatedRow, error } = await supabase
        .from('petitions')
        .update(updatePayload)
        .eq('id', petitionId)
        .select('id, title, type, client_name, assigned_writer_id, writer_name, status, priority, price, created_at, deadline, description, deadline_paused_at, deadline_remaining_seconds, deadline_pause_reason, status_before_pause')
        .single();

      if (error) throw error;

      // Atualizar estado local imediatamente para feedback visual rápido
      if (updatedRow) {
        const mappedUpdated = mapRow(updatedRow);
        setPetitions(prev => prev.map(p => (p.id === petitionId ? mappedUpdated : p)));
      } else {
        setPetitions(prev => prev.map(p => (p.id === petitionId ? { ...p, status: newStatus } : p)));
      }
      
      // Recarregar do banco após um pequeno delay para garantir sincronização
      setTimeout(() => {
        loadPetitions();
      }, 500);
      
      if (isPauseTransition) {
        toast.success('Prazo congelado com sucesso (pendência do cliente).');
      } else if (isResumeTransition) {
        toast.success('Prazo retomado com sucesso.');
      } else {
        toast.success(`Status atualizado para ${statusConfig[newStatus].label}`);
      }
    } catch (e: any) {
      toast.error(`Erro ao atualizar status: ${e.message || e}`);
      // Em caso de erro, recarregar do banco para garantir consistência
      loadPetitions();
    }
  };

  const openChat = (petition: AdminPetition) => {
    const qs = new URLSearchParams({
      petitionId: petition.id,
      userId: petition.writer_name ? `writer-${petition.id}` : `client-${petition.id}`,
      type: petition.writer_name ? 'writer' : 'client',
    });
    navigate(`/admin/chat-suporte?${qs.toString()}`, {
      state: {
        petitionId: petition.id,
        petitionTitle: petition.title,
        clientName: petition.client_name,
        writerName: petition.writer_name,
        autoOpen: true,
      },
    });
    toast.success(`Abrindo chat para: ${petition.title}`);
  };

  const loadAvailableWriters = async () => {
    try {
      const writers = await WriterService.getActiveWriters();
      setAvailableWriters(writers.map(w => ({
        firebase_uid: w.firebase_uid,
        full_name: w.full_name || w.email?.split('@')[0] || 'Redator',
        email: w.email || '',
      })));
    } catch (error) {
      console.error('Erro ao carregar redatores:', error);
      toast.error('Erro ao carregar lista de redatores');
    }
  };

  const handleOpenReassignDialog = async (petition: AdminPetition) => {
    setReassignPetition(petition);
    setSelectedWriterId('');
    setShowReassignDialog(true);
    await loadAvailableWriters();
  };

  const handleReassignPetition = async () => {
    if (!reassignPetition || !selectedWriterId) {
      toast.error('Selecione um redator para reatribuir a petição');
      return;
    }

    setReassigning(true);
    try {
      // Buscar informações do novo redator
      const newWriter = availableWriters.find(w => w.firebase_uid === selectedWriterId);
      if (!newWriter) {
        throw new Error('Redator não encontrado');
      }

      // Buscar informações da petição atual
      const { data: currentPetition } = await supabase
        .from('petitions')
        .select('assigned_writer_id, writer_name, title, display_id')
        .eq('id', reassignPetition.id)
        .single();

      const oldWriterId = currentPetition?.assigned_writer_id;
      const oldWriterName = currentPetition?.writer_name;

      // Identificar se é atribuição inicial ou reatribuição
      const isReassignment = oldWriterId && oldWriterId !== selectedWriterId;
      const isInitialAssignment = !oldWriterId;

      // Calcular novo prazo: adicionar 1 dia útil a partir de hoje (limite 18h)
      // SEMPRE recalcular o prazo quando atribuir/reatribuir (não usar o prazo anterior)
      let newDeadline: string | null = null;
      try {
        const today = new Date();
        const extendedDate = setDeadlineCutoff(addBusinessDays(today, 1));
        newDeadline = extendedDate.toISOString();
        // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
        if (import.meta.env.DEV) {
          console.log(`📅 ${isReassignment ? 'Reatribuição' : 'Atribuição'}: Novo prazo calculado = ${newDeadline}`);
          console.log(`📅 Data formatada: ${extendedDate.toLocaleDateString('pt-BR')} às ${extendedDate.toLocaleTimeString('pt-BR')}`);
          console.log(`📅 Prazo anterior: ${reassignPetition.deadline || 'N/A'}`);
          console.log(`📅 Hoje: ${today.toLocaleDateString('pt-BR')} - Novo prazo: ${extendedDate.toLocaleDateString('pt-BR')}`);
        }
      } catch (deadlineError) {
        console.error('❌ Erro ao calcular novo prazo:', deadlineError);
        // Se falhar, tentar calcular novamente com fallback
        try {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(18, 0, 0, 0);
          newDeadline = tomorrow.toISOString();
          // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
          if (import.meta.env.DEV) {
            console.log(`📅 Usando prazo de fallback: ${newDeadline}`);
          }
        } catch (fallbackError) {
          console.error('❌ Erro no fallback do prazo:', fallbackError);
          throw new Error('Não foi possível calcular o novo prazo');
        }
      }

      // Garantir que newDeadline não seja null
      if (!newDeadline) {
        throw new Error('Erro: novo prazo não foi calculado');
      }

      // Atualizar a petição com o novo redator e novo prazo
      // SEMPRE atualizar o prazo quando atribuir/reatribuir (marcar 1 dia útil a mais)
      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log(`💾 Atualizando petição ${reassignPetition.id}`);
        console.log(`   Prazo anterior: ${reassignPetition.deadline || 'N/A'}`);
        console.log(`   Novo prazo: ${newDeadline}`);
      }
      
      // Fazer update completo incluindo o deadline
      // IMPORTANTE: Fazer update do deadline separadamente primeiro para garantir que o trigger reconheça a mudança
      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log(`🔄 Passo 1: Atualizando apenas o deadline...`);
      }
      const { error: deadlineOnlyError } = await supabase
        .from('petitions')
        .update({
          deadline: newDeadline,
        })
        .eq('id', reassignPetition.id);
      
      if (deadlineOnlyError) {
        console.error('❌ Erro ao atualizar apenas deadline:', deadlineOnlyError);
        throw deadlineOnlyError;
      }
      
      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log(`🔄 Passo 2: Atualizando demais campos...`);
      }
      // Depois atualizar os outros campos
      const { error: updateError, data: updatedData } = await supabase
        .from('petitions')
        .update({
          assigned_writer_id: selectedWriterId,
          writer_name: newWriter.full_name,
          status: 'in_progress', // Resetar para em andamento
          deadline: newDeadline, // Garantir novamente o prazo correto
          updated_at: new Date().toISOString(),
        })
        .eq('id', reassignPetition.id)
        .select('id, deadline, updated_at, assigned_writer_id'); // Retornar campos para verificar

      if (updateError) {
        console.error('❌ Erro ao atualizar petição:', updateError);
        throw updateError;
      }
      
      // Verificar se o prazo foi atualizado corretamente
      if (updatedData && updatedData.length > 0) {
        // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
        if (import.meta.env.DEV) {
          console.log(`✅ Prazo atualizado no banco: ${updatedData[0].deadline}`);
          console.log(`✅ Data de atualização: ${updatedData[0].updated_at}`);
          
          // Verificar se o prazo foi realmente atualizado
          if (updatedData[0].deadline !== newDeadline) {
            console.warn('⚠️ ATENÇÃO: O prazo no banco não corresponde ao prazo calculado!');
            console.warn(`   Calculado: ${newDeadline}`);
            console.warn(`   No banco: ${updatedData[0].deadline}`);
          }
        }
      } else {
        // ✅ OTIMIZAÇÃO: Console.warn apenas em desenvolvimento
        if (import.meta.env.DEV) {
          console.warn('⚠️ Nenhum dado retornado após atualização');
        }
      }

      // Notificar o redator anterior (se houver e for diferente do novo)
      if (oldWriterId && oldWriterId !== selectedWriterId && oldWriterName) {
        try {
          await DatabaseService.createNotification({
            user_id: oldWriterId,
            title: '🔄 Petição Reatribuída',
            message: `A petição "${reassignPetition.title}" foi reatribuída para outro redator.`,
            type: 'petition_reassigned',
            priority: 'normal',
            is_read: false,
            related_entity_type: 'petition',
            related_entity_id: reassignPetition.id,
          });
        } catch (notifError) {
          console.error('Erro ao notificar redator anterior:', notifError);
          // Não falhar a reatribuição se a notificação falhar
        }
      }

      // Notificar o novo redator
      try {
        await DatabaseService.createNotification({
          user_id: selectedWriterId,
          title: '📋 Nova Petição Atribuída',
          message: `A petição "${reassignPetition.title}" foi atribuída a você.`,
          type: 'petition_assigned',
          priority: 'high',
          is_read: false,
          related_entity_type: 'petition',
          related_entity_id: reassignPetition.id,
        });
      } catch (notifError) {
        console.error('Erro ao notificar novo redator:', notifError);
        // Não falhar a reatribuição se a notificação falhar
      }

      // Atualizar a lista de petições para refletir o novo prazo
      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log('🔄 Recarregando lista de petições...');
      }
      await loadPetitions();
      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log('✅ Lista de petições recarregada');
      }

      toast.success(
        reassignPetition.writer_name 
          ? `Petição reatribuída para ${newWriter.full_name} com sucesso! Novo prazo: ${new Date(newDeadline).toLocaleDateString('pt-BR')}`
          : `Petição atribuída para ${newWriter.full_name} com sucesso! Novo prazo: ${new Date(newDeadline).toLocaleDateString('pt-BR')}`
      );
      setShowReassignDialog(false);
      setReassignPetition(null);
      setSelectedWriterId('');
    } catch (error: any) {
      console.error('Erro ao reatribuir petição:', error);
      toast.error(`Erro ao reatribuir petição: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setReassigning(false);
    }
  };

  const daysLeft = (deadline: string | null) => {
    if (!deadline) return '—';
    const d = new Date(deadline).getTime() - Date.now();
    return Math.ceil(d / (1000 * 60 * 60 * 24));
  };

  // Removido indicador de loading - carrega silenciosamente

  if (error) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center text-red-600 max-w-xl">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" />
          <p className="mb-3">Erro ao carregar petições:</p>
          <pre className="text-xs bg-red-50 p-3 rounded border border-red-200 overflow-auto">
            {error}
          </pre>
          <Button onClick={() => loadPetitions()} className="mt-4">Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* topo */}
      <div className="space-y-1 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Supervisar Petições</h2>
        <p className="text-sm text-muted-foreground">Acompanhe e gerencie todas as petições do sistema</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-amber-200/45 bg-gradient-to-br from-amber-50/45 to-orange-50/25 shadow-[0_8px_24px_-18px_rgba(245,158,11,0.22)] dark:border-border/60 dark:bg-card/80 dark:bg-none dark:shadow-sm supports-[backdrop-filter]:backdrop-blur-sm"><CardContent className="rounded-lg pt-6 flex items-center"><FileText className="w-12 h-12 text-blue-600 bg-blue-100 rounded-lg p-2" /><div className="ml-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center"><Clock className="w-12 h-12 text-yellow-600 bg-yellow-100 rounded-lg p-2" /><div className="ml-4"><p className="text-sm text-muted-foreground">Pendentes</p><p className="text-2xl font-bold">{stats.pending}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center"><AlertCircle className="w-12 h-12 text-purple-600 bg-purple-100 rounded-lg p-2" /><div className="ml-4"><p className="text-sm text-muted-foreground">Em Revisão</p><p className="text-2xl font-bold">{stats.review}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center"><CheckCircle2 className="w-12 h-12 text-green-600 bg-green-100 rounded-lg p-2" /><div className="ml-4"><p className="text-sm text-muted-foreground">Aprovadas</p><p className="text-2xl font-bold">{stats.approved}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center"><FileText className="w-12 h-12 text-blue-600 bg-blue-100 rounded-lg p-2" /><div className="ml-4"><p className="text-sm text-muted-foreground">Em Andamento</p><p className="text-2xl font-bold">{stats.in_progress}</p></div></CardContent></Card>
      </div>

      {/* Filtros e tabela */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar petições..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Andamento</SelectItem>
                <SelectItem value="review">Revisão</SelectItem>
                <SelectItem value="approved">Aprovada</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="disputed">Disputada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="express">Express</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Petição</TableHead>
                  <TableHead className="hidden md:table-cell">Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Redator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Prioridade</TableHead>
                  <TableHead className="hidden lg:table-cell">Valor</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const Icon = statusConfig[p.status].icon;
                  const d = daysLeft(p.deadline);
                  const isNumber = typeof d === 'number';
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-sm text-muted-foreground">{p.type}</div>
                        {/* Resumo mobile */}
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground md:hidden">
                          <div><span className="font-medium text-foreground/80">Cliente:</span> {p.client_name}</div>
                          <div>
                            <span className="font-medium text-foreground/80">Redator:</span>{' '}
                            {p.writer_name || 'Não atribuído'}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground/80">Prioridade:</span>
                            <Badge className={priorityConfig[p.priority].color}>
                              {priorityConfig[p.priority].label}
                            </Badge>
                          </div>
                          <div className="lg:hidden">
                            <span className="font-medium text-foreground/80">Valor:</span> R$ {Number(p.price || 0).toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{p.client_name}</TableCell>
                      <TableCell className="hidden md:table-cell">{p.writer_name || 'Não atribuído'}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig[p.status].color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {statusConfig[p.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge className={priorityConfig[p.priority].color}>
                          {priorityConfig[p.priority].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">R$ {Number(p.price || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        {p.deadline ? (
                          <span className={isNumber && (d as number) <= 2 ? 'text-red-600 font-medium' : ''}>
                            {new Date(p.deadline).toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                        {/* Reatribuir / Atribuir */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenReassignDialog(p)}
                          title={p.writer_name ? "Reatribuir petição" : "Atribuir petição"}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        
                        {/* Detalhes / Gerenciar */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPetition(p)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
                            <DialogHeader>
                              <DialogTitle>{selectedPetition?.title}</DialogTitle>
                              <DialogDescription>Detalhes e gerenciamento da petição</DialogDescription>
                            </DialogHeader>

                            {selectedPetition && selectedPetition.id === p.id && (
                              <div className="max-h-[calc(85vh-140px)] overflow-y-auto pr-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Cliente</label>
                                    <p className="text-sm text-muted-foreground">{selectedPetition.client_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Redator</label>
                                    <p className="text-sm text-muted-foreground">{selectedPetition.writer_name || 'Não atribuído'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Valor</label>
                                    <p className="text-sm text-muted-foreground">R$ {Number(selectedPetition.price || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Prazo</label>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedPetition.deadline ? new Date(selectedPetition.deadline).toLocaleDateString('pt-BR') : '—'}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Descrição</label>
                                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">
                                    {selectedPetition.description || '—'}
                                  </p>
                                </div>
                                {selectedPetition.dispute_reason && (
                                  <div className="p-3 bg-red-50 rounded-lg">
                                    <label className="text-sm font-medium text-red-800">Motivo da Disputa</label>
                                    <p className="text-sm text-red-700 mt-1">{selectedPetition.dispute_reason}</p>
                                  </div>
                                )}
                                {selectedPetition.status === 'pending' && selectedPetition.assigned_writer_id && (
                                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <label className="text-sm font-medium text-amber-900">Pausa por pendência do cliente</label>
                                    <p className="text-sm text-amber-800 mt-1">
                                      {selectedPetition.deadline_pause_reason || 'Motivo não informado.'}
                                    </p>
                                  </div>
                                )}

                                <div>
                                  <label className="text-sm font-medium mb-2 block">Alterar Status</label>
                                  <Select
                                    value={selectedPetition.status}
                                    onValueChange={(val: PetitionStatus) =>
                                      updateStatus(selectedPetition.id, val)
                                    }
                                  >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pendente</SelectItem>
                                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                                      <SelectItem value="review">Em Revisão</SelectItem>
                                      <SelectItem value="approved">Aprovada</SelectItem>
                                      <SelectItem value="completed">Concluída</SelectItem>
                                      <SelectItem value="cancelled">Cancelada</SelectItem>
                                      <SelectItem value="disputed">Disputada</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Chat */}
                        <Button variant="outline" size="sm" onClick={() => openChat(p)}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Reatribuição */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{reassignPetition?.writer_name ? 'Reatribuir Petição' : 'Atribuir Petição'}</DialogTitle>
            <DialogDescription>
              {reassignPetition?.writer_name 
                ? `Selecione um novo redator para a petição "${reassignPetition?.title}"`
                : `Selecione um redator para a petição "${reassignPetition?.title}"`
              }
            </DialogDescription>
          </DialogHeader>

          {reassignPetition && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Petição:</p>
                <p className="text-sm text-muted-foreground">{reassignPetition.title}</p>
                {reassignPetition.writer_name && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Redator atual: <span className="font-medium">{reassignPetition.writer_name}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {reassignPetition.writer_name ? 'Selecione o novo redator:' : 'Selecione o redator:'}
                </label>
                <Select value={selectedWriterId} onValueChange={setSelectedWriterId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um redator..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWriters.map((writer) => {
                      const writerName = truncateLongName(writer.full_name);
                      return (
                        <SelectItem key={writer.firebase_uid} value={writer.firebase_uid} title={writer.full_name}>
                          {writerName} {writer.email && `(${writer.email})`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReassignDialog(false);
                    setReassignPetition(null);
                    setSelectedWriterId('');
                  }}
                  disabled={reassigning}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReassignPetition}
                  disabled={!selectedWriterId || reassigning}
                >
                  {reassigning 
                    ? (reassignPetition?.writer_name ? 'Reatribuindo...' : 'Atribuindo...')
                    : (reassignPetition?.writer_name ? 'Confirmar Reatribuição' : 'Confirmar Atribuição')
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
