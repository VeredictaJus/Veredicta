/* @ts-nocheck */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { supabase } from '@/lib/supabaseClient'
import { createClient } from '@supabase/supabase-js';
import { Download, Upload, CheckCircle2, RefreshCcw, Loader2, FileDown } from 'lucide-react';
import { CalculatorExportService } from '@/services/calculatorExportService';
import { EmailService } from '@/services/emailService';
import { addBusinessDays, setDeadlineCutoff } from '@/utils/businessDays';

// ✅ CORREÇÃO CRÍTICA: Suprimir aviso de múltiplas instâncias ANTES de criar qualquer cliente
if (typeof window !== 'undefined' && !(window as any).__SUPPRESS_GT_CLIENT_WARNING) {
  (window as any).__SUPPRESS_GT_CLIENT_WARNING = true;
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = typeof args[0] === 'string' ? args[0] : String(args[0] || '');
    if (message.includes('Multiple GoTrueClient instances')) {
      // Suprimir apenas este aviso específico
      return;
    }
    originalWarn.apply(console, args);
  };
}

// 🚀 Cliente Supabase com Service Role para operações admin (SINGLETON)
let adminClientInstance: any = null;

// ✅ CORREÇÃO: Criar storage isolado com namespace único para evitar detecção de múltiplas instâncias
const createIsolatedStorage = () => {
  const namespace = `veredicta-admin-${crypto.randomUUID()}`;
  return {
    getItem: (key: string) => {
      try {
        return localStorage.getItem(`${namespace}:${key}`);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(`${namespace}:${key}`, value);
      } catch {
        // Ignorar erros de storage
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(`${namespace}:${key}`);
      } catch {
        // Ignorar erros de storage
      }
    },
    clear: () => {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(namespace)) {
            localStorage.removeItem(key);
          }
        });
      } catch {
        // Ignorar erros de storage
      }
    },
    get length() {
      try {
        const keys = Object.keys(localStorage);
        return keys.filter(key => key.startsWith(namespace)).length;
      } catch {
        return 0;
      }
    },
    key: (index: number) => {
      try {
        const keys = Object.keys(localStorage).filter(key => key.startsWith(namespace));
        return keys[index] || null;
      } catch {
        return null;
      }
    },
  };
};

const getAdminClient = () => {
  if (!adminClientInstance) {
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (serviceRoleKey) {
      // ✅ CORREÇÃO: Criar cliente com storage completamente isolado
      const isolatedStorage = createIsolatedStorage();
      
      adminClientInstance = createClient(
        import.meta.env.VITE_SUPABASE_URL as string,
        serviceRoleKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storage: isolatedStorage,
            // ✅ CORREÇÃO: Usar storageKey único baseado em UUID para garantir isolamento completo
            storageKey: `veredicta-admin-auth-${crypto.randomUUID()}`,
            flowType: 'pkce',
          },
          global: {
            headers: {
              'X-Client-Info': 'veredicta-admin-service-role',
            },
          },
        }
      );
    } else {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Service role key não encontrada, usando cliente normal');
      }
      adminClientInstance = supabase;
    }
  }
  
  return adminClientInstance;
};

type Correction = {
  id: string;
  created_at: string;
  petition_id: string | null;
  user_id: string | null;
  mode?: string | null;
  original_text?: string | null;
  corrected_text?: string | null;
  status?: string | null;
  notes?: string | null;
  writer_observation?: string | null;
  petitions?: { title?: string | null };
};

type Petition = {
  id: string;
  title: string;
  client_id?: string | null;
  client_name?: string | null;
  description?: string | null;
  status?: string | null;
  deadline?: string | null;
  display_id?: string | null;
  assigned_writer_id?: string | null;
  correction_requested_at?: string | null;
};

type PetitionFile = {
  id: string;
  petition_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string | null;
  created_at: string;
};

const BUCKET = 'petitions_correction_writer'; // Bucket para petições enviadas pelos redatores para correção

