import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PetitionPriority } from '@/types';
import { Upload, FileText, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { ClientProfile } from '@/types';
import { PetitionLimitService } from '@/services/petitionLimitService';
import { supabase } from '@/lib/supabaseClient';
import { PetitionFileService } from '@/services/petitionFileService';
import { useNavigate as useReactRouterNavigate } from 'react-router-dom';
import { PetitionLimitModal } from '@/components/modals/PetitionLimitModal';
import { UserSettingsService } from '@/services/userSettingsService';
import { DatabaseService } from '@/services/databaseService';
import { PlanNotificationService } from '@/services/planNotificationService';
import { calculateBusinessDeadlineFromToday } from '@/utils/businessDays';
import { isClientProfileComplete } from '@/utils/profileCompletion';

// Areas do Direito
const areasDireito = [
  'Direito Civil',
  'Direito Trabalhista', 
  'Direito Penal',
  'Direito Previdenciário',
  'Direito Administrativo',
  'Direito Constitucional',
  'Direito Tributário',
  'Direito Empresarial',
  'Direito do Consumidor',
  'Direito de Família',
  'Direito das Sucessões',
  'Direito Imobiliário',
  'Direito Ambiental',
  'Direito Digital',
  'Direito Bancário',
  'Direito de Trânsito',
  'Direito Eleitoral',
  'Direito Internacional',
  'Direito Comercial',
  'Direito Securitário',
  'Direito Médico',
  'Direito Desportivo',
  'Direito Agrário',
  'Direito Marítimo',
  'Direito Aeronáutico',
  'Direito Militar',
  'Direito Público',
  'Direito Privado'
];

// Tipos de Petições e Recursos
const tiposPeticoes = [
  // PETIÇÕES INICIAIS
  { id: 'peticao_inicial', name: 'Petição Inicial', description: 'Peça processual que inicia uma ação judicial' },
  { id: 'acao_conhecimento', name: 'Ação de Conhecimento', description: 'Ação para reconhecimento de direito' },
  { id: 'acao_execucao', name: 'Ação de Execução', description: 'Ação para cobrança de título executivo' },
  { id: 'acao_cautelar', name: 'Ação Cautelar', description: 'Medida cautelar para preservar direitos' },
  { id: 'acao_usucapiao', name: 'Ação de Usucapião', description: 'Ação para aquisição de propriedade por posse' },
  { id: 'acao_despejo', name: 'Ação de Despejo', description: 'Ação para retomada de imóvel locado' },
  { id: 'acao_cobranca', name: 'Ação de Cobrança', description: 'Ação para cobrança de dívida' },
  { id: 'acao_indenizacao', name: 'Ação de Indenização', description: 'Ação para reparação de danos' },
  { id: 'acao_declaratoria', name: 'Ação Declaratória', description: 'Ação para declaração de direito' },
  { id: 'acao_anulatoria', name: 'Ação Anulatória', description: 'Ação para anulação de ato jurídico' },
  
  // CONTESTAÇÕES E DEFESAS
  { id: 'contestacao', name: 'Contestação', description: 'Resposta do réu à petição inicial' },
  { id: 'impugnacao', name: 'Impugnação', description: 'Contestação em processo de execução' },
  { id: 'excecao_pre_executividade', name: 'Exceção de Pré-executividade', description: 'Defesa em execução sem garantia do juízo' },
  { id: 'embargos_execucao', name: 'Embargos à Execução', description: 'Defesa do executado com garantia do juízo' },
  { id: 'embargos_declaracao', name: 'Embargos de Declaração', description: 'Recurso para esclarecer obscuridades' },
  { id: 'embargos_terceiro', name: 'Embargos de Terceiro', description: 'Defesa de terceiro prejudicado' },
  
  // RECURSOS
  { id: 'recurso_ordinario', name: 'Recurso Ordinário', description: 'Recurso contra decisão de primeira instância' },
  { id: 'apelacao', name: 'Apelação', description: 'Recurso contra sentença' },
  { id: 'agravo_instrumento', name: 'Agravo de Instrumento', description: 'Recurso contra decisões interlocutórias' },
  { id: 'agravo_interno', name: 'Agravo Interno', description: 'Recurso contra decisão monocrática de relator' },
  { id: 'recurso_especial', name: 'Recurso Especial', description: 'Recurso para Superior Tribunal de Justiça' },
  { id: 'recurso_extraordinario', name: 'Recurso Extraordinário', description: 'Recurso para Supremo Tribunal Federal' },
  { id: 'embargos_divergencia', name: 'Embargos de Divergência', description: 'Recurso contra divergência jurisprudencial' },
  { id: 'recurso_mandado_seguranca', name: 'Recurso em Mandado de Segurança', description: 'Recurso em mandado de segurança' },
  
  // PETIÇÕES ESPECÍFICAS
  { id: 'mandado_seguranca', name: 'Mandado de Segurança', description: 'Ação constitucional contra ato ilegal' },
  { id: 'habeas_corpus', name: 'Habeas Corpus', description: 'Ação para proteger liberdade de locomoção' },
  { id: 'habeas_data', name: 'Habeas Data', description: 'Ação para acesso a informações pessoais' },
  { id: 'acao_popular', name: 'Ação Popular', description: 'Ação cidadã contra atos lesivos ao patrimônio público' },
  { id: 'acao_civil_publica', name: 'Ação Civil Pública', description: 'Ação para defesa de interesses difusos' },
  { id: 'medida_cautelar', name: 'Medida Cautelar', description: 'Medida urgente para preservar direitos' },
  { id: 'tutela_urgencia', name: 'Tutela de Urgência', description: 'Pedido de urgência no processo' },
  { id: 'antecipacao_tutela', name: 'Antecipação de Tutela', description: 'Antecipação dos efeitos da sentença' },
  
  // PETIÇÕES TRABALHISTAS
  { id: 'reclamacao_trabalhista', name: 'Reclamação Trabalhista', description: 'Ação inicial na Justiça do Trabalho' },
  { id: 'defesa_trabalhista', name: 'Defesa Trabalhista', description: 'Contestação na Justiça do Trabalho' },
  { id: 'recurso_ordinario_trabalhista', name: 'Recurso Ordinário Trabalhista', description: 'Recurso na Justiça do Trabalho' },
  { id: 'agravo_peticao', name: 'Agravo de Petição', description: 'Recurso em execução trabalhista' },
  { id: 'embargo_declaracao_trabalhista', name: 'Embargo de Declaração Trabalhista', description: 'Recurso para esclarecer decisão trabalhista' },
  
  // OUTROS
  { id: 'peticao_intercorrente', name: 'Petição Intercorrente', description: 'Petição durante o processo' },
  { id: 'manifestacao', name: 'Manifestação', description: 'Manifestação sobre atos processuais' },
  { id: 'alegacoes_finais', name: 'Alegações Finais', description: 'Argumentos finais sobre o mérito' },
  { id: 'memoriais', name: 'Memoriais', description: 'Peça de sustentação oral por escrito' },
  { id: 'razoes_recurso', name: 'Razões de Recurso', description: 'Fundamentação do recurso interposto' },
  { id: 'contrarrazoes', name: 'Contrarrazões', description: 'Resposta às razões de recurso' },
  { id: 'treplica', name: 'Tréplica', description: 'Manifestação final do autor' },
  { id: 'duplica', name: 'Dúplica', description: 'Manifestação final do réu' }
];

// Prioridades baseadas no plano do usuário
const getPrioritiesByPlan = (planCode: string) => {
  switch (planCode) {
    case 'free':
      return [
        { value: 'MEDIUM', label: 'Padrão', days: '3-5 dias úteis', daysNumber: 4 },
      ];
    case 'start':
      return [
        { value: 'MEDIUM', label: 'Padrão', days: '3 dias úteis', daysNumber: 3 },
        { value: 'HIGH', label: 'Alta', days: '2 dias úteis', daysNumber: 2 },
      ];
    case 'pro':
      return [
        { value: 'MEDIUM', label: 'Padrão', days: '2 dias úteis', daysNumber: 2 },
        { value: 'HIGH', label: 'Alta', days: '1-2 dias úteis', daysNumber: 1.5 },
      ];
    case 'elite':
      return [
        { value: 'HIGH', label: 'Prioridade Máxima', days: '1 dia útil', daysNumber: 1 },
      ];
    default:
      return [
        { value: 'MEDIUM', label: 'Padrão', days: '3-5 dias úteis', daysNumber: 4 },
      ];
  }
};

const getBusinessDaysForPriority = (planCode: string, priority: PetitionPriority): number => {
  const planPriorities = getPrioritiesByPlan(planCode);
  const selectedPriority = planPriorities.find(p => p.value === priority);
  const fallback = planPriorities[0]?.daysNumber ?? 4;
  return Math.ceil(selectedPriority?.daysNumber ?? fallback);
};

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File; // Original file object for upload
  uploading?: boolean; // Upload status
  uploaded?: boolean; // Upload completion status
  error?: string; // Upload error message
  fileId?: string;
  fileUrl?: string;
}

