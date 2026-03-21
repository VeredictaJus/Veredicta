import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Search, MessageSquare, Clock, CheckCircle2, AlertCircle, XCircle, RotateCcw, Filter, X, Edit, Trash2, Star, Download, FileDown, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { ClientProfile } from '@/types';
import RatingModal from '@/components/ratings/RatingModal';
import { CalculatorExportService } from '@/services/calculatorExportService';
import { PetitionFileService } from '@/services/petitionFileService';
import { EmailService } from '@/services/emailService';
import { DatabaseService } from '@/services/databaseService';
import { UserSettingsService } from '@/services/userSettingsService';
import { addBusinessDays, setDeadlineCutoff } from '@/utils/businessDays';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { isClientProfileComplete } from '@/utils/profileCompletion';

const BUCKET = 'petitions_correction_writer';

// ✅ Forçar download (sem abrir aba) mesmo se o Content-Type do Storage vier errado
async function forceDownload(url: string, filename?: string) {
  if (!url) return;
  const downloadUrl = url.includes('?') ? `${url}&download=1` : `${url}?download=1`;

  try {
    const res = await fetch(downloadUrl, { credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'arquivo';
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback: deixa o navegador lidar (respeita Content-Disposition do download=1 quando disponível)
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || 'arquivo';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

const correctionStatusLabels: Record<string, string> = {
  pending: 'Aguardando revisão',
  in_progress: 'Em correção',
  completed: 'Concluída',
  cancelled: 'Devolvida'
};

interface Petition {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'in_progress' | 'revision' | 'completed' | 'rejected' | 'delivered' | 'approved' | 'pending_review';
  priority: 'normal' | 'urgent' | 'express';
  created_at: string;
  deadline: string;
  writer_name?: string;
  assigned_writer_id?: string;
  price: number;
  description: string;
  files: string[];
  correction_count?: number;
  correction_requested_at?: string;
  has_rating?: boolean;
  is_pilot?: boolean;
  deadline_paused_at?: string | null;
  deadline_remaining_seconds?: number | null;
  deadline_pause_reason?: string | null;
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800', icon: FileText },
  revision: { label: 'Em Revisão', color: 'bg-purple-100 text-purple-800', icon: AlertCircle },
  pending_review: { label: 'Aguardando Revisão', color: 'bg-blue-100 text-blue-800', icon: Clock },
  completed: { label: 'Concluída', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  approved: { label: 'Aprovada', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const priorityConfig = {
  normal: { label: 'Normal', color: 'bg-gray-100 text-gray-800' },
  urgent: { label: 'Urgente', color: 'bg-orange-100 text-orange-800' },
  express: { label: 'Express', color: 'bg-red-100 text-red-800' }
};

export default function MyPetitions() {
  const { user, loading } = useNewAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ Função auxiliar para truncar nomes muito longos (> 50 caracteres)
  const truncateLongName = (name: string | undefined | null): string => {
    if (!name) return '';
    if (name.length > 50) {
      return name.substring(0, 47) + '...';
    }
    return name;
  };
  
  // Declare ALL state and hooks before any early returns
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredPetitions, setFilteredPetitions] = useState<Petition[]>([]);
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedPetitionForCorrection, setSelectedPetitionForCorrection] = useState<string>('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [isLoadingPetitions, setIsLoadingPetitions] = useState(true);
  const [petitionToDelete, setPetitionToDelete] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedPetitionForRating, setSelectedPetitionForRating] = useState<Petition | null>(null);
  const [petitionFiles, setPetitionFiles] = useState<any[]>([]);
  const [calculation, setCalculation] = useState<any | null>(null);
  const [lastCorrection, setLastCorrection] = useState<{
    writer_observation?: string | null;
    notes?: string | null;
    status?: string | null;
    updated_at?: string | null;
  } | null>(null);
  const [petitionAdminNotes, setPetitionAdminNotes] = useState<string | null>(null);
  const [clientCorrectionNotes, setClientCorrectionNotes] = useState('');
  const [correctionFiles, setCorrectionFiles] = useState<File[]>([]);
  const [uploadedCorrectionFiles, setUploadedCorrectionFiles] = useState<any[]>([]);
  const [requestingHumanReview, setRequestingHumanReview] = useState(false);
  const [humanReviewStatus, setHumanReviewStatus] = useState<{
    allowed?: boolean;
    plan?: string;
    message?: string;
    used?: number;
    limit?: number;
  } | null>(null);
  const [currentPlanCode, setCurrentPlanCode] = useState<string | null>(null);
  const [finishingConcierge, setFinishingConcierge] = useState(false);
  const [showFinishConciergeDialog, setShowFinishConciergeDialog] = useState(false);

  // Buscar arquivos e cálculo quando selecionar petição
  useEffect(() => {
    async function loadPetitionData() {
      if (!selectedPetition?.id) {
        setPetitionFiles([]);
        setCalculation(null);
        setLastCorrection(null);
        setPetitionAdminNotes(null);
        setClientCorrectionNotes('');
        setCorrectionFiles([]);
        setUploadedCorrectionFiles([]);
        setRequestingHumanReview(false);
        setHumanReviewStatus(null);
        return;
      }

      try {
        // Buscar arquivos originais (não de correção)
        const { data: filesData, error: filesError } = await supabase
          .from('petition_files')
          .select('id, petition_id, file_url, file_name, file_size, file_type, uploaded_by, created_at, updated_at')
          .eq('petition_id', selectedPetition.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (filesError) {
          console.error('Erro ao buscar arquivos:', filesError);
          setPetitionFiles([]);
        } else {
          // Separar arquivos originais dos arquivos de correção
          // Arquivos de correção são aqueles enviados pelo cliente após a petição estar entregue
          // Arquivos enviados pelo redator devem aparecer na lista principal
          const allFiles = filesData || [];
          const correctionRequestDate = selectedPetition.correction_requested_at;
          
          if (correctionRequestDate) {
            const correctionDate = new Date(correctionRequestDate);
            // Arquivos originais: antes da correção OU enviados pelo redator (não pelo cliente)
            const originalFiles = allFiles.filter((file: any) => {
              const fileDate = new Date(file.created_at);
              const isBeforeCorrection = fileDate < correctionDate;
              const isFromWriter = file.uploaded_by !== user?.uid; // Arquivos não enviados pelo cliente
              return isBeforeCorrection || isFromWriter;
            });
            
            // Arquivos de correção: após a correção E enviados pelo cliente
            const correctionFiles = allFiles.filter((file: any) => {
              const fileDate = new Date(file.created_at);
              return fileDate >= correctionDate && file.uploaded_by === user?.uid;
            });
            
            setPetitionFiles(originalFiles);
            setUploadedCorrectionFiles(correctionFiles);
          } else {
            // Sem correção solicitada: mostrar todos os arquivos
            setPetitionFiles(allFiles);
            setUploadedCorrectionFiles([]);
          }
        }

        // Buscar petição completa para pegar calculation_id
        const { data: petitionData, error: petitionError } = await supabase
          .from('petitions')
          .select('calculation_id')
          .eq('id', selectedPetition.id)
          .single();
        
        if (petitionError) {
          console.error('Erro ao buscar dados da petição:', petitionError);
        }
        
        // As observações do admin vêm das correções, não da tabela petitions
        // Já foram buscadas acima na seção de correções
        setPetitionAdminNotes(null);

        // Buscar cálculo se existir
        if (petitionData?.calculation_id) {
          const { data: calcData, error: calcError } = await supabase
            .from('labor_calculations')
            .select('id, user_id, title, description, calculation_data, calculation_result, tags, is_favorite, created_at, updated_at')
            .eq('id', petitionData.calculation_id)
            .single();

          if (calcError) {
            console.error('Erro ao buscar cálculo:', calcError);
            setCalculation(null);
          } else {
            setCalculation(calcData);
          }
        } else {
          setCalculation(null);
        }

        // Buscar todas as correções com observações
        const { data: allCorrections, error: correctionsError } = await supabase
          .from('corrections')
          .select('writer_observation, notes, status, updated_at, mode')
          .eq('petition_id', selectedPetition.id)
          .order('updated_at', { ascending: false });

        if (correctionsError) {
          console.error('Erro ao buscar correções:', correctionsError);
          setLastCorrection(null);
        } else {
          // Buscar observações do admin (notes) da correção mais recente
          const adminCorrection = (allCorrections || []).find(corr => 
            corr.notes && corr.notes.trim()
          );
          
          // Buscar observações do redator (writer_observation) da correção mais recente que tenha
          const writerCorrection = (allCorrections || []).find(corr => 
            corr.writer_observation && corr.writer_observation.trim()
          );
          
          // Combinar observações: usar a correção mais recente que tenha qualquer observação
          // Mas garantir que temos tanto notes quanto writer_observation se existirem
          const correctionWithNotes = allCorrections?.[0] || null;
          
          if (correctionWithNotes) {
            // Se encontramos observações separadas, combiná-las
            if (adminCorrection && adminCorrection.notes) {
              correctionWithNotes.notes = adminCorrection.notes;
            }
            if (writerCorrection && writerCorrection.writer_observation) {
              correctionWithNotes.writer_observation = writerCorrection.writer_observation;
            }
          }
          
          setLastCorrection(correctionWithNotes);
          
          if (correctionWithNotes) {
            // Observações carregadas (sem log de debug)
            // Dados carregados: correctionWithNotes.notes, correctionWithNotes.writer_observation, etc.
          } else {
            // Nenhuma correção com observações encontrada para esta petição
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados da petição:', err);
        setPetitionFiles([]);
        setCalculation(null);
        setLastCorrection(null);
      }
    }

    loadPetitionData();
  }, [selectedPetition?.id]);

  // Filter petitions based on search and status
  const applyFilters = useCallback(() => {
    let filtered = petitions;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        // Incluir completed, delivered e approved quando filtrar por "Concluída"
        filtered = filtered.filter(petition => 
          petition.status === 'completed' || 
          petition.status === 'delivered' || 
          petition.status === 'approved'
        );
      } else if (statusFilter === 'awaiting_complement') {
        // Petição pausada aguardando complemento do cliente
        filtered = filtered.filter(petition => petition.status === 'pending' && !!petition.assigned_writer_id);
      } else if (statusFilter === 'pending') {
        // Pendente "normal": ainda sem redator
        filtered = filtered.filter(petition => petition.status === 'pending' && !petition.assigned_writer_id);
      } else {
        filtered = filtered.filter(petition => petition.status === statusFilter);
      }
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(petition => 
        petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        petition.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPetitions(filtered);
  }, [petitions, statusFilter, searchTerm]);

  // Load petitions from Supabase
  useEffect(() => {
    if (!user?.uid) return;

    async function loadPetitions() {
      try {
        setIsLoadingPetitions(true);
        
        // ✅ CORREÇÃO: Usar DatabaseService que tem fallback para RPC quando RLS bloqueia
        let petitionsData: any[] = [];
        
        try {
          // ✅ CORREÇÃO: Primeira tentativa - usar query simples sem campos que podem não existir
          // Buscar apenas campos básicos que definitivamente existem na tabela
          const { data, error } = await supabase
            .from('petitions')
            .select('*') // Usar * para pegar todos os campos disponíveis
            .eq('client_id', user.uid)
            .order('created_at', { ascending: false })
            .limit(500);

          if (error) {
            // Log detalhado do erro para debug
            console.warn('⚠️ Query direta falhou:', {
              error,
              code: (error as any).code,
              message: error.message,
              details: (error as any).details,
              hint: (error as any).hint
            });
            
            // Se erro de permissão (RLS), usar DatabaseService que tem fallback RPC
            if ((error as any).code === '42501' || error.message?.includes('permission') || error.message?.includes('RLS')) {
              console.log('🔧 Erro de RLS detectado, usando DatabaseService com fallback RPC');
              petitionsData = await DatabaseService.getClientPetitions(user.uid);
            } else {
              // Para outros erros, também tentar DatabaseService
              console.log('🔧 Tentando DatabaseService como fallback');
              petitionsData = await DatabaseService.getClientPetitions(user.uid);
            }
          } else if (data) {
            petitionsData = data;
          }
        } catch (queryError: any) {
          console.warn('⚠️ Erro na query direta, usando DatabaseService como fallback:', queryError);
          // Fallback: usar DatabaseService que tem suporte a RPC
          try {
            petitionsData = await DatabaseService.getClientPetitions(user.uid);
          } catch (serviceError) {
            console.error('❌ Erro também no DatabaseService:', serviceError);
            // Última tentativa: usar RPC diretamente (tentar com TEXT primeiro, depois UUID)
            try {
              // Tentar com TEXT (Firebase UID é string)
              let rpcData: any = null;
              let rpcError: any = null;
              
              try {
                const result = await supabase.rpc('get_client_petitions', {
                  p_client_id: user.uid
                });
                rpcData = result.data;
                rpcError = result.error;
              } catch (e) {
                // Se falhar, tentar converter para UUID (caso a função espere UUID)
                console.warn('⚠️ Tentativa 1 falhou, tentando com UUID:', e);
                // Não há conversão direta, mas podemos tentar uma query simples
              }
              
              if (rpcError) {
                console.error('❌ Erro no RPC get_client_petitions:', rpcError);
                // Tentar query simples como último recurso
                const { data: simpleData, error: simpleError } = await supabase
                  .from('petitions')
                  .select('*')
                  .eq('client_id', user.uid)
                  .limit(100);
                
                if (simpleError) {
                  throw simpleError;
                }
                petitionsData = simpleData || [];
              } else {
                petitionsData = (rpcData as any[]) || [];
              }
            } catch (rpcError) {
              console.error('❌ Erro final ao carregar petições:', rpcError);
              toast.error('Erro ao carregar petições. Verifique suas permissões.');
              return;
            }
          }
        }

        if (petitionsData && petitionsData.length > 0) {
          // Buscar nomes dos redatores separadamente
          const writerIds = petitionsData
            .map((p: any) => p.writer_id || p.assigned_writer_id)
            .filter((id: any) => id);
          
          let writerMap: Record<string, string> = {};
          
          if (writerIds.length > 0) {
            const { data: writers } = await supabase
              .from('profiles_v2')
              .select('firebase_uid, full_name, email')
              .in('firebase_uid', writerIds);
            
            if (writers) {
              writerMap = writers.reduce((acc: any, w: any) => {
                acc[w.firebase_uid] = w.full_name || w.email || 'Redator';
                return acc;
              }, {});
            }
          }
          
          // Transformar dados do Supabase para o formato esperado
          const transformedPetitions: Petition[] = petitionsData.map((petition: any) => {
            const writerId = petition.writer_id || petition.assigned_writer_id;
            
            return {
              id: petition.id,
              title: petition.title || 'Sem título',
              type: petition.type || 'Não especificado',
              status: petition.status || 'pending',
              priority: petition.priority || 'normal',
              created_at: petition.created_at,
              deadline: petition.deadline || petition.created_at,
              writer_name: writerId ? (writerMap[writerId] || 'Não atribuído') : 'Não atribuído',
              assigned_writer_id: writerId,
              price: petition.price || 0,
              description: petition.description || '',
              files: petition.files || [],
              correction_count: petition.correction_count || 0,
              correction_requested_at: petition.correction_requested_at,
              has_rating: petition.has_rating || false,
              is_pilot: Boolean(petition.is_pilot),
              deadline_paused_at: petition.deadline_paused_at || null,
              deadline_remaining_seconds: typeof petition.deadline_remaining_seconds === 'number' ? petition.deadline_remaining_seconds : null,
              deadline_pause_reason: petition.deadline_pause_reason || null
            };
          });
          
          setPetitions(transformedPetitions);
        } else {
          // Nenhuma petição encontrada - isso é normal se o cliente ainda não criou petições
          setPetitions([]);
        }
      } catch (error: any) {
        console.error('❌ Erro geral ao carregar petições:', error);
        toast.error(error.message || 'Erro ao carregar petições');
        setPetitions([]);
      } finally {
        setIsLoadingPetitions(false);
      }
    }

    loadPetitions();

    let channel: ReturnType<typeof supabase.channel> | null = null;

    // Função para criar/ativar subscription
    const activateSubscription = () => {
      if (channel) {
        return; // Já existe
      }

      // Subscribe to real-time updates
      channel = supabase
        .channel('client-petitions-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'petitions',
          filter: `client_id=eq.${user.uid}`
        }, (payload) => {
          const newRow = payload.new as any;
          const oldRow = payload.old as any;
          
          const petitionId = (newRow && 'id' in newRow ? newRow.id : null) || (oldRow && 'id' in oldRow ? oldRow.id : null);
          
          // Se o status mudou, logar especificamente
          if (payload.eventType === 'UPDATE' && newRow && oldRow) {
            const oldStatus = oldRow.status;
            const newStatus = newRow.status;
            if (oldStatus !== newStatus) {
              // Status da petição mudou (sem log)
            }
          }
          
          // Recarregar petições quando houver mudanças
          loadPetitions();
        })
        .subscribe();
    };

    // Função para desativar subscription
    const deactivateSubscription = () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };

    // ✅ OTIMIZAÇÃO: Gerenciar subscription baseado na visibilidade da aba
    const handleVisibilityChange = () => {
      if (document.hidden) {
        deactivateSubscription();
      } else {
        activateSubscription();
        loadPetitions(); // Recarregar ao voltar
      }
    };

    // Ativar subscription inicialmente (se a aba estiver visível)
    if (!document.hidden) {
      activateSubscription();
    }

    // Escutar mudanças de visibilidade da aba
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setCurrentPlanCode(null);
      return;
    }

    let alive = true;
    (async () => {
      try {
        const plan = await UserSettingsService.getUserCurrentPlan(user.uid);
        if (!alive) return;
        setCurrentPlanCode(String(plan?.plan_code || '').toLowerCase() || null);
      } catch {
        if (!alive) return;
        setCurrentPlanCode(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user?.uid]);

  const isConcierge = (currentPlanCode || '').toLowerCase() === 'concierge';

  // Abrir petição automaticamente se houver parâmetro na URL
  useEffect(() => {
    const petitionId = searchParams.get('petition');
    if (petitionId && petitions.length > 0) {
      const petition = petitions.find(p => p.id === petitionId);
      if (petition && !selectedPetition) {
        setSelectedPetition(petition);
        // Limpar parâmetro da URL após abrir
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('petition');
        navigate(`/client/petitions?${newSearchParams.toString()}`, { replace: true });
      }
    }
  }, [searchParams, petitions, selectedPetition, navigate]);

  // Atualizar selectedPetition quando a petição correspondente for atualizada na lista
  useEffect(() => {
    if (selectedPetition?.id) {
      const updatedPetition = petitions.find(p => p.id === selectedPetition.id);
      if (updatedPetition && updatedPetition.status !== selectedPetition.status) {
        setSelectedPetition(updatedPetition);
      }
    }
  }, [petitions, selectedPetition?.id]);

  // Apply filters when search term or status filter changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Função para excluir petição
  const handleDeletePetition = async () => {
    if (!petitionToDelete) return;

    try {
      const petitionId = petitionToDelete;

      // ✅ CORREÇÃO: Excluir registros relacionados ANTES de excluir a petição
      // Isso resolve o erro de foreign key constraint
      
      // 1. Excluir multas (writer_penalties)
      const { error: penaltiesError } = await supabase
        .from('writer_penalties')
        .delete()
        .eq('petition_id', petitionId);
      
      if (penaltiesError) {
        console.warn('⚠️ Erro ao excluir multas (pode não existir):', penaltiesError.message);
      }

      // 2. Excluir arquivos da petição (petition_files)
      const { error: filesError } = await supabase
        .from('petition_files')
        .delete()
        .eq('petition_id', petitionId);
      
      if (filesError) {
        console.warn('⚠️ Erro ao excluir arquivos (pode não existir):', filesError.message);
      }

      // 3. Excluir correções (corrections)
      const { error: correctionsError } = await supabase
        .from('corrections')
        .delete()
        .eq('petition_id', petitionId);
      
      if (correctionsError) {
        console.warn('⚠️ Erro ao excluir correções (pode não existir):', correctionsError.message);
      }

      // 4. Excluir conversas relacionadas (conversations)
      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .eq('petition_id', petitionId);
      
      if (conversationsError) {
        console.warn('⚠️ Erro ao excluir conversas (pode não existir):', conversationsError.message);
      }

      // 5. Por fim, excluir a petição (com verificação de ownership)
      const { error } = await supabase
        .from('petitions')
        .delete()
        .eq('id', petitionId)
        .eq('client_id', user?.uid); // Garantir que só exclui suas próprias

      if (error) throw error;

      toast.success('Petição excluída com sucesso!');
      setPetitions(prev => prev.filter(p => p.id !== petitionId));
      setPetitionToDelete(null);
    } catch (error: any) {
      console.error('❌ Erro ao excluir petição:', error);
      toast.error(`Erro ao excluir petição: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Função para editar petição (navega para formulário de edição)
  const handleEditPetition = (petition: Petition) => {
    navigate('/client/petitions/new', {
      state: {
        editMode: true,
        petitionData: petition
      }
    });
  };

  // Função para aprovar petição (com ou sem avaliação)
  const handleApprovePetition = async (petitionId: string) => {
    const petition = petitions.find(p => p.id === petitionId);
    if (!petition) {
      toast.error('Petição não encontrada.');
      return;
    }

    // Verificar se está em status de correção
    if (petition.status === 'revision') {
      toast.error('Não é possível aprovar uma petição que está em correção. Aguarde o redator corrigir.');
      return;
    }

    // Verificar se já foi avaliada
    if (user?.uid) {
      const hasRated = await DatabaseService.hasClientRatedPetition(user.uid, petitionId);
      
      if (hasRated) {
        // Se já foi avaliada, apenas aprovar sem abrir modal de avaliação
        const { error } = await supabase
          .from('petitions')
          .update({ 
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', petitionId)
          .eq('client_id', user.uid);

        if (error) {
          console.error('Erro ao aprovar petição:', error);
          toast.error('Erro ao aprovar petição.');
          return;
        }

        // Atualizar estado local
        setPetitions(prev => prev.map(p => 
          p.id === petitionId 
            ? { ...p, status: 'approved' as const }
            : p
        ));
        
        if (selectedPetition?.id === petitionId) {
          setSelectedPetition(prev => prev ? { ...prev, status: 'approved' as const } : null);
        }

        toast.success('Petição aprovada com sucesso!');

        // Se for petição piloto (free), após aprovar torna obrigatório completar cadastro
        if (petition.is_pilot) {
          try {
            const settings = await UserSettingsService.getUserSettings(user.uid);
            if (!isClientProfileComplete(settings)) {
              toast.error('Agora é necessário completar seu cadastro para continuar (CPF/CNPJ, telefone e nome/empresa).');
              navigate('/client/settings');
            }
          } catch {
            // fail-open
          }
        }
        return;
      }
    }

    // Se não foi avaliada, abrir modal de avaliação (que aprova automaticamente após avaliar)
    setSelectedPetitionForRating(petition);
    setShowRatingModal(true);
  };

  const finishConcierge = async () => {
    if (!user?.uid) return;

    setFinishingConcierge(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const resp = await fetch('/api/users/disable-concierge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firebase_uid: user.uid }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data?.error || 'Não foi possível finalizar o Acesso Concierge');
      }

      toast.success('Acesso Concierge finalizado. Você será desconectado.');
      await signOut(auth);
      window.location.replace('/#/');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao finalizar Acesso Concierge');
    } finally {
      setFinishingConcierge(false);
      setShowFinishConciergeDialog(false);
    }
  };

  // Função para fazer upload dos arquivos de correção
  const handleCorrectionFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    setCorrectionFiles(prev => [...prev, ...fileArray]);
  };

  // Função para remover arquivo da lista antes do upload
  const handleRemoveCorrectionFile = (index: number) => {
    setCorrectionFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Função para solicitar revisão humana
  const handleRequestHumanReview = async () => {
    if (!selectedPetition?.id || !user?.uid) {
      toast.error('Dados inválidos');
      return;
    }

    if (selectedPetition.status !== 'delivered') {
      toast.error('Apenas petições entregues podem ser enviadas para revisão humana');
      return;
    }

    setRequestingHumanReview(true);
    setHumanReviewStatus(null);

    try {
      // Verificar limite de revisões do plano
      const { data: revisionCheckRaw, error: revisionCheckError } = await supabase.rpc('check_revision_limit', { 
        p_petition_id: selectedPetition.id 
      });

      const revisionCheckData = Array.isArray(revisionCheckRaw) ? revisionCheckRaw[0] : revisionCheckRaw;

      if (revisionCheckError) {
        console.error('Erro ao verificar limite de revisões:', revisionCheckError);
        toast.error('Erro ao verificar limite de revisões. Tente novamente.');
        setRequestingHumanReview(false);
        return;
      }

      // Atualizar status da UI
      setHumanReviewStatus({
        allowed: revisionCheckData?.allowed || false,
        plan: revisionCheckData?.plan || 'unknown',
        message: revisionCheckData?.message || 'Erro ao verificar disponibilidade',
        used: revisionCheckData?.used || 0,
        limit: revisionCheckData?.limit || 0
      });

      if (!revisionCheckData?.allowed) {
        const planLabel = revisionCheckData?.plan
          ? revisionCheckData.plan.toUpperCase()
          : 'DESCONHECIDO';

        toast.error(
          `${revisionCheckData.message}\n\n` +
          `Revisões usadas: ${revisionCheckData.used}/${revisionCheckData.limit}\n` +
          `Plano: ${planLabel}`
        );
        setRequestingHumanReview(false);
        return;
      }

      // Criar registro de correção para revisão humana
      const { error: correctionError } = await supabase
        .from('corrections')
        .insert({
          petition_id: selectedPetition.id,
          user_id: user.uid, // Cliente solicitando
          mode: 'client_review_request',
          status: 'pending',
          notes: 'Cliente solicitou revisão humana antes de aprovar a petição.',
          writer_observation: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (correctionError) {
        console.error('Erro ao criar correção para revisão:', correctionError);
        throw correctionError;
      }

      // Atualizar status da petição para 'pending_review'
      const { error: petitionError } = await supabase
        .from('petitions')
        .update({
          status: 'pending_review',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPetition.id)
        .eq('client_id', user.uid);

      if (petitionError) {
        console.error('Erro ao atualizar petição:', petitionError);
        throw petitionError;
      }

      // Notificar todos os admins sobre a solicitação de revisão humana
      try {
        const { data: admins } = await supabase
          .from('profiles_v2')
          .select('firebase_uid')
          .eq('role', 'admin');

        if (admins && admins.length > 0) {
          const notifications = admins.map(admin => ({
            user_id: admin.firebase_uid,
            title: '🔄 Revisão Humana Solicitada',
            body: `O cliente solicitou revisão humana para a petição "${selectedPetition.title}".`,
            type: 'system',
            priority: 'high' as const,
            is_read: false,
            related_entity_type: 'petition',
            related_entity_id: selectedPetition.id
          }));

          const { error: notificationError } = await supabase
            .from('app_2d8133c678_notifications')
            .insert(notifications);

          if (notificationError) {
            console.error('❌ Erro ao criar notificações para admins:', notificationError);
          }
        }
      } catch (notificationError) {
        console.warn('⚠️ Aviso: não foi possível criar notificações para admins:', notificationError);
        // Não falhar a solicitação se a notificação falhar
      }

      toast.success('Revisão humana solicitada com sucesso! O admin foi notificado.');
      
      // Atualizar a petição na lista
      setPetitions(prev => prev.map(p => {
        if (p.id === selectedPetition.id) {
          return { ...p, status: 'pending_review' } as Petition;
        }
        return p;
      }));
      
      // Atualizar petição selecionada
      setSelectedPetition(prev => prev ? {
        ...prev,
        status: 'pending_review'
      } as Petition : null);

    } catch (error: any) {
      console.error('Erro ao solicitar revisão humana:', error);
      toast.error(error.message || 'Erro ao solicitar revisão humana. Tente novamente.');
    } finally {
      setRequestingHumanReview(false);
    }
  };

  // Enviar complemento quando a petição está pausada aguardando cliente
  const handleSendPausedComplement = async () => {
    if (!selectedPetition?.id || !user?.uid) {
      toast.error('Dados inválidos');
      return;
    }

    if (!isPausedForClientComplement(selectedPetition)) {
      toast.error('Esta petição não está em pausa para complemento.');
      return;
    }

    if (!selectedPetition.assigned_writer_id) {
      toast.error('Esta petição não possui redator atribuído.');
      return;
    }

    if (!clientCorrectionNotes.trim() && correctionFiles.length === 0) {
      toast.error('Descreva o complemento ou anexe documentos.');
      return;
    }

    try {
      // Upload de anexos complementares
      for (const file of correctionFiles) {
        const result = await PetitionFileService.uploadFile(file, selectedPetition.id, user.uid);
        if (!result.success) {
          toast.error(`Erro ao enviar ${file.name}: ${result.error || 'falha no upload'}`);
          return;
        }
      }

      const nowIso = new Date().toISOString();

      // Registrar solicitação de complemento para auditoria
      const { error: correctionError } = await supabase
        .from('corrections')
        .insert({
          petition_id: selectedPetition.id,
          user_id: user.uid,
          mode: 'client_request',
          status: 'pending',
          notes: clientCorrectionNotes.trim() || null,
          writer_observation: null,
          created_at: nowIso,
          updated_at: nowIso
        });

      if (correctionError) throw correctionError;

      // Notificar redator
      await DatabaseService.createNotification({
        user_id: selectedPetition.assigned_writer_id,
        title: '📎 Cliente enviou complemento',
        message: `O cliente enviou complemento para a petição "${selectedPetition.title}".`,
        type: 'petition',
        priority: 'high',
        is_read: false,
        related_entity_type: 'petition',
        related_entity_id: selectedPetition.id
      });

      // Notificar admins para retomar fluxo
      await DatabaseService.notifyAllAdmins({
        title: '📌 Complemento recebido do cliente',
        message: `A petição "${selectedPetition.title}" recebeu complemento. Avalie a retomada do prazo.`,
        type: 'petition',
        priority: 'high',
        is_read: false,
        related_entity_type: 'petition',
        related_entity_id: selectedPetition.id
      });

      setClientCorrectionNotes('');
      setCorrectionFiles([]);
      setUploadedCorrectionFiles([]);
      toast.success('Complemento enviado com sucesso. O admin foi notificado para retomar o prazo.');
    } catch (error: any) {
      console.error('Erro ao enviar complemento:', error);
      toast.error(error.message || 'Não foi possível enviar o complemento.');
    }
  };

  // Função para solicitar correção ao redator
  const handleRequestCorrection = async () => {
    if (!selectedPetition?.id || !user?.uid) {
      toast.error('Dados inválidos');
      return;
    }

    if (!selectedPetition.assigned_writer_id) {
      toast.error('Esta petição não possui redator atribuído');
      return;
    }

    if (!clientCorrectionNotes.trim() && correctionFiles.length === 0) {
      toast.error('Por favor, descreva o que precisa ser corrigido ou anexe documentos');
      return;
    }

    try {
      // Fazer upload dos arquivos primeiro
      const uploadedFileIds: string[] = [];
      for (const file of correctionFiles) {
        const result = await PetitionFileService.uploadFile(
          file,
          selectedPetition.id,
          user.uid
        );
        
        if (result.success && result.fileId) {
          uploadedFileIds.push(result.fileId);
        } else {
          console.error('Erro ao fazer upload do arquivo:', result.error);
          toast.error(`Erro ao fazer upload de ${file.name}: ${result.error}`);
        }
      }

      // Verificar se já foi solicitada correção antes (para não adicionar +1 dia novamente)
      const { data: existingCorrections } = await supabase
        .from('corrections')
        .select('id')
        .eq('petition_id', selectedPetition.id)
        .neq('status', 'cancelled'); // Excluir correções canceladas

      const isFirstCorrection = !existingCorrections || existingCorrections.length === 0;
      const hadCorrectionBefore = selectedPetition.correction_requested_at !== null;

      // Só adicionar 1 dia útil se for a primeira correção solicitada
      let newDeadline: string | null = null;
      if (isFirstCorrection && !hadCorrectionBefore) {
        try {
          const today = new Date();
          const extendedDate = setDeadlineCutoff(addBusinessDays(today, 1));
          newDeadline = extendedDate.toISOString();
        } catch (deadlineError) {
          console.warn('⚠️ Não foi possível calcular novo prazo:', deadlineError);
        }
      } else {
        newDeadline = selectedPetition.deadline || null;
      }

      // Atualizar status da petição para 'revision'
      const correctionRequestDate = new Date().toISOString();
      
      // Se for primeira correção, atualizar o deadline separadamente primeiro
      if (isFirstCorrection && !hadCorrectionBefore && newDeadline) {
        const { error: deadlineError } = await supabase
          .from('petitions')
          .update({
            deadline: newDeadline,
          })
          .eq('id', selectedPetition.id)
          .eq('client_id', user.uid);
        
        if (deadlineError) {
          console.error('❌ Erro ao atualizar deadline:', deadlineError);
          // Continuar mesmo se falhar, mas logar o erro
        }
      }
      
      const { error: petitionError, data: updatedPetition } = await supabase
        .from('petitions')
        .update({
          status: 'revision',
          correction_requested_at: correctionRequestDate,
          deadline: newDeadline || selectedPetition.deadline || null, // Atualizar apenas se for primeira correção
          updated_at: correctionRequestDate
        })
        .eq('id', selectedPetition.id)
        .eq('client_id', user.uid)
        .select('deadline'); // Retornar o deadline atualizado para verificar

      if (petitionError) {
        console.error('Erro ao atualizar petição:', petitionError);
        throw petitionError;
      }

      // Verificar se o prazo foi atualizado corretamente
      if (updatedPetition && updatedPetition.length > 0) {
      }

      // Criar registro de correção (cliente solicitando correção)
      const { error: correctionError } = await supabase
        .from('corrections')
        .insert({
          petition_id: selectedPetition.id,
          user_id: user.uid, // Cliente solicitando
          mode: 'client_request',
          status: 'pending',
          notes: clientCorrectionNotes.trim() || null,
          writer_observation: null,
          created_at: correctionRequestDate,
          updated_at: correctionRequestDate
        });

      if (correctionError) {
        console.error('Erro ao criar correção:', correctionError);
        // Reverter status da petição se a correção falhar
        await supabase
          .from('petitions')
          .update({ status: selectedPetition.status, correction_requested_at: null })
          .eq('id', selectedPetition.id);
        throw correctionError;
      }

      // Buscar dados do redator para enviar email
      let writerEmail: string | null = null;
      let writerName: string = 'Redator';
      
      try {
        const { data: writerProfile } = await supabase
          .from('user_profiles')
          .select('email, full_name')
          .eq('firebase_uid', selectedPetition.assigned_writer_id)
          .maybeSingle();
        
        if (!writerProfile) {
          // Tentar profiles_v2 se não encontrar em user_profiles
          const { data: writerProfileV2 } = await supabase
            .from('profiles_v2')
            .select('email, full_name')
            .eq('firebase_uid', selectedPetition.assigned_writer_id)
            .maybeSingle();
          
          if (writerProfileV2) {
            writerEmail = writerProfileV2.email;
            writerName = writerProfileV2.full_name || writerProfileV2.email?.split('@')[0] || 'Redator';
          }
        } else {
          writerEmail = writerProfile.email;
          writerName = writerProfile.full_name || writerProfile.email?.split('@')[0] || 'Redator';
        }
      } catch (emailError) {
        console.warn('Erro ao buscar dados do redator para email:', emailError);
      }

      // Enviar email ao redator
      if (writerEmail) {
        try {
          const revisionNotes = clientCorrectionNotes.trim() || 
            (correctionFiles.length > 0 
              ? `${correctionFiles.length} arquivo(s) anexado(s) para correção.` 
              : 'Correção solicitada pelo cliente.');
          
          await EmailService.sendRevisionRequestEmail(
            writerEmail,
            writerName,
            selectedPetition.id,
            selectedPetition.title,
            revisionNotes
          );
        } catch (emailError) {
          console.error('Erro ao enviar email ao redator:', emailError);
          // Não falhar a solicitação se o email falhar
        }
      } else {
        console.warn('⚠️ Email do redator não encontrado, não foi possível enviar email');
      }

      // Notificar o redator (notificação na plataforma)
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'correction_request',
          title: 'Correção solicitada pelo cliente',
          message: `O cliente solicitou correções na petição "${selectedPetition.title}".${correctionFiles.length > 0 ? ` ${correctionFiles.length} arquivo(s) anexado(s).` : ''}`,
          action_url: `/writer/my-petitions`,
          target_user_id: selectedPetition.assigned_writer_id,
          meta: { petitionId: selectedPetition.id }
        });

      if (notificationError) {
        console.warn('Aviso: não foi possível criar notificação:', notificationError);
      }

      toast.success('Correção solicitada com sucesso! O redator foi notificado.');
      
      // Limpar campos e atualizar lista
      setClientCorrectionNotes('');
      setCorrectionFiles([]);
      
      // Atualizar a petição na lista com o novo prazo
      setPetitions(prev => prev.map(p => 
        p.id === selectedPetition.id 
          ? { 
              ...p, 
              status: 'revision', 
              correction_requested_at: correctionRequestDate,
              deadline: newDeadline || p.deadline // Atualizar o prazo na lista
            }
          : p
      ));
      
      // Atualizar petição selecionada
      setSelectedPetition(prev => prev ? {
        ...prev,
        status: 'revision',
        correction_requested_at: correctionRequestDate,
        deadline: newDeadline || prev.deadline
      } : null);
      
      // Recarregar arquivos para mostrar os novos
      if (selectedPetition.id) {
        const { data: filesData } = await supabase
          .from('petition_files')
          .select('id, petition_id, file_url, file_name, file_size, file_type, uploaded_by, created_at, updated_at')
          .eq('petition_id', selectedPetition.id)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (filesData) {
          const correctionDate = new Date(correctionRequestDate);
          const originalFiles = filesData.filter((file: any) => 
            new Date(file.created_at) < correctionDate
          );
          const correctionFiles = filesData.filter((file: any) => 
            new Date(file.created_at) >= correctionDate && file.uploaded_by === user.uid
          );
          setPetitionFiles(originalFiles);
          setUploadedCorrectionFiles(correctionFiles);
        }
      }
    } catch (error: any) {
      console.error('Erro ao solicitar correção:', error);
      toast.error(error.message || 'Erro ao solicitar correção. Tente novamente.');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }
  
  const userPlan = 'STARTER'; // TODO: Buscar do perfil do usuário

  // Status options with counts (incluindo todos os status possíveis)
  const statusOptions = [
    { value: 'all', label: 'Todos os Status', count: petitions.length },
    { value: 'pending', label: 'Pendente', count: petitions.filter(p => p.status === 'pending' && !p.assigned_writer_id).length },
    { value: 'awaiting_complement', label: 'Aguardando complemento', count: petitions.filter(p => p.status === 'pending' && !!p.assigned_writer_id).length },
    { value: 'in_progress', label: 'Em Andamento', count: petitions.filter(p => p.status === 'in_progress').length },
    { value: 'revision', label: 'Em Revisão', count: petitions.filter(p => p.status === 'revision').length },
    { value: 'completed', label: 'Concluída', count: petitions.filter(p => 
      p.status === 'completed' || p.status === 'delivered' || p.status === 'approved'
    ).length },
    { value: 'delivered', label: 'Entregue', count: petitions.filter(p => p.status === 'delivered').length },
    { value: 'approved', label: 'Aprovada', count: petitions.filter(p => p.status === 'approved').length },
    { value: 'rejected', label: 'Rejeitada', count: petitions.filter(p => p.status === 'rejected').length }
  ];

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
  };

  const isPausedForClientComplement = (petition?: Petition | null) =>
    Boolean(petition?.status === 'pending' && petition?.assigned_writer_id);

  const getClientStatusLabel = (petition?: Petition | null) => {
    if (!petition) return '—';
    if (isPausedForClientComplement(petition)) {
      return 'Prazo pausado para complemento de documentos';
    }
    return statusConfig[petition.status]?.label || petition.status;
  };



  const handleChat = (petitionId: string) => {
    const petition = filteredPetitions.find(p => p.id === petitionId);
    
    if (petition?.writer_name && petition?.assigned_writer_id) {
      toast.success(`Conectando com ${petition.writer_name}...`);
      navigate('/client/chat', { 
        state: { 
          chatType: 'writer', 
          petitionId: petitionId,
          writerId: petition.assigned_writer_id,
          writerName: petition.writer_name,
          petitionTitle: petition.title,
          autoSelect: true
        } 
      });
    } else {
      toast.error('Redator ainda não foi atribuído a esta petição');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Petições</h1>
          <p className="text-muted-foreground">Acompanhe o status de todas as suas petições</p>
        </div>
        <Button 
          onClick={() => navigate('/client/petitions/new')} 
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <FileText className="w-4 h-4 mr-2" />
          Nova Petição
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-amber-200/45 bg-gradient-to-br from-amber-50/45 to-orange-50/25 shadow-[0_8px_24px_-18px_rgba(245,158,11,0.22)] dark:border-border/60 dark:bg-card/80 dark:bg-none dark:shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">
                  {petitions.filter(p => p.status === 'pending' && !p.assigned_writer_id).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200/45 bg-gradient-to-br from-amber-50/45 to-orange-50/25 shadow-[0_8px_24px_-18px_rgba(245,158,11,0.22)] dark:border-border/60 dark:bg-card/80 dark:bg-none dark:shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">
                  {petitions.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200/45 bg-gradient-to-br from-amber-50/45 to-orange-50/25 shadow-[0_8px_24px_-18px_rgba(245,158,11,0.22)] dark:border-border/60 dark:bg-card/80 dark:bg-none dark:shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Em Revisão</p>
                <p className="text-2xl font-bold">
                  {petitions.filter(p => p.status === 'revision').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200/45 bg-gradient-to-br from-amber-50/45 to-orange-50/25 shadow-[0_8px_24px_-18px_rgba(245,158,11,0.22)] dark:border-border/60 dark:bg-card/80 dark:bg-none dark:shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">
                  {petitions.filter(p => 
                    p.status === 'completed' || 
                    p.status === 'delivered' || 
                    p.status === 'approved'
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-amber-200/45 bg-gradient-to-br from-amber-50/45 to-orange-50/25 shadow-[0_8px_24px_-18px_rgba(245,158,11,0.22)] dark:border-border/60 dark:bg-card/80 dark:bg-none dark:shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
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
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {option.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {statusFilter !== 'all' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleStatusChange('all')}
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
          
          {/* Results counter */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Mostrando {filteredPetitions.length} de {petitions.length} petições
              </span>
              {statusFilter !== 'all' && (
                <Badge variant="outline">
                  Filtro: {statusOptions.find(opt => opt.value === statusFilter)?.label}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Petição</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Prioridade</TableHead>
                  <TableHead className="hidden lg:table-cell">Redator</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {isLoadingPetitions ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                      <p className="text-gray-600">Carregando petições...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPetitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-4">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Nenhuma petição encontrada
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {petitions.length === 0
                            ? 'Você ainda não tem petições cadastradas. Clique em "Nova Petição" para começar.'
                            : statusFilter === 'all' && !searchTerm.trim()
                            ? 'Nenhuma petição encontrada.'
                            : statusFilter !== 'all' && !searchTerm.trim()
                            ? `Não há petições com status "${statusOptions.find(opt => opt.value === statusFilter)?.label}".`
                            : `Nenhuma petição encontrada para "${searchTerm}".`
                          }
                        </p>
                        {(statusFilter !== 'all' || searchTerm.trim()) && (
                          <div className="space-x-2">
                            {statusFilter !== 'all' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange('all')}
                              >
                                Limpar filtro de status
                              </Button>
                            )}
                            {searchTerm.trim() && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSearchTerm('')}
                              >
                                Limpar busca
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPetitions.map((petition) => {
                  const StatusIcon = statusConfig[petition.status].icon;
                  return (
                    <TableRow key={petition.id}>
                      <TableCell>
                        <div className="font-medium">{petition.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Criada em {new Date(petition.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        {/* Resumo mobile */}
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground md:hidden">
                          <div>
                            <span className="font-medium text-foreground/80">Tipo:</span> {petition.type}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground/80">Prioridade:</span>
                            <Badge className={priorityConfig[petition.priority].color}>
                              {priorityConfig[petition.priority].label}
                            </Badge>
                          </div>
                          <div className="lg:hidden">
                            <span className="font-medium text-foreground/80">Redator:</span>{' '}
                            {truncateLongName(petition.writer_name) || 'Não atribuído'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{petition.type}</TableCell>
                      <TableCell>
                        {isPausedForClientComplement(petition) ? (
                          <Badge className="bg-amber-100 text-amber-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Prazo pausado para complemento de documentos
                          </Badge>
                        ) : (
                          <Badge className={statusConfig[petition.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[petition.status].label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge className={priorityConfig[petition.priority].color}>
                          {priorityConfig[petition.priority].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell truncate max-w-[200px]" title={petition.writer_name || 'Não atribuído'}>
                        {truncateLongName(petition.writer_name) || 'Não atribuído'}
                      </TableCell>
                      <TableCell>{new Date(petition.deadline).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {/* Botão Aprovar Petição - para status 'delivered' ou 'completed' */}
                          {(petition.status === 'delivered' || petition.status === 'completed') && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprovePetition(petition.id)}
                              title={petition.has_rating 
                                ? "Aprovar petição (já avaliada anteriormente)" 
                                : "Aprovar petição e avaliar redator"}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                          )}
                          
                          {/* Só permite editar/excluir se estiver pendente e sem redator atribuído */}
                          {(petition.status === 'pending' && !petition.assigned_writer_id) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPetition(petition)}
                                title="Editar petição"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPetitionToDelete(petition.id)}
                                title="Excluir petição"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPetition(petition)}
                              >
                                Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{selectedPetition?.title}</DialogTitle>
                                <DialogDescription>
                                  Detalhes completos da petição
                                </DialogDescription>
                              </DialogHeader>
                              {selectedPetition && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Tipo</label>
                                      <p className="text-sm text-muted-foreground">{selectedPetition.type}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Status</label>
                                      <p className="text-sm text-muted-foreground">
                                        {getClientStatusLabel(selectedPetition)}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Prazo</label>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(selectedPetition.deadline).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Descrição</label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedPetition.description}
                                    </p>
                                  </div>
                                  {isPausedForClientComplement(selectedPetition) && (
                                    <div className="rounded border border-amber-300 bg-amber-50 p-3">
                                      <p className="text-sm font-medium text-amber-900">
                                        Prazo pausado para complemento de documentos
                                      </p>
                                      <p className="text-sm text-amber-800 mt-1 whitespace-pre-wrap">
                                        {selectedPetition.deadline_pause_reason?.trim()
                                          ? selectedPetition.deadline_pause_reason
                                          : 'O redator sinalizou pendência de informações/documentos para continuar a elaboração.'}
                                      </p>
                                      <p className="text-xs text-amber-700 mt-2">
                                        Envie o complemento abaixo para acelerar a retomada do prazo.
                                      </p>
                                    </div>
                                  )}

                                  <div className="space-y-3">
                                    <div className="rounded border border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 p-3">
                                      <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 mb-1">
                                        <span className="font-semibold">Observações do cliente</span>
                                        {selectedPetition.created_at && (
                                          <span>{new Date(selectedPetition.created_at).toLocaleDateString('pt-BR')}</span>
                                        )}
                                      </div>
                                      <p className="text-sm text-amber-900 dark:text-amber-50 whitespace-pre-wrap">
                                        {selectedPetition.description?.trim()
                                          ? selectedPetition.description
                                          : 'Você ainda não deixou observações específicas.'}
                                      </p>
                                    </div>
                                    <div className="rounded border border-blue-500/40 bg-blue-50 dark:bg-blue-500/5 p-3">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-blue-800 dark:text-blue-200 mb-1 gap-1">
                                        <span className="font-semibold">
                                          Observações do admin
                                          {lastCorrection?.status && (
                                            <> • {correctionStatusLabels[lastCorrection.status] || lastCorrection.status}</>
                                          )}
                                        </span>
                                        {lastCorrection?.updated_at && (
                                          <span>{new Date(lastCorrection.updated_at).toLocaleString('pt-BR')}</span>
                                        )}
                                      </div>
                                      <p className="text-sm text-blue-900 dark:text-blue-50 whitespace-pre-wrap">
                                        {lastCorrection?.notes?.trim()
                                          ? lastCorrection.notes
                                          : 'Ainda não há observações do admin.'}
                                      </p>
                                    </div>
                                    <div className="rounded border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5 p-3">
                                      <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 mb-1">
                                        <span className="font-semibold">Observações do redator</span>
                                      </div>
                                      <p className="text-sm text-emerald-900 dark:text-emerald-50 whitespace-pre-wrap">
                                        {lastCorrection?.writer_observation?.trim()
                                          ? lastCorrection.writer_observation
                                          : 'O redator ainda não adicionou observações.'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Cálculo Trabalhista */}
                                  {calculation && (
                                    <div className="space-y-2 border-l-4 border-green-500 pl-4 bg-green-50 dark:bg-green-950 p-3 rounded-r">
                                      <h4 className="font-semibold flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        Cálculo Trabalhista Anexado
                                      </h4>
                                      <div className="text-sm space-y-1">
                                        <p><strong>Título:</strong> {calculation.title || 'Cálculo Trabalhista'}</p>
                                        <p><strong>Valor Total:</strong> R$ {calculation.calculation_result?.grandTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}</p>
                                        <p><strong>Data:</strong> {new Date(calculation.created_at).toLocaleString('pt-BR')}</p>
                                        
                                        {/* Botão para baixar PDF */}
                                        <div className="mt-3 flex gap-2">
                                          <Button
                                            size="sm"
                                            variant="default"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => {
                                              if (calculation.calculation_result) {
                                                CalculatorExportService.exportPDF(calculation.calculation_result);
                                                toast.success('Baixando PDF da Memória de Cálculo...');
                                              }
                                            }}
                                          >
                                            <FileDown className="h-4 w-4 mr-2" />
                                            Baixar PDF do Cálculo
                                          </Button>
                                        </div>
                                        
                                        {calculation.calculation_result?.calculationMemory && (
                                          <details className="mt-2">
                                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                              Ver Memória de Cálculo Completa
                                            </summary>
                                            <pre className="mt-2 p-3 bg-white dark:bg-gray-800 rounded text-xs overflow-x-auto max-h-96 overflow-y-auto border">
                                              {calculation.calculation_result.calculationMemory.join('\n')}
                                            </pre>
                                          </details>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <label className="text-sm font-medium">Arquivos</label>
                                    <div className="mt-2 space-y-2">
                                      {petitionFiles.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Nenhum arquivo anexado.</p>
                                      ) : (
                                        petitionFiles.map((file, index) => {
                                          const isLatest = index === 0; // Primeiro arquivo é o mais recente (ordenado por created_at DESC)
                                          return (
                                            <div 
                                              key={file.id} 
                                              className={`flex items-center justify-between rounded p-2 ${
                                                isLatest 
                                                  ? 'border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-sm' 
                                                  : 'border rounded'
                                              }`}
                                            >
                                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                <FileText className={`h-4 w-4 flex-shrink-0 ${isLatest ? 'text-orange-600' : ''}`} />
                                                <span className={`text-sm truncate ${isLatest ? 'font-semibold' : ''}`}>
                                                  {file.file_name}
                                                </span>
                                                {isLatest && (
                                                  <Badge className="ml-2 bg-orange-600 text-white text-xs flex-shrink-0">
                                                    Mais Recente
                                                  </Badge>
                                                )}
                                              </div>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className={isLatest ? 'border-orange-300 hover:bg-orange-100' : ''}
                                                onClick={() => forceDownload(file.file_url, file.file_name)}
                                              >
                                                <Download className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>
                                  </div>

                                  {/* Arquivos de Correção - Seção Separada */}
                                  {uploadedCorrectionFiles.length > 0 && (
                                    <div className="space-y-2 border-t pt-4 mt-4">
                                      <label className="text-sm font-medium">Documentos Anexados para Correção</label>
                                      <p className="text-xs text-muted-foreground mb-2">
                                        Documentos enviados junto com a solicitação de correção
                                      </p>
                                      <div className="space-y-2">
                                        {uploadedCorrectionFiles.map((file) => (
                                          <div key={file.id} className="flex items-center justify-between border border-orange-300 bg-orange-50 dark:bg-orange-950/20 rounded p-2">
                                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                              <FileText className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                              <span className="text-sm truncate">{file.file_name}</span>
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="border-orange-300 hover:bg-orange-100"
                                              onClick={() => forceDownload(file.file_url, file.file_name)}
                                            >
                                              <Download className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Botão Aprovar Petição - para status 'delivered' ou 'completed' */}
                                  <div className="border-t pt-4 mt-4">
                                    {(() => {
                                      const canApprove = selectedPetition.status === 'delivered' || selectedPetition.status === 'completed';
                                      
                                      if (canApprove) {
                                        return (
                                          <>
                                            <Button
                                              onClick={() => {
                                                handleApprovePetition(selectedPetition.id);
                                                // Se já foi avaliada, apenas aprova. Se não, abre modal de avaliação
                                              }}
                                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                                              size="lg"
                                            >
                                              <CheckCircle2 className="h-5 w-5 mr-2" />
                                              Aprovar Petição
                                            </Button>
                                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                              {selectedPetition.has_rating 
                                                ? 'Petição já foi avaliada. Clique para aprovar.'
                                                : 'Confirme que recebeu e aprovou a petição'}
                                            </p>
                                          </>
                                        );
                                      } else if (selectedPetition.status === 'approved') {
                                        return (
                                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded">
                                            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                              Petição aprovada
                                            </p>
                                            {isConcierge && (
                                              <div className="mt-4">
                                                <Button
                                                  onClick={() => setShowFinishConciergeDialog(true)}
                                                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                                                  disabled={finishingConcierge}
                                                >
                                                  Confirmar finalização do Acesso Concierge
                                                </Button>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                  Ao confirmar, seu acesso será encerrado e você será desconectado.
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                                            <p className="text-sm text-muted-foreground mb-2">
                                              Esta petição está com status <strong>{getClientStatusLabel(selectedPetition)}</strong>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              O botão "Aprovar" aparecerá quando a petição estiver com status "Entregue" ou "Concluída"
                                            </p>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="mt-3"
                                              onClick={async () => {
                                                try {
                                                  // Recarregar petição completa do banco
                                                  const { data: updatedPetition, error } = await supabase
                                                    .from('petitions')
                                                    .select('id, title, type, status, priority, created_at, deadline, assigned_writer_id, writer_name, price, description, correction_count, correction_requested_at, calculation_id, deadline_paused_at, deadline_remaining_seconds, deadline_pause_reason')
                                                    .eq('id', selectedPetition.id)
                                                    .single();
                                                  
                                                  if (error) {
                                                    console.error('❌ Erro ao recarregar petição:', error);
                                                    toast.error('Erro ao recarregar petição');
                                                    return;
                                                  }
                                                  
                                                  if (updatedPetition) {
                                                    // Atualizar a petição na lista também
                                                    setPetitions(prev => 
                                                      prev.map(p => 
                                                        p.id === updatedPetition.id 
                                                          ? { ...p, ...updatedPetition } as any
                                                          : p
                                                      )
                                                    );
                                                    
                                                    // Atualizar a petição selecionada
                                                    setSelectedPetition({ ...selectedPetition, ...updatedPetition } as any);
                                                    
                                                    toast.success(`Status atualizado: ${statusConfig[updatedPetition.status as keyof typeof statusConfig]?.label || updatedPetition.status}`);
                                                  }
                                                } catch (err) {
                                                  console.error('❌ Erro ao recarregar petição:', err);
                                                  toast.error('Erro ao recarregar petição');
                                                }
                                              }}
                                            >
                                              <RefreshCcw className="h-4 w-4 mr-2" />
                                              Recarregar Status
                                            </Button>
                                          </div>
                                        );
                                      }
                                    })()}
                                  </div>

                                  <AlertDialog open={showFinishConciergeDialog} onOpenChange={setShowFinishConciergeDialog}>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Finalizar Acesso Concierge</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Confirme que não há mais alterações nesta petição. Ao finalizar, seu acesso será encerrado e seus dados pessoais serão anonimizados, mantendo o histórico da petição.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel disabled={finishingConcierge}>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={finishConcierge} disabled={finishingConcierge}>
                                          {finishingConcierge ? 'Finalizando...' : 'Confirmar finalização'}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  {/* Solicitar Correção / Enviar Complemento */}
                                  {selectedPetition.assigned_writer_id && 
                                   (isPausedForClientComplement(selectedPetition) ||
                                    selectedPetition.status === 'delivered' || 
                                    selectedPetition.status === 'completed' || 
                                    selectedPetition.status === 'approved') && (
                                    <div className="space-y-3 border-t pt-4 mt-4">
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">
                                          {isPausedForClientComplement(selectedPetition)
                                            ? 'Enviar Complemento ao Redator'
                                            : 'Solicitar Correção ao Redator'}
                                        </label>
                                        <Textarea
                                          placeholder={
                                            isPausedForClientComplement(selectedPetition)
                                              ? 'Descreva os documentos/informações complementares para destravar a petição...'
                                              : 'Descreva o que precisa ser corrigido na petição...'
                                          }
                                          value={clientCorrectionNotes}
                                          onChange={(e) => setClientCorrectionNotes(e.target.value)}
                                          className="min-h-[100px] resize-none"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {isPausedForClientComplement(selectedPetition)
                                            ? 'Seu complemento será enviado ao redator e aos admins para retomada do prazo.'
                                            : 'Suas observações serão enviadas ao redator para que ele possa fazer as correções necessárias.'}
                                        </p>
                                      </div>
                                      
                                      {/* Campo de Upload de Arquivos */}
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">
                                          Anexar Documentos (Opcional)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                          <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                                            onChange={(e) => handleCorrectionFileUpload(e.target.files)}
                                            className="hidden"
                                            id="correction-files-input"
                                          />
                                          <label
                                            htmlFor="correction-files-input"
                                            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                                          >
                                            <FileText className="h-8 w-8 text-gray-400" />
                                            <span className="text-sm text-muted-foreground text-center">
                                              Clique para selecionar arquivos ou arraste aqui
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              PDF, DOC, DOCX, JPG, PNG (máx. 10MB por arquivo)
                                            </span>
                                          </label>
                                        </div>
                                        
                                        {/* Lista de arquivos selecionados */}
                                        {correctionFiles.length > 0 && (
                                          <div className="mt-3 space-y-2">
                                            <p className="text-xs font-medium text-muted-foreground">
                                              Arquivos selecionados ({correctionFiles.length}):
                                            </p>
                                            {correctionFiles.map((file, index) => (
                                              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded p-2">
                                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                  <span className="text-sm truncate">{file.name}</span>
                                                  <span className="text-xs text-muted-foreground">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                  </span>
                                                </div>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => handleRemoveCorrectionFile(index)}
                                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                  <X className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <Button
                                        onClick={isPausedForClientComplement(selectedPetition) ? handleSendPausedComplement : handleRequestCorrection}
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                                        disabled={!clientCorrectionNotes.trim() && correctionFiles.length === 0}
                                      >
                                        <RefreshCcw className="h-4 w-4 mr-2" />
                                        {isPausedForClientComplement(selectedPetition) ? 'Enviar Complemento' : 'Solicitar Correção'}
                                        {correctionFiles.length > 0 && ` (${correctionFiles.length} arquivo${correctionFiles.length > 1 ? 's' : ''})`}
                                      </Button>
                                    </div>
                                  )}

                                  {/* Solicitar Revisão Humana - Apenas para petições entregues */}
                                  {selectedPetition.status === 'delivered' && (
                                    <div className="space-y-3 border-t pt-4 mt-4">
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">
                                          Solicitar Revisão Humana
                                        </label>
                                        <p className="text-xs text-muted-foreground mb-3">
                                          Envie sua petição para revisão por um corretor humano antes de aprovar. 
                                          Esta ação consome uma revisão do seu plano.
                                        </p>
                                        <Button
                                          onClick={handleRequestHumanReview}
                                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                          disabled={requestingHumanReview}
                                        >
                                          {requestingHumanReview
                                            ? 'Verificando disponibilidade...'
                                            : 'Solicitar Revisão Humana'}
                                        </Button>
                                        {humanReviewStatus && (
                                          <p className={`text-xs text-center mt-2 ${
                                            humanReviewStatus.allowed 
                                              ? 'text-green-600' 
                                              : 'text-orange-600'
                                          }`}>
                                            {humanReviewStatus.message}
                                            {humanReviewStatus.plan && (
                                              <span className="block mt-1">
                                                Plano: {humanReviewStatus.plan.toUpperCase()}
                                                {typeof humanReviewStatus.used === 'number' &&
                                                 typeof humanReviewStatus.limit === 'number' &&
                                                  ` • ${humanReviewStatus.used}/${humanReviewStatus.limit} revisões usadas`}
                                              </span>
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {petition.writer_name && petition.writer_name !== 'Não atribuído' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChat(petition.id)}
                              className="hover:bg-blue-50 hover:border-blue-200"
                              title={`Conversar com ${petition.writer_name}`}
                            >
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!petitionToDelete} onOpenChange={() => setPetitionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta petição? Esta ação não pode ser desfeita.
              {petitions.find(p => p.id === petitionToDelete)?.writer_name && 
               petitions.find(p => p.id === petitionToDelete)?.writer_name !== 'Não atribuído' && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">
                    ⚠️ <strong>Atenção:</strong> Esta petição já foi atribuída a um redator. 
                    Ao excluir, o redator será notificado.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePetition}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Petição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Avaliação Obrigatória */}
      {showRatingModal && selectedPetitionForRating && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedPetitionForRating(null);
          }}
          petition={{
            id: selectedPetitionForRating.id,
            title: selectedPetitionForRating.title,
            assigned_writer_id: selectedPetitionForRating.assigned_writer_id || ''
          }}
          onRatingSubmitted={() => {
            setShowRatingModal(false);
            setSelectedPetitionForRating(null);
            // Fechar modal de detalhes após avaliação
            setSelectedPetition(null);
            // Atualizar estado local para refletir aprovação
            setPetitions(prev => prev.map(p => 
              p.id === selectedPetitionForRating.id 
                ? { ...p, status: 'approved', has_rating: true } 
                : p
            ));
            toast.success('Petição aprovada e avaliação enviada com sucesso!');

            // Se for petição piloto (free), após aprovar torna obrigatório completar cadastro
            if (selectedPetitionForRating.is_pilot && user?.uid) {
              (async () => {
                try {
                  const settings = await UserSettingsService.getUserSettings(user.uid);
                  if (!isClientProfileComplete(settings)) {
                    toast.error('Agora é necessário completar seu cadastro para continuar (CPF/CNPJ, telefone e nome/empresa).');
                    navigate('/client/settings');
                  }
                } catch {
                  // fail-open
                }
              })();
            }
          }}
        />
      )}
    </div>
  );
}