// 🚀 FASE 4: Função para desativar conversa quando petição é concluída
async function deactivateConversationForCompletedPetition(petitionId: string): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log('🔍 Desativando conversa para petição concluída:', petitionId);
    }

    // 1. Buscar dados da petição
    const { data: petition, error: petitionError } = await supabase
      .from('petitions')
      .select('id, title, client_id, assigned_writer_id')
      .eq('id', petitionId)
      .single();

    if (petitionError || !petition) {
      throw new Error(`Petição não encontrada: ${petitionError?.message}`);
    }

    const clientId = petition.client_id;
    const writerId = petition.assigned_writer_id;

    if (!clientId || !writerId) {
      if (import.meta.env.DEV) {
        console.log('⚠️ Petição sem cliente ou redator definido, pulando desativação');
      }
      return;
    }

    if (import.meta.env.DEV) {
      console.log('📋 Dados da petição:', { clientId, writerId, title: petition.title });
    }

    // 2. Buscar conversas ativas entre cliente e redator
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        id, title, status,
        conversation_participants!inner(user_id, role)
      `)
      .eq('type', 'petition')
      .neq('status', 'archived')
      .neq('status', 'closed');

    if (conversationsError) {
      throw new Error(`Erro ao buscar conversas: ${conversationsError.message}`);
    }

    // Filtrar conversas onde ambos os usuários são participantes
    const activeConversations = conversations?.filter(conv => {
      const participants = conv.conversation_participants;
      const userIds = participants.map((p: any) => p.user_id);
      return userIds.includes(clientId) && userIds.includes(writerId);
    }) || [];

    if (activeConversations.length === 0) {
      if (import.meta.env.DEV) {
        console.log('⚠️ Nenhuma conversa ativa encontrada para desativar');
      }
      return;
    }

    if (import.meta.env.DEV) {
      console.log(`📋 Encontradas ${activeConversations.length} conversas ativas`);
    }

    // 3. Desativar todas as conversas ativas
    for (const conversation of activeConversations) {
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      if (updateError) {
        console.error(`❌ Erro ao desativar conversa ${conversation.id}:`, updateError);
      } else {
        if (import.meta.env.DEV) {
          console.log(`✅ Conversa desativada: ${conversation.id}`);
        }
      }
    }

    // 4. Mensagem final removida - agora será enviada apenas quando cliente aprovar (RatingModal.tsx)

    if (import.meta.env.DEV) {
      console.log('🎉 Desativação automática de conversas concluída!');
    }

  } catch (error) {
    console.error('❌ Erro ao desativar conversas automaticamente:', error);
    throw error;
  }
}

export default function Revisoes() {
  const { user } = useNewAuth();
  const [pending, setPending] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(false);

  const [active, setActive] = useState<Correction | null>(null);
  const [petition, setPetition] = useState<Petition | null>(null);
  const [files, setFiles] = useState<PetitionFile[]>([]);
  const [calculation, setCalculation] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [writerObservation, setWriterObservation] = useState<string | null>(null);

  const [correctedFile, setCorrectedFile] = useState<File | null>(null);
  const correctedInputRef = useRef<HTMLInputElement | null>(null);

  // ========= Carregar pendências =========
  async function loadPending() {
    try {
      setLoading(true);
      const adminClient = getAdminClient();
      const { data, error } = await adminClient
        .from('corrections')
        .select(`
          id,
          created_at,
          petition_id,
          user_id,
          mode,
          original_text,
          corrected_text,
          status,
          notes,
          writer_observation,
          petitions!inner ( title )
        `)
        .eq('status', 'pending')
        .neq('mode', 'client_request') // Excluir correções solicitadas pelo cliente
        .order('created_at', { ascending: false })
        .limit(500); // ✅ OTIMIZAÇÃO: Limitar a 500 correções pendentes

      if (error) throw error;
      
      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log('✅ Pendências carregadas (apenas do redator):', data);
      }
      
      // Processar data para garantir que petitions seja objeto único
      const processedData = (data || []).map((item: any) => ({
        ...item,
        petitions: Array.isArray(item.petitions) ? item.petitions[0] : item.petitions
      }));
      setPending(processedData);
    } catch (err) {
      console.error('❌ Erro ao carregar pendências:', err);
      toast.error('Falha ao carregar pendências.');
    } finally {
      setLoading(false);
    }
  }

  // ========= Abrir detalhes =========
  async function openDetails(corr: Correction) {
    try {
      setActive(corr);
      setCorrectedFile(null);
      setAdminNotes(corr.notes || '');
      setWriterObservation(null);

      if (!corr.petition_id) {
        setPetition(null);
        setFiles([]);
        setCalculation(null);
        return;
      }

      const adminClient = getAdminClient();
      
      // ✅ OTIMIZAÇÃO: Paralelizar queries (petição, arquivos, correções)
      const [petitionResult, filesResult, correctionsResult] = await Promise.all([
        // Buscar petição
        adminClient
          .from('petitions')
          .select('id, title, type, status, client_id, assigned_writer_id, client_name, writer_name, price, description, delivered_file, calculation_id, created_at, deadline, updated_at')
          .eq('id', corr.petition_id)
          .single(),
        
        // Buscar arquivos via adminClient (bypass RLS)
        adminClient
          .from('petition_files')
          .select('id, petition_id, file_url, file_name, file_size, file_type, uploaded_by, created_at, updated_at')
          .eq('petition_id', corr.petition_id)
          .order('created_at', { ascending: false })
          .limit(100),
        
        // Buscar observações do redator (histórico completo limitado)
        adminClient
          .from('corrections')
          .select('writer_observation, id, created_at, status')
          .eq('petition_id', corr.petition_id)
          .not('writer_observation', 'is', null)
          .order('updated_at', { ascending: false })
          .limit(50) // ✅ OTIMIZAÇÃO: Limitar a 50 correções (mantém histórico recente completo)
      ]);

      const { data: p, error: petitionError } = petitionResult;
      const { data: files1, error: error1 } = filesResult;
      const { data: allCorrections } = correctionsResult;
      
      if (petitionError) {
        if (import.meta.env.DEV) {
          console.error('Erro ao buscar petição:', petitionError);
        }
        toast.error('Erro ao carregar dados da petição');
      }

      // ✅ OTIMIZAÇÃO: Usar apenas adminClient (remover query duplicada)
      let f: any[] = files1 || [];
      
      // Verificar se há delivered_file na petição (formato antigo)
      if (p?.delivered_file && f.length === 0) {
        // Adicionar como arquivo virtual
        f = [{
          id: 'delivered_file_' + p.id,
          petition_id: p.id,
          file_name: 'Petição Entregue',
          file_url: p.delivered_file,
          file_type: 'application/pdf',
          file_size: 0,
          uploaded_by: p.assigned_writer_id,
          created_at: p.updated_at || p.created_at
        }];
      }

      if (error1 && f.length === 0) {
        if (import.meta.env.DEV) {
          console.error('Erro ao buscar arquivos:', error1);
        }
        toast.error('Erro ao carregar arquivos da petição');
      }

      setPetition(p || null);
      setFiles(f);

      // Buscar observações do redator de qualquer correção relacionada (histórico completo)
      if (allCorrections && allCorrections.length > 0) {
        const correctionWithObservation = allCorrections.find((c: any) => 
          c.writer_observation && c.writer_observation.trim()
        );
        if (correctionWithObservation) {
          setWriterObservation(correctionWithObservation.writer_observation);
          if (import.meta.env.DEV) {
            console.log('✅ Observações do redator encontradas:', correctionWithObservation.writer_observation);
          }
        } else {
          // Se não encontrou em outras correções, usar a correção ativa
          setWriterObservation(corr.writer_observation || null);
        }
      } else {
        // Se não há outras correções, usar a correção ativa
        setWriterObservation(corr.writer_observation || null);
      }

      // 🚀 Buscar cálculo trabalhista se existir (após ter a petição)
      if (p?.calculation_id) {
        const { data: calc } = await adminClient
          .from('labor_calculations')
          .select('id, user_id, title, description, calculation_data, calculation_result, tags, is_favorite, created_at, updated_at')
          .eq('id', p.calculation_id)
          .single();
        setCalculation(calc || null);
        if (import.meta.env.DEV) {
          console.log('✅ Cálculo trabalhista carregado:', calc);
        }
      } else {
        setCalculation(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível abrir os detalhes.');
    }
  }

  // ========= Download =========
  async function download(path: string) {
    try {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
      if (error || !data?.signedUrl) throw error || new Error('URL não gerada');
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error(err);
      toast.error('Falha ao gerar download.');
    }
  }

  // ========= Upload =========
  async function uploadCorrected() {
    if (!active?.petition_id) return toast.error('Petição inválida.');
    if (!correctedFile) return toast.error('Selecione um arquivo .doc ou .docx.');

    try {
      // Adicionar "_corrigido" ao nome do arquivo
      const originalFileName = correctedFile.name;
      const lastDotIndex = originalFileName.lastIndexOf('.');
      const baseName = lastDotIndex !== -1 ? originalFileName.substring(0, lastDotIndex) : originalFileName;
      const extension = lastDotIndex !== -1 ? originalFileName.substring(lastDotIndex) : '';
      
      const newFileName = `${baseName}_corrigido${extension}`;
      const timestamp = Date.now();
      const safeNewFileName = newFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `${active.petition_id}_${timestamp}_${safeNewFileName}`;

      if (import.meta.env.DEV) {
        console.log('📝 Nome do arquivo corrigido:', newFileName);
        console.log('🔑 Key gerada:', key);
      }

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(key, correctedFile, {
        upsert: true,
        contentType: correctedFile.type || undefined,
      });
      if (upErr) throw upErr;

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(key);

      const adminClient = getAdminClient();
      const { error: recErr } = await adminClient.from('petition_files').insert({
        petition_id: active.petition_id,
        file_name: newFileName, // Usa o nome com "_corrigido"
        file_url: urlData.publicUrl,
        file_type: correctedFile.type || 'application/octet-stream',
        file_size: correctedFile.size,
        uploaded_by: user?.uid ?? null,
      });
      if (recErr) throw recErr;

      toast.success('Arquivo corrigido anexado.');
      setCorrectedFile(null);

      const { data: f } = await adminClient
        .from('petition_files')
        .select('id, petition_id, file_url, file_name, file_size, file_type, uploaded_by, created_at, updated_at')
        .eq('petition_id', active.petition_id)
        .order('created_at', { ascending: false })
        .limit(100);
      setFiles(f || []);
    } catch (err) {
      console.error(err);
      toast.error('Falha ao enviar arquivo corrigido.');
    }
  }

  // ========= Enviar ao cliente =========
  async function sendToClient() {
    if (!active?.petition_id) return toast.error('Petição inválida.');

    const hasCorrected = files.length > 0; // Verificar se há arquivos
    if (!hasCorrected) {
      toast.warning('Anexe o DOC/DOCX corrigido antes de enviar ao cliente.');
      return;
    }

    try {
      const adminClient = getAdminClient();
      // Marcar correção como concluída (completed) para sair da lista
      await adminClient.from('corrections').update({ 
        corrected_text: 'Documento corrigido enviado ao cliente.', 
        status: 'completed' 
      }).eq('id', active.id);

      const { error: updateError } = await adminClient.from('petitions').update({ status: 'delivered', updated_at: new Date().toISOString() }).eq('id', active.petition_id);
      
      if (updateError) {
        console.error('❌ Erro ao atualizar status da petição para delivered:', updateError);
        toast.error('Erro ao atualizar status da petição');
        return;
      }
      
      if (import.meta.env.DEV) {
        console.log('✅ Status da petição atualizado para delivered:', active.petition_id);
      }

      // 🚀 Conversa continua ativa - será desativada apenas quando cliente aprovar

      if (petition?.client_id) {
        await adminClient.from('app_2d8133c678_notifications').insert({
          user_id: petition.client_id,
          type: 'petition_delivered',
          title: 'Sua petição foi entregue',
          message: `A petição "${petition.title}" foi corrigida e entregue.`,
          priority: 'normal',
          is_read: false,
          related_entity_type: 'petition',
          related_entity_id: petition.id,
          action_url: '/client/petitions',
          meta: { petitionId: petition.id },
        });
        
        // Enviar email de petição concluída/entregue ao cliente
        try {
          const { data: clientProfile } = await adminClient
            .from('user_profiles')
            .select('email, full_name, company_name')
            .eq('firebase_uid', petition.client_id)
            .single();

          const writerUid = petition.assigned_writer_id || active.user_id || null;
          let writerName = 'redator';

          if (writerUid) {
            const { data: writerProfile } = await adminClient
              .from('user_profiles')
              .select('full_name, company_name, email')
              .eq('firebase_uid', writerUid)
              .maybeSingle();

            writerName =
              writerProfile?.full_name ||
              writerProfile?.company_name ||
              writerProfile?.email?.split('@')[0] ||
              writerName;
          }

          if (clientProfile?.email) {
            const clientName =
              clientProfile.full_name ||
              clientProfile.company_name ||
              clientProfile.email.split('@')[0];

            const petitionDisplayId = petition.display_id || petition.id;
            const emailPetitionId =
              petitionDisplayId && petitionDisplayId.trim().length > 0
                ? petitionDisplayId
                : petition.id;
            const petitionTitle =
              petition.title || `Petição ${emailPetitionId}`;

            const statusBeforeSend = (petition.status || '').toLowerCase();
            const isProofreading =
              statusBeforeSend.includes('proof')
              || statusBeforeSend.includes('revisao_final')
              || statusBeforeSend.includes('final_review');

            if (isProofreading) {
              await EmailService.sendClientPetitionReturnedFromProofreadingEmail(
                clientProfile.email,
                clientName,
                emailPetitionId,
                petitionTitle
              );
              if (import.meta.env.DEV) {
                console.log('📧 Email de revisão final enviada ao cliente:', clientProfile.email);
              }
            } else {
              await EmailService.sendClientPetitionReturnedFromRevisionEmail(
                clientProfile.email,
                clientName,
                emailPetitionId,
                petitionTitle,
                writerName
              );
              if (import.meta.env.DEV) {
                console.log('📧 Email de correções finalizadas enviado ao cliente:', clientProfile.email);
              }
            }

            const completedSent = await EmailService.sendPetitionCompletedEmail(
              clientProfile.email,
              clientName,
              petitionTitle
            );

            if (import.meta.env.DEV) {
              if (completedSent) {
                console.log('📧 Email de petição concluída enviado ao cliente:', clientProfile.email);
              } else {
                console.warn('⚠️ Falha ao enviar email de petição concluída para:', clientProfile.email);
              }
            }
          }
        } catch (emailError) {
          console.error('⚠️ Erro ao enviar email de retorno ao cliente:', emailError);
          // Não falhar o envio se o email falhar
        }
      }

      toast.success('Enviado ao cliente.');
      setActive(null);
      setAdminNotes('');
      await loadPending();
    } catch (err) {
      console.error(err);
      toast.error('Falha ao enviar ao cliente.');
    }
  }

  // ========= Devolver ao Redator =========
  async function returnToWriter() {
    if (!active?.petition_id || !active?.id) return toast.error('Dados inválidos.');

    try {
      const adminClient = getAdminClient();
      const petitionDisplayId =
        petition?.display_id ??
        petition?.id ??
        active.petition_id ??
        '';
      const petitionTitle = petition?.title || 'Sua petição';
      
      const notesToSend = adminNotes.trim() || null;

      // Verificar se já foi solicitada correção antes (para não adicionar +1 dia novamente)
      // Verificar ANTES de cancelar a correção atual
      const { data: existingCorrections } = await adminClient
        .from('corrections')
        .select('id, status')
        .eq('petition_id', active.petition_id)
        .neq('status', 'cancelled'); // Excluir correções canceladas

      // Se há mais de 1 correção (além da atual), já houve correções antes
      // Se há apenas 1 correção (a atual), é a primeira correção
      const isFirstCorrection = !existingCorrections || existingCorrections.length <= 1;
      const hadCorrectionBefore = petition && 'correction_requested_at' in petition && petition.correction_requested_at !== null;

      // Atualizar status da correção para 'cancelled'
      await adminClient
        .from('corrections')
        .update({ 
          status: 'cancelled',
          corrected_text: 'Devolvida ao redator pelo admin.',
          notes: notesToSend,
          updated_at: new Date().toISOString()
        })
        .eq('id', active.id);

      // Só adicionar 1 dia útil se for a primeira correção/devolução
      let newDeadline: string | null = null;
      if (isFirstCorrection && !hadCorrectionBefore) {
        try {
          const today = new Date();
          const extendedDate = setDeadlineCutoff(addBusinessDays(today, 1));
          newDeadline = extendedDate.toISOString();
          if (import.meta.env.DEV) {
            console.log(`📅 Primeira devolução para correção: Novo prazo = ${newDeadline}`);
            console.log(`📅 Data formatada: ${extendedDate.toLocaleDateString('pt-BR')} às ${extendedDate.toLocaleTimeString('pt-BR')}`);
            console.log(`📅 Prazo anterior: ${petition?.deadline || 'N/A'}`);
          }
        } catch (deadlineError) {
          if (import.meta.env.DEV) {
            console.warn('⚠️ Não foi possível calcular novo prazo:', deadlineError);
          }
        }
      } else {
        if (import.meta.env.DEV) {
          console.log(`📅 Devolução subsequente: Mantendo prazo atual (não adiciona +1 dia)`);
        }
        newDeadline = petition?.deadline || null;
      }

      // Atualizar a petição
      const { data: updatedPetition } = await adminClient
        .from('petitions')
        .update({ 
          status: 'in_progress',
          deadline: newDeadline, // Atualizar apenas se for primeira correção
          updated_at: new Date().toISOString()
        })
        .eq('id', active.petition_id)
        .select('deadline'); // Retornar o deadline atualizado para verificar

      // Verificar se o prazo foi atualizado corretamente
      if (updatedPetition && updatedPetition.length > 0) {
        if (import.meta.env.DEV) {
          console.log(`✅ Prazo atualizado no banco: ${updatedPetition[0].deadline}`);
        }
        // Atualizar o estado da petição com o novo prazo
        setPetition(prev => prev ? { ...prev, deadline: updatedPetition[0].deadline } : null);
      }

      // Notificar redator
      if (active.user_id) {
        await adminClient.from('app_2d8133c678_notifications').insert({
          user_id: active.user_id,
          type: 'correction_returned',
          title: 'Petição devolvida',
          message: `A petição "${petition?.title || 'sua petição'}" foi devolvida para ajustes.`,
          priority: 'normal',
          is_read: false,
          related_entity_type: 'petition',
          related_entity_id: active.petition_id,
          action_url: '/writer/my-petitions',
          meta: { petitionId: active.petition_id },
        });

        // Enviar email de solicitação de correção
        try {
          const { data: writerProfile } = await adminClient
            .from('user_profiles')
            .select('email, full_name, company_name')
            .eq('firebase_uid', active.user_id)
            .maybeSingle();

          let writerEmail = writerProfile?.email || null;
          let writerName =
            writerProfile?.full_name ||
            writerProfile?.company_name ||
            writerProfile?.email?.split('@')[0] ||
            '';

          if (!writerEmail) {
            const { data: legacyProfile } = await adminClient
              .from('profiles_v2')
              .select('email, full_name, company_name')
              .eq('firebase_uid', active.user_id)
              .maybeSingle();

            writerEmail = legacyProfile?.email || null;
            writerName =
              legacyProfile?.full_name ||
              legacyProfile?.company_name ||
              legacyProfile?.email?.split('@')[0] ||
              writerName;
          }

          if (writerEmail) {
            const revisionNotes =
              notesToSend ||
              active.notes ||
              active.corrected_text ||
              'O administrador solicitou ajustes na petição. Verifique os comentários e anexos na plataforma.';

            const petitionIdForEmail = petitionDisplayId || petition?.id || 'PETIÇÃO';
            const success = await EmailService.sendRevisionRequestEmail(
              writerEmail,
              writerName || 'Redator',
              petitionIdForEmail,
              petitionTitle,
              revisionNotes
            );

            if (import.meta.env.DEV) {
              if (success) {
                console.log('📧 Email de solicitação de correção enviado ao redator:', writerEmail);
              } else {
                console.warn('⚠️ Falha ao enviar email de solicitação de correção para:', writerEmail);
              }
            }
          } else {
            if (import.meta.env.DEV) {
              console.warn('⚠️ Redator sem email cadastrado; email de correção não enviado.', {
                writerId: active.user_id,
              });
            }
          }
        } catch (emailError) {
          console.error('⚠️ Erro ao enviar email de solicitação de correção:', emailError);
        }
      }

      toast.success('Petição devolvida ao redator com sucesso!');
      setActive(null);
      setAdminNotes('');
      await loadPending();
    } catch (err) {
      console.error('❌ Erro ao devolver ao redator:', err);
      toast.error('Falha ao devolver petição.');
    }
  }

  // ========= Efeito inicial =========
  useEffect(() => {
    loadPending();

    let channel: ReturnType<typeof supabase.channel> | null = null;

    // Função para criar/ativar subscription
    const activateSubscription = () => {
      if (channel) {
        return; // Já existe
      }

      channel = supabase
        .channel('realtime-corrections')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'corrections' }, loadPending)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'corrections' }, loadPending)
        .subscribe();
    };

    // Função para desativar subscription
    const deactivateSubscription = () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
        channel = null;
      }
    };

    // ✅ OTIMIZAÇÃO: Gerenciar subscription baseado na visibilidade da aba
    const handleVisibilityChange = () => {
      if (document.hidden) {
        deactivateSubscription();
      } else {
        activateSubscription();
        loadPending(); // Recarregar ao voltar
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
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, []);

  // 🚀 Como a tabela petition_files não tem coluna 'kind', filtrar por nome/tipo
  const deliveredFiles = useMemo(() => files || [], [files]); // Todos são arquivos entregues
  const correctedFiles = useMemo(() => [], [files]); // Por enquanto não temos correctedFiles

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Revisões</h1>
        <p className="text-sm text-muted-foreground">Controle de revisões e correções de petições</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1 text-center">
            <CardTitle>Petições Pendentes de Correção</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Itens que aguardam revisão humana.</p>
          </div>
          <Button variant="outline" onClick={loadPending} className="gap-2 flex-shrink-0 ml-4" disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Criada em</TableHead>
                <TableHead>Petição</TableHead>
                <TableHead className="w-[140px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    Nenhuma pendência no momento.
                  </TableCell>
                </TableRow>
              ) : (
                pending.map((corr) => (
                  <TableRow key={corr.id}>
                    <TableCell>{new Date(corr.created_at).toLocaleString()}</TableCell>
                    <TableCell>{corr.petitions?.title || corr.petition_id || '—'}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => openDetails(corr)}>
                            Abrir
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Correção #{corr.id}</DialogTitle>
                            <DialogDescription>{petition?.title ? `Petição: ${petition.title}` : 'Detalhes da petição.'}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 mt-4">
                            <div className="p-3 rounded border border-amber-500/30 bg-amber-500/5">
                              <p className="font-semibold text-amber-200 mb-1">Observações do cliente</p>
                              <p className="text-sm text-amber-50 whitespace-pre-wrap">
                                {petition?.description?.trim()
                                  ? petition?.description
                                  : 'O cliente não adicionou observações específicas.'}
                              </p>
                            </div>
                            <div className="p-3 rounded border border-blue-500/40 bg-blue-500/5">
                              <p className="font-semibold text-blue-200 mb-1">Observações do redator</p>
                              <p className="text-sm text-blue-50 whitespace-pre-wrap">
                                {(writerObservation || active?.writer_observation || corr.writer_observation)?.trim()
                                  ? (writerObservation || active?.writer_observation || corr.writer_observation)
                                  : 'O redator ainda não adicionou observações.'}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2 mt-4">
                            <h4 className="font-semibold">Observações do admin</h4>
                            <Textarea
                              value={active?.id === corr.id ? adminNotes : corr.notes || ''}
                              onChange={(e) => {
                                if (active?.id === corr.id) {
                                  setAdminNotes(e.target.value);
                                }
                              }}
                              placeholder="Descreva quais ajustes o redator deve fazer..."
                            />
                            <p className="text-xs text-muted-foreground">
                              Essas observações serão enviadas ao redator ao devolver a petição.
                            </p>
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
                          
                          {/* Arquivos entregues */}
                          <div className="space-y-2">
                            <h4 className="font-semibold">Arquivos da Petição</h4>
                            {deliveredFiles.length === 0 && !calculation ? (
                              <p className="text-sm text-muted-foreground">Nenhum arquivo anexado.</p>
                            ) : deliveredFiles.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Nenhum PDF de petição anexado.</p>
                            ) : (
                              deliveredFiles.map((f) => (
                                    <div key={f.id} className="flex items-center justify-between border rounded p-2">
                                      <span className="truncate max-w-[70%]">{f.file_name || 'Arquivo'}</span>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                    onClick={async () => {
                                      try {
                                        // Se a URL já é uma URL pública válida, usar diretamente
                                        if (f.file_url && (f.file_url.startsWith('http://') || f.file_url.startsWith('https://'))) {
                                          // Verificar se é uma URL do Supabase Storage
                                          if (f.file_url.includes('/storage/v1/object/public/')) {
                                            // URL pública, abrir diretamente
                                            window.open(f.file_url, '_blank');
                                            return;
                                          } else if (f.file_url.includes('/storage/v1/object/sign/')) {
                                            // URL já assinada, usar diretamente
                                            window.open(f.file_url, '_blank');
                                            return;
                                          }
                                        }
                                        
                                        // Tentar extrair o path do arquivo da URL
                                        try {
                                          const url = new URL(f.file_url);
                                          const pathParts = url.pathname.split('/');
                                          
                                          // Procurar pelo bucket na URL
                                          let bucketName = BUCKET;
                                          let filePath = '';
                                          
                                          // Se a URL contém o bucket, extrair o path completo
                                          if (url.pathname.includes('/storage/v1/object/')) {
                                            const storageMatch = url.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/);
                                            if (storageMatch) {
                                              bucketName = storageMatch[1];
                                              filePath = storageMatch[2];
                                            } else {
                                              // Fallback: tentar extrair do final da URL
                                              filePath = pathParts[pathParts.length - 1];
                                            }
                                          } else {
                                            // Tentar extrair do pathname
                                            const bucketIndex = pathParts.findIndex(p => p === 'petition_files' || p === 'petitions_correction_writer');
                                            if (bucketIndex >= 0 && bucketIndex < pathParts.length - 1) {
                                              bucketName = pathParts[bucketIndex];
                                              filePath = pathParts.slice(bucketIndex + 1).join('/');
                                            } else {
                                              filePath = pathParts.slice(-2).join('/'); // Últimos 2 segmentos (petition_id/filename)
                                            }
                                          }
                                          
                                          // Gerar URL assinada para bucket privado
                                          const { data, error } = await supabase.storage
                                            .from(bucketName)
                                            .createSignedUrl(filePath, 60 * 60); // 1 hora
                                          
                                          if (error) {
                                            console.error('Erro ao gerar URL assinada:', error);
                                            // Fallback: tentar abrir URL original
                                            window.open(f.file_url, '_blank');
                                            return;
                                          }
                                          
                                          window.open(data.signedUrl, '_blank');
                                        } catch (urlError) {
                                          console.error('Erro ao processar URL:', urlError);
                                          // Fallback: tentar abrir URL original
                                          window.open(f.file_url, '_blank');
                                        }
                                      } catch (err) {
                                        console.error('Erro no download:', err);
                                        toast.error('Erro ao baixar arquivo');
                                      }
                                    }}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))
                            )}
                          </div>
                          {/* Upload corrigido */}
                          <div className="space-y-2 mt-4">
                            <h4 className="font-semibold">Enviar DOC/DOCX corrigido</h4>
                            <input
                              ref={correctedInputRef}
                              type="file"
                              accept=".doc,.docx"
                              className="hidden"
                              onChange={(e) => setCorrectedFile(e.target.files?.[0] || null)}
                            />
                            <div className="flex items-center gap-2">
                              <Button variant="outline" onClick={() => correctedInputRef.current?.click()}>
                                <Upload className="h-4 w-4 mr-2" />
                                Selecionar arquivo
                              </Button>
                              {correctedFile && <span className="text-sm">{correctedFile.name}</span>}
                              {correctedFile && (
                                <Button variant="default" onClick={uploadCorrected}>
                                  Anexar
                                </Button>
                              )}
                            </div>
                          </div>
                          {/* Botões de ação */}
                          <div className="mt-6 flex justify-between">
                            <Button 
                              variant="outline" 
                              className="gap-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                              onClick={returnToWriter}
                            >
                              <RefreshCcw className="h-4 w-4" />
                              Devolver ao Redator
                            </Button>
                            
                            <Button className="gap-2" onClick={sendToClient}>
                              <CheckCircle2 className="h-4 w-4" />
                              Enviar ao cliente
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
