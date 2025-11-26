/* @ts-nocheck */
import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, MessageSquare, Clock, CheckCircle2, AlertCircle, Download, X, Upload, Calculator, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

import { useNewAuth } from '@/contexts/NewAuthContext';
import { DatabaseService, Petition } from '@/services/databaseService';
import { supabase } from '@/lib/supabaseClient'
import { calculateProgress } from '@/utils/progress';

type WriterStatus = 'in_progress' | 'pending_review' | 'revision' | 'completed' | 'assigned' | 'delivered' | 'approved' | 'pending' | 'cancelled' | 'available' | 'rejected';

const statusConfig: Record<WriterStatus, { label: string; color: string; icon: any }> = {
  assigned: { label: 'Atribuída', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800', icon: Clock },
  pending_review: { label: 'Aguardando Revisão', color: 'bg-purple-100 text-purple-800', icon: AlertCircle },
  revision: { label: 'Em Revisão', color: 'bg-orange-100 text-orange-800', icon: FileText },
  completed: { label: 'Concluída', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  approved: { label: 'Aprovada pelo Cliente', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  pending: { label: 'Pendente', color: 'bg-gray-100 text-gray-800', icon: Clock },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: X },
  available: { label: 'Disponível', color: 'bg-blue-100 text-blue-800', icon: FileText },
  rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-800', icon: X }
};

const correctionStatusLabels: Record<string, string> = {
  pending: 'Aguardando revisão',
  in_progress: 'Em correção',
  completed: 'Concluída',
  cancelled: 'Devolvida'
};

const BUCKET = 'petitions_correction_writer'; // Bucket para petições enviadas pelos redatores para correção

export default function MyPetitions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useNewAuth();

  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [petitionFiles, setPetitionFiles] = useState<any[]>([]);
  const [uploadNote, setUploadNote] = useState('');
  const [hasPendingCorrection, setHasPendingCorrection] = useState(false);
  const [adminReturnNote, setAdminReturnNote] = useState<{
    note: string;
    status?: string | null;
    updated_at?: string | null;
  } | null>(null);
  const [clientCorrectionNote, setClientCorrectionNote] = useState<{
    note: string;
    status?: string | null;
    updated_at?: string | null;
  } | null>(null);
  const [revisionAvailability, setRevisionAvailability] = useState<{
    allowed?: boolean;
    message?: string;
    plan?: string;
    used?: number;
    limit?: number;
    reset_at?: string;
  } | null>(null);
  const [loadingRevisionAvailability, setLoadingRevisionAvailability] = useState(false);
  const [resendingAcceptanceEmails, setResendingAcceptanceEmails] = useState(false);
const [isDirectDeliveryLoading, setIsDirectDeliveryLoading] = useState(false);
  const [decliningPetition, setDecliningPetition] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ========= Função para verificar se há correção pendente =========
  const checkPendingCorrection = async (petitionId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('corrections')
        .select('id, status')
        .eq('petition_id', petitionId)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar correção pendente:', error);
        return false;
      }

      const hasPending = !!data;
      return hasPending;
    } catch (error) {
      console.error('Erro ao verificar correção:', error);
      return false;
    }
  };

  const handleResendAcceptanceEmails = async (petitionId: string) => {
    try {
      setResendingAcceptanceEmails(true);
      const success = await DatabaseService.resendPetitionAcceptedEmails(petitionId);
      if (success) {
        toast.success('Emails de aceite reenviados com sucesso!');
      } else {
        toast.error('Não foi possível reenviar os emails de aceite.');
      }
    } catch (error) {
      console.error('Erro ao reenviar emails de aceite:', error);
      toast.error('Erro ao reenviar emails de aceite.');
    } finally {
      setResendingAcceptanceEmails(false);
    }
  };

  const fetchRevisionAvailability = useCallback(
    async (petitionId?: string) => {
      const targetPetitionId = petitionId || selectedPetition?.id;

      if (!targetPetitionId) {
        setRevisionAvailability(null);
        return;
      }

      setLoadingRevisionAvailability(true);
      try {
        const { data, error } = await supabase.rpc('check_revision_limit', {
          p_petition_id: targetPetitionId
        });

        if (error) {
          console.error('Erro ao verificar disponibilidade de revisão humana:', error);
          setRevisionAvailability(null);
          return;
        }

        setRevisionAvailability(data);
      } catch (error) {
        console.error('Erro inesperado ao verificar disponibilidade de revisão humana:', error);
        setRevisionAvailability(null);
      } finally {
        setLoadingRevisionAvailability(false);
      }
    },
    [selectedPetition?.id]
  );

  // ========= Carregar arquivos e correção pendente quando petição é selecionada =========
  useEffect(() => {
    async function loadCorrectionStatus() {
      if (!selectedPetition?.id) {
        setHasPendingCorrection(false);
        setPetitionFiles([]);
        setRevisionAvailability(null);
        setAdminReturnNote(null);
        setClientCorrectionNote(null);
        return;
      }

      const hasPending = await checkPendingCorrection(selectedPetition.id);
      setHasPendingCorrection(hasPending);

      try {
        const { data: filesData, error: filesError } = await supabase
          .from('petition_files')
          .select('id, petition_id, file_url, file_name, file_size, file_type, uploaded_by, created_at, updated_at')
          .eq('petition_id', selectedPetition.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (filesError) {
          console.error('Erro ao carregar arquivos da petição:', filesError);
          setPetitionFiles([]);
        } else {
          setPetitionFiles(filesData || []);
        }
      } catch (error) {
        console.error('Erro inesperado ao carregar arquivos da petição:', error);
        setPetitionFiles([]);
      }

      try {
        // Buscar todas as correções (admin e cliente)
        const { data: allCorrections, error: correctionsError } = await supabase
          .from('corrections')
          .select('id, status, notes, user_id, mode, updated_at')
          .eq('petition_id', selectedPetition.id)
          .order('updated_at', { ascending: false });

        if (correctionsError) {
          console.error('Erro ao buscar correções:', correctionsError);
          setAdminReturnNote(null);
          setClientCorrectionNote(null);
        } else {
          // Buscar correção do admin (notes não nulo e mode diferente de 'client_request')
          const adminCorrection = (allCorrections || []).find(corr => 
            corr.notes && corr.notes.trim() && corr.mode !== 'client_request'
          );
          
          // Buscar correção do cliente (mode = 'client_request' ou notes do cliente)
          const clientCorrection = (allCorrections || []).find(corr => 
            corr.mode === 'client_request' && corr.notes && corr.notes.trim()
          );

          // Sempre mostrar observações do admin se existirem
          if (adminCorrection?.notes?.trim()) {
            setAdminReturnNote({
              note: adminCorrection.notes,
              status: adminCorrection.status,
              updated_at: adminCorrection.updated_at
            });
          } else {
            setAdminReturnNote(null);
          }

          // Sempre mostrar observações do cliente se existirem
          if (clientCorrection?.notes?.trim()) {
            setClientCorrectionNote({
              note: clientCorrection.notes,
              status: clientCorrection.status,
              updated_at: clientCorrection.updated_at
            });
          } else {
            setClientCorrectionNote(null);
          }
        }
      } catch (error) {
        console.error('Erro inesperado ao buscar correção:', error);
        setAdminReturnNote(null);
        setClientCorrectionNote(null);
      }

      await fetchRevisionAvailability(selectedPetition.id);
    }

    loadCorrectionStatus();
  }, [selectedPetition?.id, fetchRevisionAvailability]);

  // ========= Carrega petições e assina realtime =========
  // @ts-ignore
  useEffect(() => {
    const loadMyPetitions = async () => {
      if (!user?.uid) return;
      try {
        setLoading(true);
        const writerPetitions = await DatabaseService.getWriterPetitions(user.uid);
        setPetitions(writerPetitions);
      } catch (e) {
        console.error(e);
        toast.error('Não foi possível carregar suas petições.');
      } finally {
        setLoading(false);
      }
    };

    loadMyPetitions();
    if (user?.uid) {
      const subscription = DatabaseService.subscribeToWriterPetitions(
        user.uid, 
        (petitions) => {
          startTransition(() => {
            setPetitions(petitions);
          });
        }
      );
      return () => subscription?.unsubscribe?.();
    }
  }, [user?.uid]);

  // ========= Processar query params da URL (notificações) =========
  useEffect(() => {
    if (loading || petitions.length === 0) return;

    const petitionId = searchParams.get('petition');
    const tab = searchParams.get('tab');
    const deadline = searchParams.get('deadline');
    const approved = searchParams.get('approved');
    const correction = searchParams.get('correction');

    // Se há um petitionId na URL, abrir a petição
    if (petitionId) {
      const petition = petitions.find(p => p.id === petitionId);
      if (petition) {
        setSelectedPetition(petition);
        
        // Se há tab=corrections, abrir tab de correções (se implementado)
        if (tab === 'corrections') {
          // Aqui você pode adicionar lógica para abrir a tab de correções
        }

        // Se há deadline=warning, mostrar alerta de prazo
        if (deadline === 'warning') {
          toast.warning(`⚠️ Atenção! Esta petição está próxima do prazo de entrega.`);
        }

        // Se há approved=true, mostrar mensagem de aprovação
        if (approved === 'true') {
          toast.success(`✅ Petição aprovada pelo cliente!`);
        }

        // Limpar query params após processar
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('petition');
        newSearchParams.delete('tab');
        newSearchParams.delete('deadline');
        newSearchParams.delete('approved');
        newSearchParams.delete('correction');
        navigate(`/writer/my-petitions${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`, { replace: true });
      }
    }

    // Se há correctionId na URL, buscar a petição relacionada
    if (correction) {
      // Buscar correção para obter petition_id
      supabase
        .from('corrections')
        .select('petition_id')
        .eq('id', correction)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data?.petition_id) {
            const petition = petitions.find(p => p.id === data.petition_id);
            if (petition) {
              setSelectedPetition(petition);
              toast.info('📋 Abrindo petição com correção pendente.');
            }
          }
        });
    }
  }, [loading, petitions, searchParams, navigate]);

  // ========= Utilitários =========
  const calculateDaysLeft = (deadline?: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // ========= DOWNLOAD real do Storage =========
  async function handleDownloadFromStorage(pathOrName: string) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(pathOrName, 60 * 60); // 1h

      if (error || !data?.signedUrl) throw error || new Error('URL não gerada');
      window.open(data.signedUrl, '_blank');
      toast.success('Download iniciado.');
    } catch (err) {
      console.error(err);
      toast.error('Falha ao baixar arquivo.');
    }
  }

  // ========= UPLOAD entrega =========
  async function handleUploadDelivered(petitionId: string, file: File) {
    if (!user?.uid) return toast.error('Usuário não autenticado.');
    
    // Validar se petição requer cálculo e se foi feito
    const petition = petitions.find(p => p.id === petitionId);
    if (petition?.requires_labor_calculation && !petition?.calculation_id) {
      toast.error('Esta petição requer cálculo trabalhista. Faça o cálculo antes de entregar!');
      return;
    }
    
    // ⏰ VALIDAÇÃO DE DEADLINE: Verificar se ainda está dentro do prazo
    if (petition?.deadline) {
      const deadlineDate = new Date(petition.deadline);
      const now = new Date();
      const diffMs = deadlineDate.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      // Deadline às 18h, tolerância até 19h (60 minutos extras)
      const toleranceMinutes = 60;
      
      if (diffMinutes < -toleranceMinutes) {
        // Passou da tolerância (19h)
        toast.error(
          `⏰ Prazo expirado! O prazo era até ${deadlineDate.toLocaleDateString('pt-BR')} às 18h (tolerância até 19h). ` +
          `A petição será marcada como atrasada e multa será aplicada. Entre em contato com o suporte.`
        );
        // Ainda permite o envio, mas será marcado como atrasado
      } else if (diffMinutes < 0) {
        // Passou das 18h mas ainda dentro da tolerância (até 19h)
        toast.warning(
          `⚠️ Atenção: Você está enviando após o prazo oficial (18h). ` +
          `Ainda está dentro da tolerância até 19h. Envie o quanto antes!`
        );
      } else if (diffMinutes < 60) {
        // Menos de 1 hora restante
        toast.warning(
          `⏰ Atenção: Restam apenas ${diffMinutes} minutos para o prazo final (18h). ` +
          `Envie o quanto antes!`
        );
      }
    }
    
    try {
      const key = `${petitionId}/delivered/${Date.now()}-${file.name}`;
      
      const { error: upErr, data: uploadData } = await supabase.storage
        .from(BUCKET)
        .upload(key, file, { upsert: true, contentType: file.type || undefined });
      
      if (upErr) {
        console.error('❌ Erro no upload do Storage:', upErr);
        throw upErr;
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(key);

      const fileData = {
        petition_id: petitionId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        uploaded_by: user.uid
      };

      const { data: insertData, error: insertErr } = await supabase.from('petition_files').insert(fileData);
      
      if (insertErr) {
        console.error('❌ Erro ao inserir na tabela petition_files:', insertErr);
        throw insertErr;
      }

      await supabase
        .from('petitions')
        .update({ status: 'pending_review', updated_at: new Date().toISOString() })
        .eq('id', petitionId);

      toast.success('Arquivo enviado e petição marcada para revisão.');
      setSelectedFile(null);
    } catch (err) {
      console.error('❌ ERRO COMPLETO:', err);
      toast.error('Falha no upload da petição.');
    }
  }

  // ========= Enviar ao corretor (humano) =========
  async function handleSendToHumanReviewer(petitionId: string) {
    if (!user?.uid) return toast.error('Usuário não autenticado.');
    
    // Verificar se já tem correção pendente
    const hasPending = await checkPendingCorrection(petitionId);
    if (hasPending) {
      toast.info('Esta petição já foi enviada ao corretor e está aguardando revisão.');
      return;
    }

    // Verificar se petição requer cálculo e se foi feito
    const petition = petitions.find(p => p.id === petitionId);
    if (petition?.requires_labor_calculation && !petition?.calculation_id) {
      toast.error('Esta petição requer cálculo trabalhista. Faça o cálculo antes de enviar!');
      return;
    }

    try {
      // 🚀 Verificar limite de revisões do plano do cliente
      const { data: revisionCheckRaw, error: revisionCheckError } = await supabase.rpc('check_revision_limit', { 
        p_petition_id: petitionId 
      });

      const revisionCheckData = Array.isArray(revisionCheckRaw) ? revisionCheckRaw[0] : revisionCheckRaw;

      if (revisionCheckError) {
        console.error('Erro ao verificar limite de revisões:', revisionCheckError);
        toast.error('Erro ao verificar limite de revisões. Tente novamente.');
        return;
      }

      console.log('📊 Resultado da verificação de limite:', revisionCheckData);

      if (revisionCheckData && !revisionCheckData.allowed) {
        const planLabel = revisionCheckData.plan
          ? revisionCheckData.plan.toUpperCase()
          : 'DESCONHECIDO';

        toast.error(
          `${revisionCheckData.message}\n\n` +
          `Revisões usadas: ${revisionCheckData.used}/${revisionCheckData.limit}\n` +
          `Plano: ${planLabel}`
        );
        return;
      }

      // 🚀 Se houver arquivo selecionado, fazer upload primeiro
      if (selectedFile) {
        // Validar se é DOCX
        const validTypes = [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
          'application/msword' // .doc
        ];
        
        if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(docx?|DOCX?)$/)) {
          toast.error('Por favor, envie apenas arquivos .DOC ou .DOCX para facilitar a correção.');
          return;
        }
        
        // Gerar nome único sem caracteres especiais
        const timestamp = Date.now();
        const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `${petitionId}_${timestamp}_${safeName}`;
        
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(key, selectedFile, { upsert: true, contentType: selectedFile.type || undefined });
        
        if (upErr) {
          console.error('❌ Erro no upload do Storage:', upErr);
          throw upErr;
        }

        // Obter URL pública do arquivo
        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(key);

        // Inserir na tabela petition_files
        const { error: insertErr } = await supabase.from('petition_files').insert({
          petition_id: petitionId,
          file_name: selectedFile.name,
          file_url: urlData.publicUrl,
          file_type: selectedFile.type || 'application/octet-stream',
          file_size: selectedFile.size,
          uploaded_by: user.uid
        });

        if (insertErr) {
          console.error('❌ Erro ao inserir na tabela petition_files:', insertErr);
          throw insertErr;
        }
      }

      // Cria um registro de correção pendente
      const { error: corrErr } = await supabase.from('corrections').insert({
        petition_id: petitionId,
        user_id: user.uid,
        mode: 'abnt',
        original_text: null,
        corrected_text: null,
        status: 'pending',
        writer_observation: uploadNote.trim() ? uploadNote.trim() : null
      });
      if (corrErr) throw corrErr;

      // garante status
      await supabase
        .from('petitions')
        .update({ status: 'pending_review', updated_at: new Date().toISOString() })
        .eq('id', petitionId);

      // Notificação para admins removida - tabela notifications não existe
      // Se necessário, usar app_2d8133c678_notifications com target_role ou similar

      toast.success('Enviado para revisão humana. O admin foi notificado.');
      
      // Limpar arquivo selecionado após envio
      setSelectedFile(null);
      
      // Atualizar estado para desabilitar o botão
      setHasPendingCorrection(true);
      await fetchRevisionAvailability(petitionId);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar para revisão.');
    }
  }

  // ========= Enviar diretamente ao cliente quando revisão não estiver disponível =========
  async function handleSendDirectlyToClient(petitionId: string) {
    if (!user?.uid) return toast.error('Usuário não autenticado.');

    const petition = petitions.find(p => p.id === petitionId);
    if (petition?.requires_labor_calculation && !petition?.calculation_id) {
      toast.error('Esta petição requer cálculo trabalhista. Faça o cálculo antes de enviar.');
      return;
    }

    // Permitir envio se:
    // 1. A petição está em revisão (correção solicitada pelo cliente) OU
    // 2. Há correção do cliente (clientCorrectionNote existe) OU
    // 3. A revisão não está disponível (allowed === false) OU
    // 4. Não há informação sobre revisão (revisionAvailability === null)
    const isRevisionRequested = (petition?.status as string) === 'revision';
    const hasClientCorrection = clientCorrectionNote !== null;
    const revisionNotAvailable = revisionAvailability?.allowed === false || revisionAvailability === null;
    
    // Bloquear apenas se revisão está disponível E não é revisão solicitada E não há correção do cliente
    if (!isRevisionRequested && !hasClientCorrection && revisionAvailability?.allowed === true) {
      toast.info('Ainda é possível enviar para o corretor humano. Utilize o botão principal.');
      return;
    }
    
    console.log('🔍 [ENVIO CLIENTE] Verificação de envio:', {
      isRevisionRequested,
      hasClientCorrection,
      revisionNotAvailable,
      revisionAvailability: revisionAvailability?.allowed,
      permitirEnvio: isRevisionRequested || hasClientCorrection || revisionNotAvailable
    });

    if (!selectedFile) {
      toast.error('Selecione o arquivo .DOC ou .DOCX antes de enviar ao cliente.');
      return;
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(docx?|DOCX?)$/)) {
      toast.error('Por favor, envie apenas arquivos .DOC ou .DOCX para o cliente.');
      return;
    }

    setIsDirectDeliveryLoading(true);

    try {
      const timestamp = Date.now();
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `${petitionId}/delivered/${timestamp}_${safeName}`;
      const inferredContentType =
        selectedFile.type && selectedFile.type.trim().length > 0
          ? selectedFile.type
          : safeName.toLowerCase().endsWith('.docx')
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/msword';

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(key, selectedFile, { upsert: true, contentType: inferredContentType });

      if (uploadError) {
        console.error('❌ Erro no upload do Storage:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(key);

      const publicUrl = urlData.publicUrl;

      const { error: filesError } = await supabase.from('petition_files').insert({
        petition_id: petitionId,
        file_name: selectedFile.name,
        file_url: publicUrl,
        file_type: inferredContentType,
        file_size: selectedFile.size,
        uploaded_by: user.uid
      });

      if (filesError) {
        console.error('❌ Erro ao registrar arquivo entregue:', filesError);
        throw filesError;
      }

      // Salvar observações do redator na tabela corrections se houver
      if (uploadNote && uploadNote.trim()) {
        try {
          const { error: correctionError } = await supabase.from('corrections').insert({
            petition_id: petitionId,
            user_id: user.uid,
            writer_observation: uploadNote.trim(),
            status: 'completed',
            mode: 'writer_delivery'
          });
          
          if (correctionError) {
            console.warn('⚠️ Erro ao salvar observações do redator:', correctionError);
            // Não falhar a operação se não conseguir salvar observações
          }
        } catch (obsError) {
          console.warn('⚠️ Erro ao salvar observações do redator:', obsError);
          // Não falhar a operação se não conseguir salvar observações
        }
      }

      const deliveredAt = new Date().toISOString();

      // Atualizar apenas status e updated_at (delivered_file e delivered_at podem não existir na tabela)
      const updateData = {
        status: 'delivered',
        updated_at: deliveredAt
      };

      const { data: updateResult, error: updateError } = await supabase
        .from('petitions')
        .update(updateData)
        .eq('id', petitionId)
        .select();

      if (updateError) {
        console.error('❌ Erro ao atualizar status da petição para delivered:', {
          error: updateError,
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          petitionId,
          updateData
        });
        toast.error(`Erro ao atualizar status: ${updateError.message || 'Erro desconhecido'}`);
        throw updateError;
      }

      // Notificar o cliente (removida notificação para admin - tabela notifications não existe)
      if (petition?.client_id) {
        try {
          const { error: notifError } = await supabase.from('app_2d8133c678_notifications').insert({
            user_id: petition.client_id,
            type: 'petition', // Tipo deve ser um dos valores permitidos no CHECK constraint
            title: 'Sua petição foi entregue',
            body: `A petição "${petition?.title || ''}" foi corrigida e entregue pelo redator.`,
            priority: 'normal',
            is_read: false,
            related_entity_type: 'petition',
            related_entity_id: petitionId
          });
          
          if (notifError) {
            console.error('⚠️ Erro ao enviar notificação ao cliente:', {
              error: notifError,
              code: notifError.code,
              message: notifError.message,
              details: notifError.details,
              hint: notifError.hint
            });
            // Não falhar a operação se a notificação falhar
          }
        } catch (notifError) {
          console.error('⚠️ Erro ao enviar notificação ao cliente:', notifError);
          // Não falhar a operação se a notificação falhar
        }
      }

      toast.success('Petição enviada diretamente ao cliente.');
      setSelectedFile(null);
      setUploadNote(''); // Limpar observações após enviar
      setHasPendingCorrection(false);
      await fetchRevisionAvailability(petitionId);

      setPetitions(prev =>
        prev.map(p =>
          p.id === petitionId
            ? {
                ...p,
                status: 'delivered',
                updated_at: deliveredAt
              }
            : p
        )
      );
    } catch (err) {
      console.error('Erro ao enviar diretamente ao cliente:', err);
      toast.error('Erro ao enviar diretamente ao cliente.');
    } finally {
      setIsDirectDeliveryLoading(false);
    }
  }

  // ========= Declinar Petição (Não conseguirei entregar a tempo) =========
  async function handleDeclinePetition(petitionId: string) {
    if (!user?.uid) return toast.error('Usuário não autenticado.');
    
    const petition = petitions.find(p => p.id === petitionId);
    if (!petition) return toast.error('Petição não encontrada.');
    
    // Verificar se a petição pode ser declinada
    if (petition.status !== 'in_progress' && petition.status !== 'assigned') {
      toast.error('Esta petição não pode ser declinada no status atual.');
      return;
    }
    
    // Calcular multa
    const petitionValue = petition.price || 60;
    const penaltyAmount = petitionValue * 0.5;
    
    // Confirmar ação
    const confirmed = window.confirm(
      `⚠️ ATENÇÃO: Você tem certeza que não conseguirá entregar esta petição a tempo?\n\n` +
      `• Multa de 50% será aplicada: R$ ${penaltyAmount.toFixed(2)}\n` +
      `• A petição será reatribuída para outro redator\n` +
      `• Seu contador de atrasos será incrementado\n\n` +
      `Deseja continuar?`
    );
    
    if (!confirmed) return;
    
    setDecliningPetition(petitionId);
    
    try {
      const { data, error } = await supabase.rpc('decline_petition', {
        petition_id: petitionId,
        writer_id: user.uid
      });
      
      if (error) {
        console.error('Erro ao declinar petição:', error);
        toast.error(`Erro ao declinar petição: ${error.message || 'Tente novamente.'}`);
        return;
      }
      
      if (data?.success) {
        toast.error(
          `🚨 Petição declinada! Multa de R$ ${data.penalty_amount.toFixed(2)} aplicada. ` +
          `A petição foi reatribuída para outro redator.`,
          { duration: 8000 }
        );
        
        // Recarregar petições
        const updatedPetitions = await DatabaseService.getWriterPetitions(user.uid);
        if (updatedPetitions) {
          setPetitions(updatedPetitions);
        }
        
        // Fechar modal se estiver aberto
        setSelectedPetition(null);
      } else {
        toast.error(data?.error || 'Erro ao declinar petição.');
      }
    } catch (err) {
      console.error('Erro ao declinar petição:', err);
      toast.error('Erro ao declinar petição. Tente novamente.');
    } finally {
      setDecliningPetition(null);
    }
  }

  // ========= Atualiza status manual, se precisar =========
  async function handleStatusUpdate(petitionId: string, newStatus: WriterStatus) {
    try {
      await supabase
        .from('petitions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', petitionId);

      // @ts-ignore
      setPetitions(prev => prev.map(p => (p.id === petitionId ? { ...p, status: newStatus } : p)));
      toast.success('Status atualizado!');
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível atualizar o status.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Petições</h1>
        <p className="text-muted-foreground">Gerencie seus trabalhos em andamento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card><CardContent className="pt-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">{petitions.filter(p => p.status === 'in_progress').length}</p>
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="pt-6">
          <div className="flex items-center">
            <RefreshCcw className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Em Revisão</p>
              <p className="text-2xl font-bold">{petitions.filter(p => (p.status as string) === 'revision').length}</p>
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="pt-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Pendente Revisão</p>
              {/* @ts-ignore */}
              <p className="text-2xl font-bold">{petitions.filter(p => p.status === 'pending_review').length}</p>
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="pt-6">
          <div className="flex items-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold">{petitions.filter(p => p.status === 'completed' || p.status === 'approved').length}</p>
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="pt-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Valor</p>
              <p className="text-2xl font-bold">R$ {petitions.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </CardContent></Card>
      </div>

      {/* Tabela de Trabalhos */}
      <Card>
        <CardHeader>
          <CardTitle>Trabalhos Ativos</CardTitle>
          <p className="text-sm text-muted-foreground whitespace-nowrap">Acompanhe o progresso dos seus trabalhos</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Petição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {petitions.filter(p => p.status !== 'approved').map((petition) => {
                const info = statusConfig[(petition.status as WriterStatus) || 'in_progress'];
                const StatusIcon = info.icon;
                const daysLeft = calculateDaysLeft(petition.deadline);

                return (
                  <TableRow key={petition.id}>
                    <TableCell>
                      <div className="font-medium">{petition.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {petition.display_id || `#${petition.id.substring(0, 8)}`} • {petition.type}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {(petition.status as string) === 'revision' && (
                          <Badge className="bg-orange-600 text-white text-xs animate-pulse">
                            <RefreshCcw className="h-3 w-3 mr-1" />
                            Correção Solicitada
                          </Badge>
                        )}
                        {petition.requires_labor_calculation && !petition.calculation_id && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            <Calculator className="h-3 w-3 mr-1" />
                            Requer Cálculo
                          </Badge>
                        )}
                        {petition.calculation_id && (
                          <Badge className="bg-green-500 text-white text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Cálculo Anexado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{petition.client_name}</TableCell>
                    <TableCell>
                      <Badge className={info.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {info.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-orange-600" style={{ width: `${calculateProgress(petition.status)}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground">{calculateProgress(petition.status)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {petition.deadline ? (
                        <span className={daysLeft !== null && daysLeft <= 2 ? 'text-red-600 font-medium' : ''}>
                          {new Date(petition.deadline).toLocaleDateString('pt-BR')}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>R$ {(petition.price || 0).toLocaleString()}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {petition.requires_labor_calculation && !petition.calculation_id && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate('/writer/calculator', {
                              state: { 
                                petitionId: petition.id,
                                petitionTitle: petition.title,
                                clientName: petition.client_name 
                              }
                            })}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <Calculator className="h-4 w-4 mr-1" />
                            Fazer Cálculo
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPetition(petition);
                                setSelectedFile(null);
                                setUploadNote('');
                              }}
                            >
                              Detalhes
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{selectedPetition?.title || petition.title}</DialogTitle>
                              <DialogDescription>Faça upload da entrega e envie para revisão</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              {/* Cliente / Valor */}
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Cliente</label>
                                  <p className="text-foreground">{selectedPetition?.client_name || petition.client_name}</p>
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Valor</label>
                                  <p className="text-foreground">R$ {(selectedPetition?.price || petition.price || 0).toLocaleString()}</p>
                                </div>
                              </div>

                              {/* Arquivos Recebidos (download) */}
                              <div>
                                <label className="block text-sm font-semibold text-muted-foreground mb-2">Arquivos Recebidos</label>
                                <div className="space-y-2">
                                  {petitionFiles.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nenhum arquivo recebido.</p>
                                  ) : (
                                    petitionFiles.map((file) => (
                                      <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                        <div className="flex items-center space-x-2">
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm text-foreground truncate max-w-[240px]" title={file.file_name}>
                                            {file.file_name}
                                          </span>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => window.open(file.file_url, '_blank')}
                                        >
                                          <Download className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Upload da Petição (entrega) */}
                              <div>
                                <label className="block text-sm font-semibold text-muted-foreground mb-2">
                                  Upload da Petição (entrega) - <span className="text-orange-500">Apenas DOC/DOCX</span>
                                </label>
                                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted">
                                  <div className="text-3xl mb-2">📄</div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    Arraste o arquivo <strong>.DOC</strong> ou <strong>.DOCX</strong> aqui ou clique para selecionar
                                  </p>
                                  <p className="text-xs text-orange-600 mb-3">
                                    ⚠️ Apenas arquivos editáveis para facilitar a correção
                                  </p>

                                  <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setSelectedFile(file);
                                        toast.success('Arquivo selecionado!');
                                      }
                                    }}
                                  />

                                  <div className="flex items-center justify-center gap-2">
                                    <Button type="button" onClick={() => inputRef.current?.click()} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2">
                                      <Upload className="h-4 w-4 mr-2" />
                                      Selecionar Arquivo
                                    </Button>

                                    {selectedFile && (
                                      <Button variant="outline" type="button" onClick={() => setSelectedFile(null)}>
                                        <X className="h-4 w-4 mr-2" />
                                        Limpar
                                      </Button>
                                    )}
                                  </div>

                                  {selectedFile && (
                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                                      <span className="text-sm text-green-700 font-medium">Selecionado: {selectedFile.name}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Botão de upload efetivo */}
                              </div>

                              {/* Observações */}
                              <div className="space-y-3">
                                <div className="rounded border border-amber-500/30 bg-amber-500/5 p-3">
                                  <div className="flex items-center justify-between text-xs text-amber-200 mb-1">
                                    <span className="font-semibold">Observações do cliente</span>
                                    {selectedPetition?.created_at && (
                                      <span>{new Date(selectedPetition.created_at).toLocaleDateString('pt-BR')}</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-amber-100 whitespace-pre-wrap">
                                    {(selectedPetition?.description || petition.description || '').trim()
                                      ? selectedPetition?.description || petition.description
                                      : 'O cliente não deixou observações específicas.'}
                                  </p>
                                </div>

                                {/* Observações do cliente (correção solicitada) */}
                                {clientCorrectionNote && (
                                  <div className="rounded border border-orange-500/40 bg-orange-500/5 p-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-orange-200 mb-1 gap-1">
                                      <span className="font-semibold">
                                        Observações do cliente (Correção solicitada)
                                        {clientCorrectionNote?.status && (
                                          <> • {correctionStatusLabels[clientCorrectionNote.status] || clientCorrectionNote.status}</>
                                        )}
                                      </span>
                                      {clientCorrectionNote?.updated_at && (
                                        <span>{new Date(clientCorrectionNote.updated_at).toLocaleString('pt-BR')}</span>
                                      )}
                                    </div>
                                    <p className="text-sm text-orange-100 whitespace-pre-wrap">
                                      {clientCorrectionNote.note}
                                    </p>
                                  </div>
                                )}

                                {/* Observações do admin */}
                                <div className="rounded border border-blue-500/40 bg-blue-500/5 p-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-blue-200 mb-1 gap-1">
                                    <span className="font-semibold">
                                      Observações do admin
                                      {adminReturnNote?.status && (
                                        <> • {correctionStatusLabels[adminReturnNote.status] || adminReturnNote.status}</>
                                      )}
                                    </span>
                                    {adminReturnNote?.updated_at && (
                                      <span>{new Date(adminReturnNote.updated_at).toLocaleString('pt-BR')}</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-blue-100 whitespace-pre-wrap">
                                    {adminReturnNote?.note?.trim()
                                      ? adminReturnNote.note
                                      : 'Ainda não há observações do admin.'}
                                  </p>
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-muted-foreground mb-2">
                                    Observações do redator
                                  </label>
                                  <Textarea
                                    placeholder="Adicione observações sobre o trabalho..."
                                    value={uploadNote}
                                    onChange={(e) => setUploadNote(e.target.value)}
                                    className="w-full resize-none h-16 bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  />
                                </div>
                              </div>

                              {/* Ações */}
                              <div className="pt-2 space-y-3">
                                {/* Redator sempre envia para o cliente - o cliente decide se quer revisão humana */}
                                <Button
                                  onClick={() => handleSendDirectlyToClient(petition.id)}
                                  disabled={isDirectDeliveryLoading}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isDirectDeliveryLoading
                                    ? 'Enviando para cliente...'
                                    : 'Enviar para Cliente'}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                  O cliente receberá a petição e poderá aprovar, solicitar correções ou solicitar revisão humana conforme seu plano.
                                </p>
                                
                                {/* Botão para declinar petição - apenas para petições em andamento */}
                                {(selectedPetition?.status === 'in_progress' || selectedPetition?.status === 'assigned' || petition.status === 'in_progress' || petition.status === 'assigned') && (
                                  <div className="pt-2 border-t">
                                    <Button
                                      onClick={() => handleDeclinePetition(selectedPetition?.id || petition.id)}
                                      disabled={decliningPetition === (selectedPetition?.id || petition.id)}
                                      variant="destructive"
                                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 disabled:opacity-50"
                                    >
                                      {decliningPetition === (selectedPetition?.id || petition.id) ? (
                                        <>
                                          <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                                          Processando...
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircle className="h-4 w-4 mr-2" />
                                          Não conseguirei entregar a tempo
                                        </>
                                      )}
                                    </Button>
                                    <p className="text-xs text-red-600 text-center mt-2 font-medium">
                                      ⚠️ Multa de 50% será aplicada e a petição será reatribuída
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Chat */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate('/writer/chat', {
                              state: {
                                chatType: 'client',
                                clientName: petition.client_name,
                                petitionId: petition.id,
                                petitionTitle: petition.title,
                                autoSelect: true
                              }
                            })
                          }
                          className="hover:bg-blue-50 hover:border-blue-300 cursor-pointer"
                          title="Abrir chat"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Histórico de Petições Aprovadas pelo Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
          <p className="text-sm text-muted-foreground">Petições aprovadas e finalizadas pelo cliente</p>
        </CardHeader>
        <CardContent>
          {petitions.filter(p => p.status === 'approved').length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma petição concluída ainda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Petição</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {petitions
                  .filter(p => p.status === 'approved')
                  .map((petition) => {
                    const info = statusConfig[(petition.status as WriterStatus) || 'completed'];
                    const StatusIcon = info.icon;

                    return (
                      <TableRow key={petition.id}>
                        <TableCell>
                          <div className="font-medium">{petition.title}</div>
                          <div className="text-sm text-muted-foreground">{petition.type}</div>
                          {petition.calculation_id && (
                            <Badge className="bg-green-500 text-white text-xs mt-1">
                              <Calculator className="h-3 w-3 mr-1" />
                              Com Cálculo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{petition.client_name}</TableCell>
                        <TableCell>
                          <Badge className={info.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {info.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {petition.deadline
                            ? new Date(petition.deadline).toLocaleDateString('pt-BR')
                            : 'Sem prazo'}
                        </TableCell>
                        <TableCell>R$ {(petition.price || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {/* Ver Detalhes */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPetition(petition)}
                                  className="hover:bg-blue-50 hover:border-blue-300"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{petition.title}</DialogTitle>
                                  <DialogDescription>Detalhes da petição aprovada pelo cliente</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Cliente</h4>
                                    <p className="text-sm text-muted-foreground">{petition.client_name}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Descrição</h4>
                                    <p className="text-sm text-muted-foreground">{petition.description}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Status</h4>
                                    <Badge className={info.color}>
                                      <StatusIcon className="h-3 w-3 mr-1" />
                                      {info.label}
                                    </Badge>
                                  </div>
                                  {(petitionFiles?.length ?? 0) > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-2">Arquivos do Cliente</h4>
                                      <div className="space-y-2">
                                        {petitionFiles.map((file) => (
                                          <div key={file.id} className="flex items-center justify-between border rounded p-2">
                                            <div className="flex items-center space-x-2">
                                              <FileText className="h-4 w-4 text-muted-foreground" />
                                              <span className="text-sm">{file.file_name}</span>
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => window.open(file.file_url, '_blank')}
                                            >
                                              <Download className="h-4 w-4 mr-2" />
                                              Baixar
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={resendingAcceptanceEmails}
                                      onClick={() => handleResendAcceptanceEmails(petition.id)}
                                      className="flex items-center gap-2"
                                    >
                                      <RefreshCcw className={`h-4 w-4 ${resendingAcceptanceEmails ? 'animate-spin' : ''}`} />
                                      {resendingAcceptanceEmails ? 'Reenviando...' : 'Reenviar emails de aceite'}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Chat */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate('/writer/chat', {
                                  state: {
                                    chatType: 'client',
                                    clientName: petition.client_name,
                                    petitionId: petition.id,
                                    petitionTitle: petition.title,
                                    autoSelect: true
                                  }
                                })
                              }
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}