export default function NewPetition() {
  const navigate = useNavigate();
  const reactNavigate = useReactRouterNavigate();
  const location = useLocation();
  const { user, loading } = useNewAuth();
  const clientProfile = user as unknown as ClientProfile;
  
  // Declare state variables before any early returns
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as PetitionPriority,
    requiresLaborCalculation: false,
  });
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  // Modal de limite de petições
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitInfo, setLimitInfo] = useState({
    planCode: '',
    usage: 0,
    limit: 0,
    validityDays: 0
  });
  
  // Estados para plano do usuário e prioridades
  const [userPlan, setUserPlan] = useState<string>('free');
  const [priorities, setPriorities] = useState(getPrioritiesByPlan('free'));
  
  // Carregar dados de edição se existir
  useEffect(() => {
    const state = location.state as any;
    if (state?.editMode && state?.petitionData) {
      const petition = state.petitionData;
      
      // Carregar área do direito
      
      if (petition.area) {
        setSelectedArea(petition.area);
        
        // Verificar depois de 100ms se foi setado
        setTimeout(() => {
        }, 100);
      } else {
      }
      
      // Carregar tipo de petição (o campo 'type' já vem como string, ex: "Contestação")
      // Precisamos encontrar o ID correspondente em tiposPeticoes
      const tipoEncontrado = tiposPeticoes.find(t => t.name === petition.type);
      if (tipoEncontrado) {
        setSelectedType(tipoEncontrado.id);
      } else {
        setSelectedType(petition.type || '');
      }
      
      setFormData({
        title: petition.title || '',
        description: petition.description || '',
        priority: (() => {
          // Converter prioridade do banco para o formato do formulário
          const p = (petition.priority || 'normal').toLowerCase();
          if (p === 'urgent') return 'HIGH' as PetitionPriority;
          if (p === 'express') return 'HIGH' as PetitionPriority;
          return 'MEDIUM' as PetitionPriority;
        })(),
        requiresLaborCalculation: petition.requires_labor_calculation || false,
      });
      
      // Carregar arquivos se existirem
      
      if (petition.files && Array.isArray(petition.files) && petition.files.length > 0) {
        const loadedFiles = petition.files.map((filePath: string, index: number) => ({
          id: `existing-${index}`,
          name: filePath.split('/').pop() || `Arquivo ${index + 1}`,
          size: 0, // Não sabemos o tamanho real
          type: filePath.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
          uploaded: true,
          uploading: false
        }));
        setFiles(loadedFiles);
        
        // Verificar depois de 100ms se foi setado
        setTimeout(() => {
        }, 100);
      } else {
      }
      
      toast.info('Editando petição: ' + petition.title);
    }
  }, [location]);

  // Verificar se a petição piloto (free) já foi aprovada; se sim, exigir perfil completo para criar novas petições
  useEffect(() => {
    if (!user?.uid) return;

    const state = location.state as any;
    const isEditMode = state?.editMode && state?.petitionData;
    if (isEditMode) return; // não bloquear edição

    let alive = true;
    (async () => {
      try {
        const { data: approvedPilot, error } = await supabase
          .from('petitions')
          .select('id')
          .eq('client_id', user.uid)
          .eq('is_pilot', true)
          .eq('status', 'approved')
          .limit(1)
          .maybeSingle();

        if (!alive) return;

        // Se a coluna ainda não existir no banco, não bloquear (fail-open)
        const msg = String((error as any)?.message || '');
        const missingPilotColumn =
          (error as any)?.code === '42703' || /column .*is_pilot.* does not exist/i.test(msg);
        if (missingPilotColumn) return;

        if (error) {
          // Em caso de erro, não bloquear para evitar travar o usuário
          return;
        }

        if (!approvedPilot?.id) return;

        const settings = await UserSettingsService.getUserSettings(user.uid);
        if (!alive) return;

        if (!isClientProfileComplete(settings)) {
          toast.error('Para continuar, complete seu cadastro (CPF/CNPJ, telefone e nome/empresa).');
          navigate('/client/settings');
        }
      } finally {
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Carregar plano do usuário
  useEffect(() => {
    const loadUserPlan = async () => {
      if (!user?.uid) return;
      
      try {
        const userPlanData = await UserSettingsService.getUserCurrentPlan(user.uid);
        if (userPlanData?.plan_code) {
          setUserPlan(userPlanData.plan_code);
          const planPriorities = getPrioritiesByPlan(userPlanData.plan_code);
          setPriorities(planPriorities);
          
          // Definir prioridade padrão baseada no plano (só se não estiver editando)
          const state = location.state as any;
          if (planPriorities.length > 0 && !state?.editMode) {
            setFormData(prev => ({ ...prev, priority: planPriorities[0].value as PetitionPriority }));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar plano do usuário:', error);
      }
    };
    
    loadUserPlan();
  }, [user?.uid]);
  
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const selectedPetitionType = tiposPeticoes.find(t => t.id === selectedType);
  const selectedPriority = priorities.find(p => p.value === formData.priority);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    if (uploadedFiles.length === 0) return;

    // Create temporary file objects for UI (upload happens after salvar petição)
    const newFiles: FileUpload[] = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploading: false,
      uploaded: false,
    }));

    setFiles(prev => [...prev, ...newFiles]);
    event.target.value = '';
  };

  const removeFile = async (fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    
    if (fileToRemove?.uploaded) {
      // If file was uploaded, try to delete from storage
      try {
        if (fileToRemove.fileId) {
          const deleteResult = await PetitionFileService.deleteFile(fileToRemove.fileId);
          if (!deleteResult.success) {
            throw new Error(deleteResult.error || 'Erro ao remover arquivo');
          }
        }
        toast.success(`Arquivo ${fileToRemove.name} removido`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao remover arquivo';
        console.error('Erro ao remover arquivo:', message);
        toast.error(`Erro ao remover arquivo ${fileToRemove.name}: ${message}`);
        return;
      }
    }
    
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    return PetitionFileService.formatFileSize(bytes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedArea || !selectedType || !formData.title || !formData.description) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Check user limits before allowing submission
    if (!user) {
      toast.error('Usuário não está logado');
      return;
    }

    // Verificar se é modo de edição
    const state = location.state as any;
    const isEditMode = state?.editMode && state?.petitionData;

    setSubmitting(true);
    
    try {
      // Gate: após aprovar a petição piloto (free), exigir perfil completo para criar novas petições
      if (!isEditMode) {
        try {
          const { data: approvedPilot, error } = await supabase
            .from('petitions')
            .select('id')
            .eq('client_id', user.uid)
            .eq('is_pilot', true)
            .eq('status', 'approved')
            .limit(1)
            .maybeSingle();

          const msg = String((error as any)?.message || '');
          const missingPilotColumn =
            (error as any)?.code === '42703' || /column .*is_pilot.* does not exist/i.test(msg);
          if (!missingPilotColumn && !error && approvedPilot?.id) {
            const settings = await UserSettingsService.getUserSettings(user.uid);
            if (!isClientProfileComplete(settings)) {
              toast.error('Complete seu cadastro (CPF/CNPJ, telefone e nome/empresa) para continuar.');
              navigate('/client/settings');
              return;
            }
          }
        } catch {
          // fail-open
        }
      }

      // Pular validação de limite se estiver editando
      if (!isEditMode) {
        // Validate user limits
        const limitCheck = await PetitionLimitService.checkUserLimits(user.uid, clientProfile);
      
      if (!limitCheck.canSubmit) {
        setSubmitting(false);
        
        // Criar notificação de limite atingido
        await PlanNotificationService.notifyLimitReached(
          user.uid,
          limitCheck.planCode || 'free',
          limitCheck.limit || 1
        );
        
        // Mostrar modal de limite atingido
        setLimitInfo({
          planCode: limitCheck.planCode || 'free',
          usage: limitCheck.usage || 0,
          limit: limitCheck.limit || 1,
          validityDays: 30 // Será atualizado com dados reais
        });
        setShowLimitModal(true);
        return;
        }
      }

      // If validation passes, proceed with submission
      // Create petition in database (only valid columns for table 'petitions')
      const petitionData = {
        client_id: user.uid.trim().replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, ''),
        title: formData.title,
        description: formData.description,
        area: selectedArea, // Salvar área do direito
        type: selectedPetitionType?.name || selectedType,
        status: 'pending' as const, // valid status in table
        // Petição piloto = petição Free (marcar na criação)
        is_pilot: !isEditMode && String(userPlan || '').toLowerCase() === 'free',
        // normaliza prioridade para os valores aceitos pelo banco
        priority: (() => {
          const p = formData.priority.toLowerCase();
          if (['normal','urgent','express'].includes(p)) return p as 'normal'|'urgent'|'express';
          if (p.includes('alta') || p.includes('urg')) return 'urgent';
          if (p.includes('express')) return 'express';
          return 'normal';
        })(),
        price: 60.00,
        deadline: (() => {
          const businessDays = getBusinessDaysForPriority(userPlan, formData.priority as PetitionPriority);
          const deadlineDate = calculateBusinessDeadlineFromToday(businessDays);
          return deadlineDate.toISOString();
        })(),
        assigned_writer_id: null as any,
        // files can be set later after upload; keep empty for now
        files: [] as string[],
        requires_labor_calculation: formData.requiresLaborCalculation
      };

      
      let petitionId: string;
      
      if (isEditMode) {
        // ATUALIZAR petição existente
        const { error } = await supabase
          .from('petitions')
          .update({
            title: petitionData.title,
            description: petitionData.description,
            area: petitionData.area, // Atualizar área
            type: petitionData.type,
            priority: petitionData.priority,
            requires_labor_calculation: petitionData.requires_labor_calculation,
            updated_at: new Date().toISOString()
          })
          .eq('id', state.petitionData.id)
          .eq('client_id', user.uid);
        
        if (error) {
          console.error('❌ Erro ao atualizar petição:', error);
          throw new Error('Erro ao atualizar petição: ' + error.message);
        }
        
        petitionId = state.petitionData.id;
        toast.success('Petição atualizada com sucesso!');
      } else {
        // CRIAR nova petição
        const createdPetition = await DatabaseService.createPetition(petitionData as any);
        
        
        if (!createdPetition) {
          throw new Error('Erro ao criar petição no banco de dados');
        }
        
        petitionId = createdPetition.id;
      }
      
      // Upload files if any
      if (files.length > 0) {
        toast.info('Fazendo upload dos arquivos...');
        setUploadingFiles(true);
        
        for (const fileUpload of files) {
          if (!fileUpload.file || fileUpload.uploaded) {
            continue;
          }

          setFiles(prev => prev.map(f =>
            f.id === fileUpload.id
              ? { ...f, uploading: true, error: undefined }
              : f
          ));

          try {
            const result = await PetitionFileService.uploadFile(fileUpload.file, petitionId, user.uid);

            if (!result.success || !result.fileId) {
              throw new Error(result.error || 'Erro ao enviar arquivo');
            }

            setFiles(prev => prev.map(f =>
              f.id === fileUpload.id
                ? {
                    ...f,
                    uploading: false,
                    uploaded: true,
                    fileId: result.fileId,
                    fileUrl: result.fileUrl,
                  }
                : f
            ));

            toast.success(`Arquivo ${fileUpload.name} enviado com sucesso!`);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro ao fazer upload do arquivo:', message);

            setFiles(prev => prev.map(f =>
              f.id === fileUpload.id
                ? { ...f, uploading: false, uploaded: false, error: message }
                : f
            ));

            toast.error(`Erro ao fazer upload do arquivo ${fileUpload.name}: ${message}`);
          }
        }

        setUploadingFiles(false);
      }
      
      toast.success(
        `Petição ${petitionId} criada com sucesso!\n\nÁrea: ${selectedArea}\nTipo: ${selectedPetitionType?.name}\n\nUm redator qualificado será atribuído em breve.`
      );
      setFiles([]);
      
      // Verificar se está próximo do limite (80%) e notificar
      await PlanNotificationService.checkAndNotifyNearLimit(user.uid);
      
      navigate('/client/petitions');
      
    } catch (error) {
      console.error('Error submitting petition:', error);
      toast.error('Erro ao enviar petição. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nova Petição</h1>
          <p className="text-muted-foreground">
            Solicite uma nova petição jurídica
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/client')}>
          Cancelar
        </Button>
      </div>

      <div className="bg-container-primary border border-border rounded-lg p-4 mb-6">
        <h3 className="font-medium text-foreground mb-2">Como funciona?</h3>
        <ol className="text-sm text-muted-foreground space-y-1">
          <li>1. Selecione a área do direito e tipo de petição</li>
          <li>2. Preencha as informações detalhadas</li>
          <li>3. Anexe os documentos necessários</li>
          <li>4. Nossos redatores especializados irão elaborar sua petição</li>
          <li>5. <strong className="text-foreground">Corretor revisa a petição garantindo máxima qualidade</strong></li>
          <li>6. Você receberá a petição pronta e revisada em 1-5 dias úteis</li>
        </ol>
        <div className="mt-3 p-2 bg-green-500/10 dark:bg-green-900/30 border border-green-500/20 dark:border-green-700 rounded">
          <p className="text-xs text-green-700 dark:text-green-300 flex items-center">
            <Check className="h-3 w-3 mr-1" />
            <strong>Garantia de Qualidade:</strong> Todas as petições passam por revisão antes do envio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-container-primary border-border">
              <CardHeader>
                <CardTitle>Informações da Petição</CardTitle>
                <CardDescription className="!whitespace-nowrap !max-w-none !overflow-visible">
                  Preencha os detalhes da petição que você deseja solicitar
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-container-inner rounded-b-lg space-y-4">
                {/* Área do Direito */}
                <div className="space-y-2">
                  <Label htmlFor="area">Área do Direito *</Label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área do direito" />
                    </SelectTrigger>
                    <SelectContent>
                      {areasDireito.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Selecione a área do direito relacionada ao seu caso
                  </p>
                </div>

                {/* Tipo de Petição */}
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Petição *</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de petição" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposPeticoes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div>
                            <span className="font-medium">{type.name}</span>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Escolha o tipo de petição que melhor se adequa à sua necessidade
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título da Petição *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Contestação - Ação de Cobrança"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as PetitionPriority }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{priority.label}</span>
                            <span className="text-sm text-muted-foreground ml-2">{priority.days}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Detalhada *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva detalhadamente os fatos, argumentos e orientações específicas para a petição..."
                    rows={6}
                    required
                  />
                </div>

                {/* Campo de Cálculo Trabalhista */}
                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="labor-calculation" className="text-base font-medium cursor-pointer">
                        Requer Cálculo Trabalhista?
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Marque se a petição necessita de cálculos trabalhistas (ex: verbas rescisórias, horas extras, diferenças salariais, FGTS, etc.)
                      </p>
                    </div>
                    <Switch
                      id="labor-calculation"
                      checked={formData.requiresLaborCalculation}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, requiresLaborCalculation: checked }))
                      }
                      className="ml-4"
                    />
                  </div>
                  
                  {formData.requiresLaborCalculation && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          Cálculo trabalhista solicitado
                        </p>
                        <p className="mt-1 text-blue-700 dark:text-blue-300">
                          O redator incluirá os cálculos trabalhistas detalhados na petição, com planilhas e memória de cálculo quando necessário.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card className="bg-container-secondary border-border">
              <CardHeader>
                <CardTitle>Arquivos de Apoio</CardTitle>
                <CardDescription className="!whitespace-nowrap !max-w-none !overflow-visible">
                  Faça upload de documentos, contratos, decisões ou outros arquivos relevantes
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-container-inner rounded-b-lg">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Arraste arquivos para cá ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Suporte para PDF, Word, imagens (máx. 10MB por arquivo)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                      Selecionar Arquivos
                    </Button>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <Label>Arquivos Selecionados</Label>
                      {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            {file.uploading ? (
                              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                            ) : file.uploaded ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : file.error ? (
                              <X className="h-4 w-4 text-red-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-gray-500" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                                {file.uploading && ' - Carregando...'}
                                {file.uploaded && ' - Carregado'}
                                {file.error && ` - ${file.error}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            disabled={file.uploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Selected Petition Summary */}
            {selectedArea && selectedType && (
              <Card className="bg-container-primary border-border">
                <CardContent className="bg-container-inner rounded-lg pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800">
                        {tiposPeticoes.find(type => type.id === selectedType)?.name}
                      </h3>
                      <p className="text-sm text-green-700">
                        {tiposPeticoes.find(type => type.id === selectedType)?.description}
                      </p>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Área: {selectedArea}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Área:</span>
                    <span className="font-medium text-foreground">
                      {selectedArea || 'Não selecionada'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium text-foreground">
                      {selectedPetitionType?.name || 'Não selecionado'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prioridade:</span>
                    <Badge variant="outline">
                      {selectedPriority?.label || 'Média'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prazo estimado:</span>
                    <span className="text-muted-foreground">
                      {selectedPriority?.days || '3-5 dias'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Arquivos:</span>
                    <span className="text-muted-foreground">{files.length}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting || uploadingFiles}>
                  {submitting ? 'Criando Petição...' : uploadingFiles ? 'Carregando Arquivos...' : 'Solicitar Petição'}
                </Button>

                <p className="text-xs text-muted-foreground">
                  Ao solicitar, você concorda com nossos termos de serviço.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-container-primary border-border">
              <CardHeader>
                <CardTitle className="text-sm">Dicas Importantes</CardTitle>
              </CardHeader>
              <CardContent className="bg-container-inner rounded-b-lg text-xs space-y-2 text-muted-foreground">
                <p>• Seja específico na descrição dos fatos</p>
                <p>• Inclua todos os documentos relevantes</p>
                <p>• Mencione prazos processuais importantes</p>
                <p>• Indique teses jurídicas preferenciais</p>
                <p>• Selecione a área do direito correta</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Modal de limite de petições */}
      <PetitionLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={() => {
          setShowLimitModal(false);
          reactNavigate('/client/plans');
        }}
        planCode={limitInfo.planCode}
        usage={limitInfo.usage}
        limit={limitInfo.limit}
        validityDays={limitInfo.validityDays}
      />
    </div>
  );
}