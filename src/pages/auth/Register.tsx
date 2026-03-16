import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, ArrowLeft, Building, Users, FileText, Upload, ChevronDown, CheckCircle2, AlertCircle, Loader2, Chrome } from 'lucide-react';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { toast } from 'sonner';
// Logo do Supabase Storage
const logoImage = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/Design%20sem%20nome%20(15).png';
import FloatingLegalBackground from '@/components/ui/FloatingLegalBackground';
import Logo from '@/components/ui/Logo';
import { VerificationService } from '@/services/verificationService';
import { supabase } from '@/lib/supabase';

type UserType = 'client' | 'writer';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  companyName: string;
  cnpj: string;
  contactName: string;
  fullName: string;
  cpf: string;
  oabNumber: string;
  specializations: string;
}

interface CNPJVerification {
  verified: boolean;
  companyName?: string;
  status?: string;
  city?: string;
  state?: string;
  error?: string;
}

interface FormErrors {
  [key: string]: string;
}

/** Lista ampla de áreas do Direito (BR) */
const LAW_AREAS: { value: string; label: string }[] = [
  { value: "administrativo", label: "Direito Administrativo" },
  { value: "agrario", label: "Direito Agrário" },
  { value: "ambiental", label: "Direito Ambiental" },
  { value: "arbitragem_mediacao", label: "Arbitragem e Mediação" },
  { value: "bancario", label: "Direito Bancário" },
  { value: "civil", label: "Direito Civil" },
  { value: "consumidor", label: "Direito do Consumidor" },
  { value: "constitucional", label: "Direito Constitucional" },
  { value: "contratual", label: "Direito Contratual" },
  { value: "criminal", label: "Direito Penal / Criminal" },
  { value: "cibernetico_digital", label: "Direito Digital" },
  { value: "desportivo", label: "Direito Desportivo" },
  { value: "eleitoral", label: "Direito Eleitoral" },
  { value: "empresarial", label: "Direito Empresarial" },
  { value: "societario", label: "Direito Societário" },
  { value: "energia", label: "Direito da Energia" },
  { value: "familia_sucessoes", label: "Família e Sucessões" },
  { value: "falimentar_recuperacao", label: "Falimentar e Recuperação Judicial" },
  { value: "financeiro_capitais", label: "Financeiro e Mercado de Capitais" },
  { value: "imobiliario", label: "Direito Imobiliário" },
  { value: "internacional", label: "Direito Internacional" },
  { value: "lgpd_dados", label: "Proteção de Dados (LGPD)" },
  { value: "maritimo_portuario", label: "Marítimo e Portuário" },
  { value: "medico_saude", label: "Médico e da Saúde" },
  { value: "minerario", label: "Direito Minerário" },
  { value: "notarial_registral", label: "Notarial e Registral" },
  { value: "previdenciario", label: "Direito Previdenciário" },
  { value: "propriedade_intelectual", label: "Propriedade Intelectual" },
  { value: "regulatorio", label: "Direito Regulatório" },
  { value: "seguros_resseguros", label: "Seguros e Resseguros" },
  { value: "telecom", label: "Telecomunicações" },
  { value: "trabalhista", label: "Direito Trabalhista" },
  { value: "tributario", label: "Direito Tributário" },
  { value: "urbanistico", label: "Direito Urbanístico" },
  { value: "concorrencial", label: "Concorrencial / Antitruste" },
  { value: "comercio_exterior", label: "Comércio Exterior / Aduaneiro" },
  { value: "compliance_anticorrupcao", label: "Compliance e Anticorrupção" },
  { value: "transportes_logistica", label: "Transportes e Logística" },
  { value: "petroleo_gas", label: "Petróleo e Gás" },
  { value: "agronegocio", label: "Direito do Agronegócio" },
  { value: "educacao", label: "Educação" },
  { value: "cultura_entretenimento", label: "Cultura e Entretenimento" },
  { value: "outros", label: "Outros" },
];

export default function Register() {
  const navigate = useNavigate();
  const { register, getClient, registerWithGoogleClient } = useNewAuth();
  
  // Detectar plano desejado da URL usando useSearchParams (funciona com hash routing)
  const [searchParams] = useSearchParams();
  const desiredPlan = searchParams.get('plan');
  
  // Debug: verificar se o plano está sendo detectado
  console.log('🔍 Register.tsx - URL atual:', window.location.href);
  console.log('🔍 Register.tsx - useSearchParams.get("plan"):', desiredPlan);
  console.log('🔍 Register.tsx - Plano desejado:', desiredPlan);

  const [userType, setUserType] = useState<UserType>('client');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [petitionFiles, setPetitionFiles] = useState<{ [key: string]: File | null }>({
    petition1: null,
    petition2: null,
    petition3: null
  });
  
  // Estados para verificação de CNPJ
  const [cnpjVerification, setCnpjVerification] = useState<CNPJVerification | null>(null);
  const [isVerifyingCNPJ, setIsVerifyingCNPJ] = useState(false);
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj' | null>(null);
  
  // Estados para upload de carteirinha OAB
  const [oabFiles, setOabFiles] = useState<{ [key: string]: File | null }>({
    oab_front: null,
    oab_back: null
  });

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    cnpj: '',
    contactName: '',
    fullName: '',
    cpf: '',
    oabNumber: '',
    specializations: ''
  });

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleRegister = async () => {
    if (userType !== 'client') {
      toast.error('Cadastro com Google disponível apenas para Clientes.');
      return;
    }
    if (!acceptedTerms) {
      toast.error('Você precisa aceitar os Termos de Serviço e a Política de Privacidade.');
      return;
    }

    setGoogleLoading(true);
    try {
      const authUser = await registerWithGoogleClient();
      if (authUser?.role && authUser.role !== 'client') {
        toast.error('Cadastro com Google disponível apenas para Clientes.');
        return;
      }

      if (desiredPlan) {
        toast.success('✅ Conta criada! Redirecionando para pagamento...');
        setTimeout(() => {
          navigate(`/client/checkout?plan=${desiredPlan}&new_user=true`);
        }, 500);
        return;
      }

      navigate('/client', { replace: true });
    } catch (err: any) {
      toast.error(err?.message || 'Não foi possível cadastrar com Google.');
    } finally {
      setGoogleLoading(false);
    }
  };
// Função para validar o formulário
const validateForm = async () => {
  const newErrors: FormErrors = {};

  if (!formData.email) newErrors.email = 'Email é obrigatório';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';

  if (!formData.password) newErrors.password = 'Senha é obrigatória';
  else if (formData.password.length < 8) newErrors.password = 'Senha deve ter pelo menos 8 caracteres';

  if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
  else if (formData.password !== formData.confirmPassword)
    newErrors.confirmPassword = 'Senhas não coincidem';

  if (!acceptedTerms) newErrors.terms = 'Você deve aceitar os termos de uso';

  if (userType === 'client') {
    // Se for CPF, valida campos de pessoa física + OAB
    if (documentType === 'cpf') {
      if (!formData.companyName) newErrors.companyName = 'Nome completo é obrigatório';
      if (!formData.cnpj) newErrors.cnpj = 'CPF é obrigatório';
      if (!formData.oabNumber) newErrors.oabNumber = 'Número da OAB é obrigatório';
      
      // Validar upload de carteirinha OAB
      if (!oabFiles.oab_front) newErrors.oab_front = 'Carteirinha OAB (frente) é obrigatória';
      else if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(oabFiles.oab_front.type)) 
        newErrors.oab_front = 'Formato inválido. Use JPG, PNG ou PDF';
      else if (oabFiles.oab_front.size > 5 * 1024 * 1024) newErrors.oab_front = 'Arquivo deve ter no máximo 5MB';
      
      if (!oabFiles.oab_back) newErrors.oab_back = 'Carteirinha OAB (verso) é obrigatória';
      else if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(oabFiles.oab_back.type))
        newErrors.oab_back = 'Formato inválido. Use JPG, PNG ou PDF';
      else if (oabFiles.oab_back.size > 5 * 1024 * 1024) newErrors.oab_back = 'Arquivo deve ter no máximo 5MB';
    }
    // Se for CNPJ, valida campos de pessoa jurídica
    else if (documentType === 'cnpj') {
      if (!formData.companyName) newErrors.companyName = 'Nome da empresa é obrigatório';
      if (!formData.cnpj) newErrors.cnpj = 'CNPJ é obrigatório';
      if (!cnpjVerification?.verified) newErrors.cnpj = 'CNPJ não verificado ou inválido';
      if (!formData.contactName) newErrors.contactName = 'Nome do responsável é obrigatório';
    }
    // Se não detectou tipo ainda
    else {
      if (!formData.cnpj) newErrors.cnpj = 'CPF ou CNPJ é obrigatório';
    }
  }

  if (userType === 'writer') {
    if (!formData.fullName) newErrors.fullName = 'Nome completo é obrigatório';
    if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
    if (!formData.oabNumber) newErrors.oabNumber = 'Número da OAB é obrigatório';
    if (!formData.specializations) newErrors.specializations = 'Especialização é obrigatória';
    
    // Validar carteirinha OAB (frente e verso)
    if (!oabFiles.oab_front) newErrors.oab_front = 'Carteirinha OAB (frente) é obrigatória';
    else if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(oabFiles.oab_front.type))
      newErrors.oab_front = 'Formato inválido. Use JPG, PNG ou PDF';
    else if (oabFiles.oab_front.size > 5 * 1024 * 1024) newErrors.oab_front = 'Arquivo deve ter no máximo 5MB';
    
    if (!oabFiles.oab_back) newErrors.oab_back = 'Carteirinha OAB (verso) é obrigatória';
    else if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(oabFiles.oab_back.type))
      newErrors.oab_back = 'Formato inválido. Use JPG, PNG ou PDF';
    else if (oabFiles.oab_back.size > 5 * 1024 * 1024) newErrors.oab_back = 'Arquivo deve ter no máximo 5MB';
    
    // Validar petições autorais obrigatórias
    if (!petitionFiles.petition1) newErrors.petition1 = 'Petição autoral 1 é obrigatória';
    else if (petitionFiles.petition1.type !== 'application/pdf') newErrors.petition1 = 'Petição 1 deve ser um arquivo PDF';
    else if (petitionFiles.petition1.size > 5 * 1024 * 1024) newErrors.petition1 = 'Petição 1 deve ter no máximo 5MB';
    
    if (!petitionFiles.petition2) newErrors.petition2 = 'Petição autoral 2 é obrigatória';
    else if (petitionFiles.petition2.type !== 'application/pdf') newErrors.petition2 = 'Petição 2 deve ser um arquivo PDF';
    else if (petitionFiles.petition2.size > 5 * 1024 * 1024) newErrors.petition2 = 'Petição 2 deve ter no máximo 5MB';
    
    if (!petitionFiles.petition3) newErrors.petition3 = 'Petição autoral 3 é obrigatória';
    else if (petitionFiles.petition3.type !== 'application/pdf') newErrors.petition3 = 'Petição 3 deve ser um arquivo PDF';
    else if (petitionFiles.petition3.size > 5 * 1024 * 1024) newErrors.petition3 = 'Petição 3 deve ter no máximo 5MB';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Função para fazer upload das petições autorais
const uploadPetitionFiles = async (userId: string, petitionFiles: { [key: string]: File | null }, getClient: any) => {
  const uploadedFilePaths: { [key: string]: string } = {}; // Armazenar apenas os caminhos
  
  console.log('🔍 Register.tsx - Iniciando upload de petições autorais');
  
  // Tentar usar Service Role Key se disponível (bypass RLS)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dmsodonmkffyvbuxtxec.supabase.co';
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  let supabaseClient: any;
  
  if (serviceRoleKey) {
    // Usar Service Role Key para bypass RLS
    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('🔍 Register.tsx - Usando Service Role Key para upload de petições');
  } else {
    // Fallback: usar cliente autenticado
    const client = await getClient();
    supabaseClient = client.supabase;
    console.log('🔍 Register.tsx - Usando cliente autenticado para upload de petições');
  }
  
  for (const [key, file] of Object.entries(petitionFiles)) {
    if (file) {
      try {
        // Criar nome único para o arquivo
        const timestamp = Date.now();
        // Sanitizar nome do arquivo para evitar caracteres especiais
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${userId}/${timestamp}-${key}-${sanitizedFileName}`;
        
        console.log('🔍 Register.tsx - Firebase UID:', userId);
        console.log('🔍 Register.tsx - File name:', fileName);
        console.log('🔍 Register.tsx - File type:', file.type);
        console.log('🔍 Register.tsx - File size:', file.size);

        // Upload para bucket writer-petitions
        const { data, error } = await supabaseClient.storage
          .from('writer-petitions')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          });

        if (error) {
          console.error(`❌ Erro ao fazer upload da ${key}:`, error);
          // Melhorar mensagem de erro
          if (error.message?.includes('already exists')) {
            throw new Error(`Arquivo ${key} já existe. Tente novamente.`);
          }
          if (error.message?.includes('not found') || error.message?.includes('bucket')) {
            throw new Error(`Bucket writer-petitions não encontrado. Contate o suporte.`);
          }
          if (error.message?.includes('permission') || error.message?.includes('policy')) {
            throw new Error(`Sem permissão para fazer upload. Verifique suas credenciais.`);
          }
          throw new Error(`Falha ao fazer upload da petição ${key}: ${error.message || 'Erro desconhecido'}`);
        }

        console.log('✅ Upload de petição bem-sucedido:', fileName);
        
        // Armazenar apenas o caminho do arquivo (bucket pode ser privado)
        uploadedFilePaths[key] = fileName;
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${key}:`, error);
        throw error;
      }
    }
  }
  
  return uploadedFilePaths;
};

// Função para fazer upload das carteirinhas OAB
// ✅ USA SERVICE ROLE KEY para bypass RLS (funciona com bucket privado)
const uploadOABFiles = async (userId: string, oabFiles: { [key: string]: File | null }, getClient: any) => {
  const uploadedFiles: { [key: string]: string } = {};
  
  console.log('🔍 Register.tsx - Iniciando upload de OAB');
  
  // Tentar usar Service Role Key se disponível (bypass RLS)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dmsodonmkffyvbuxtxec.supabase.co';
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  let supabaseClient: any;
  
  if (serviceRoleKey) {
    // Usar Service Role Key para bypass RLS
    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('🔍 Register.tsx - Usando Service Role Key para upload');
  } else {
    // Fallback: usar cliente autenticado
    const client = await getClient();
    supabaseClient = client.supabase;
    console.log('🔍 Register.tsx - Usando cliente autenticado para upload');
  }
  
  for (const [key, file] of Object.entries(oabFiles)) {
    if (file) {
      try {
        // Criar nome único para o arquivo
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const fileName = `${userId}/${key}_${timestamp}.${extension}`;
        
        console.log('🔍 Register.tsx - Uploading OAB:', fileName);
        console.log('🔍 Register.tsx - File type:', file.type);
        console.log('🔍 Register.tsx - File size:', file.size);

        // Upload para bucket oab-documents
        const { data, error } = await supabaseClient.storage
          .from('oab-documents')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          });

        if (error) {
          console.error(`❌ Erro ao fazer upload da ${key}:`, error);
          // Melhorar mensagem de erro
          if (error.message?.includes('already exists')) {
            throw new Error(`Arquivo ${key} já existe. Tente novamente.`);
          }
          if (error.message?.includes('not found') || error.message?.includes('bucket')) {
            throw new Error(`Bucket oab-documents não encontrado. Contate o suporte.`);
          }
          if (error.message?.includes('permission') || error.message?.includes('policy')) {
            throw new Error(`Sem permissão para fazer upload. Verifique suas credenciais.`);
          }
          throw new Error(`Falha ao fazer upload da carteirinha OAB: ${error.message || 'Erro desconhecido'}`);
        }

        console.log('✅ Upload OAB bem-sucedido:', fileName);
        
        // Armazenar apenas o caminho do arquivo (bucket é privado)
        // A URL será gerada quando necessário usando createSignedUrl()
        uploadedFiles[key] = fileName;
        
      } catch (error: any) {
        console.error(`❌ Erro ao processar ${key}:`, error);
        throw error;
      }
    }
  }
  
  return uploadedFiles;
};

// Função para verificar CNPJ via API
const verifyCNPJ = async (cnpj: string) => {
  setIsVerifyingCNPJ(true);
  setCnpjVerification(null);
  
  try {
    const result = await VerificationService.verifyCNPJ(cnpj);
    
    if (result.valid) {
      setCnpjVerification({
        verified: true,
        companyName: result.companyName,
        status: result.status,
        city: result.city,
        state: result.state
      });
      toast.success('✅ CNPJ verificado com sucesso!');
    } else {
      setCnpjVerification({
        verified: false,
        error: result.error
      });
      toast.error(result.error || 'CNPJ inválido');
    }
  } catch (error: any) {
    setCnpjVerification({
      verified: false,
      error: 'Erro ao verificar CNPJ'
    });
    toast.error('Erro ao verificar CNPJ. Tente novamente.');
  } finally {
    setIsVerifyingCNPJ(false);
  }
};

// Função para atualizar os inputs
const handleInputChange = (field: keyof FormData, value: string) => {
  let formattedValue = value;

  // Limitar caracteres antes de formatar
  const maxLengths: Record<string, number> = {
    companyName: 60,
    contactName: 60,
    fullName: 60,
    oabNumber: 15,
    phone: 15,
    email: 80,
  };

  // Aplicar limite de caracteres
  if (maxLengths[field] && value.length > maxLengths[field]) {
    return; // Não atualiza se exceder o limite
  }

  // Formata CPF quando tiver 11 dígitos
  if (field === 'cpf') {
    const numbers = value.replace(/\D/g, '');
    formattedValue =
      numbers.length === 11
        ? numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        : value;
  }

  // Formata CNPJ/CPF e detecta tipo (para clientes)
  if (field === 'cnpj' && userType === 'client') {
    const numbers = value.replace(/\D/g, '');
    
    // Detecta tipo de documento
    const detectedType = VerificationService.detectDocumentType(value);
    if (detectedType !== documentType) {
      setDocumentType(detectedType);
      setCnpjVerification(null);
    }
    
    // Formata CPF (11 dígitos)
    if (numbers.length === 11) {
      formattedValue = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    // Formata CNPJ (14 dígitos)
    else if (numbers.length === 14) {
      formattedValue = numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else {
      formattedValue = value;
    }
  }

  setFormData(prev => ({ ...prev, [field]: formattedValue }));

  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }
};

  // ... suas funções de validação permanecem iguais ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valido = await validateForm();
    if (!valido) return;

    try {
      const profileData =
        userType === 'client'
          ? {
              company_name: formData.companyName,  // ✅ snake_case para RPC
              full_name: formData.companyName,     // ✅ Usar como full_name também
              cnpj: formData.cnpj,
              contact_person: formData.contactName,
              phone: formData.phone
            }
          : {
              full_name: formData.fullName,        // ✅ snake_case para RPC
              cpf: formData.cpf,
              oab_number: formData.oabNumber,
              specializations: formData.specializations
            };

      console.log('🔍 Register.tsx - Enviando para register:', {
        email: formData.email,
        role: userType,
        profileData
      });
      
          console.log('🔍 Register.tsx - userType confirmado:', userType);
          console.log('🔍 Register.tsx - userType === "writer":', userType === 'writer');
          console.log('🔍 Register.tsx - ANTES DE CHAMAR register - role que será enviado:', userType);
          console.log('🔍 Register.tsx - profileData que será enviado:', profileData);
          
          const authUser = await register({
            email: formData.email,
            password: formData.password,
            role: userType,
            profileData
          });

      console.log('🔍 Register.tsx - authUser retornado:', authUser);
      console.log('🔍 Register.tsx - authUser.role:', authUser?.role);
      console.log('🔍 Register.tsx - authUser.uid:', authUser?.uid);

      // Para redatores, fazer upload das petições autorais e carteirinha OAB
      if (userType === 'writer' && authUser?.uid) {
        try {
          console.log('🔍 Register.tsx - Fazendo upload das petições...');
          const uploadedFiles = await uploadPetitionFiles(authUser.uid, petitionFiles, getClient);
          console.log('✅ Register.tsx - Petições enviadas com sucesso:', uploadedFiles);
          
          console.log('🔍 Register.tsx - Fazendo upload da carteirinha OAB...');
          const uploadedOAB = await uploadOABFiles(authUser.uid, oabFiles, getClient);
          console.log('✅ Register.tsx - Carteirinha OAB enviada com sucesso:', uploadedOAB);
          
          // Salvar caminhos das petições e carteirinha no perfil do usuário
          // ✅ IMPORTANTE: em alguns cenários o registro pode existir só em profiles_v2
          // (ex.: RPC falhou / corrida de sincronização). Então fazemos update + fallback com RPC/UPSERT.
          const { supabase: supabaseClient } = await getClient();

          const profilePatch = {
            petition_files: uploadedFiles,
            oab_documents: uploadedOAB,
            full_name: formData.fullName,
            phone: formData.phone,
            updated_at: new Date().toISOString(),
          };

          // 1) Tentar UPDATE (caso o registro já exista)
          const { data: updatedRows, error: updateError } = await supabaseClient
            .from('user_profiles')
            .update(profilePatch)
            .eq('firebase_uid', authUser.uid)
            .select('id');

          const updatedOk = !updateError && Array.isArray(updatedRows) && updatedRows.length > 0;

          if (!updatedOk) {
            if (updateError) {
              console.warn('⚠️ Register.tsx - Falha no UPDATE de user_profiles, tentando fallback:', updateError);
            } else {
              console.warn('⚠️ Register.tsx - UPDATE não afetou linhas (perfil pode não existir). Tentando fallback...');
            }

            // 2) Tentar garantir perfil via RPC (quando disponível)
            try {
              await supabaseClient.rpc('create_or_update_user_profile', {
                p_firebase_uid: authUser.uid,
                p_email: formData.email,
                p_role: 'writer',
                p_full_name: formData.fullName || null,
                p_phone: formData.phone || null,
                p_address: null,
              });
            } catch (rpcErr) {
              // Sem quebrar fluxo: RPC pode não existir/estar bloqueada
              console.warn('⚠️ Register.tsx - RPC create_or_update_user_profile falhou (ok continuar):', rpcErr);
            }

            // 3) UPSERT como fallback final (cria se não existir)
            const { error: upsertError } = await supabaseClient
              .from('user_profiles')
              .upsert(
                {
                  firebase_uid: authUser.uid,
                  email: formData.email,
                  role: 'writer',
                  ...profilePatch,
                },
                { onConflict: 'firebase_uid' }
              );

            if (upsertError) {
              console.error('❌ Register.tsx - Erro ao salvar documentos (UPSERT user_profiles):', upsertError);
              toast.error('Erro ao salvar seus documentos. Tente novamente.');
              return;
            }
          }

          console.log('✅ Register.tsx - Documentos salvos no perfil (user_profiles)');
        } catch (error) {
          console.error('❌ Erro ao fazer upload:', error);
          toast.error('Erro ao enviar documentos. Tente novamente.');
          return;
        }
      }
      
      // Para clientes CPF, fazer upload da carteirinha OAB
      if (userType === 'client' && documentType === 'cpf' && authUser?.uid) {
        try {
          console.log('🔍 Register.tsx - Fazendo upload da carteirinha OAB (cliente)...');
          const uploadedOAB = await uploadOABFiles(authUser.uid, oabFiles, getClient);
          console.log('✅ Register.tsx - Carteirinha OAB enviada com sucesso:', uploadedOAB);
          
          // Salvar caminho da carteirinha no perfil do usuário (update + fallback)
          const { supabase: supabaseClient } = await getClient();
          const profilePatch = {
            oab_documents: uploadedOAB,
            oab_number: formData.oabNumber,
            full_name: formData.companyName,
            phone: formData.phone,
            updated_at: new Date().toISOString(),
          };

          const { data: updatedRows, error: updateError } = await supabaseClient
            .from('user_profiles')
            .update(profilePatch)
            .eq('firebase_uid', authUser.uid)
            .select('id');

          const updatedOk = !updateError && Array.isArray(updatedRows) && updatedRows.length > 0;

          if (!updatedOk) {
            if (updateError) {
              console.warn('⚠️ Register.tsx - Falha no UPDATE (cliente CPF), tentando fallback:', updateError);
            } else {
              console.warn('⚠️ Register.tsx - UPDATE não afetou linhas (cliente CPF). Tentando fallback...');
            }

            try {
              await supabaseClient.rpc('create_or_update_user_profile', {
                p_firebase_uid: authUser.uid,
                p_email: formData.email,
                p_role: 'client',
                p_full_name: formData.companyName || null,
                p_phone: formData.phone || null,
                p_address: null,
              });
            } catch (rpcErr) {
              console.warn('⚠️ Register.tsx - RPC create_or_update_user_profile falhou (cliente CPF):', rpcErr);
            }

            const { error: upsertError } = await supabaseClient
              .from('user_profiles')
              .upsert(
                {
                  firebase_uid: authUser.uid,
                  email: formData.email,
                  role: 'client',
                  ...profilePatch,
                },
                { onConflict: 'firebase_uid' }
              );

            if (upsertError) {
              console.error('❌ Register.tsx - Erro ao salvar carteirinha (UPSERT user_profiles):', upsertError);
              toast.error('Erro ao salvar sua carteirinha. Tente novamente.');
              return;
            }
          }

          console.log('✅ Register.tsx - Carteirinha salva no perfil (user_profiles)');
        } catch (error) {
          console.error('❌ Erro ao fazer upload da carteirinha:', error);
          toast.error('Erro ao enviar carteirinha OAB. Tente novamente.');
          return;
        }
      }

      toast.success(
        `✅ Conta criada com sucesso como ${userType === 'client' ? 'Cliente' : 'Redator'}!`
      );
      
      // ✅ CORREÇÃO: Marcar tempo de cadastro para evitar flash de "não autorizado"
      localStorage.setItem('last_registration_time', Date.now().toString())
      
      // Mostrar modal de aprovação para redatores
      if (userType === 'writer') {
        setShowApprovalModal(true);
      } else {
        // Se há um plano desejado, redirecionar para checkout
        console.log('🔍 Register.tsx - Verificando redirecionamento:');
        console.log('🔍 Register.tsx - desiredPlan:', desiredPlan);
        console.log('🔍 Register.tsx - userType:', userType);
        console.log('🔍 Register.tsx - Condição (desiredPlan && userType === "client"):', desiredPlan && userType === 'client');
        
        if (desiredPlan && userType === 'client') {
          console.log('✅ Register.tsx - Redirecionando para checkout com plano:', desiredPlan);
          toast.success('✅ Conta criada! Redirecionando para pagamento...');
          // Aguardar um pouco para o contexto de auth processar
          setTimeout(() => {
            navigate(`/client/checkout?plan=${desiredPlan}&new_user=true`);
          }, 2000);
        } else {
          console.log('⚠️ Register.tsx - Não redirecionando para checkout. Motivo:');
          console.log('⚠️ Register.tsx - desiredPlan existe?', !!desiredPlan);
          console.log('⚠️ Register.tsx - userType é client?', userType === 'client');
          // Caso contrário, o contexto já redireciona para /client, /writer ou /admin
        }
      }
    } catch (error: any) {
      toast.error(`❌ ${error.message || 'Erro ao criar conta. Tente novamente.'}`);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <FloatingLegalBackground />

      <div aria-hidden className="fixed inset-0 z-[1] bg-slate-950/10" />
      <div
        aria-hidden
        className="fixed inset-0 z-[2] bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_55%)]"
      />
      <div
        aria-hidden
        className="fixed inset-0 z-[3] bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.14),transparent_55%)]"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="bg-white rounded-full p-2 shadow-md">
                <img src={logoImage} alt="Veredicta" className="h-8 w-auto" />
              </div>
              <span className="text-xl font-medium text-white tracking-wide">
                Vered
                <span className="relative inline-block">
                  <span style={{ textDecoration: 'none', fontFeatureSettings: '"cv01" 1' }}>i</span>
                  <span className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full"></span>
                </span>
                cta
              </span>
            </Link>
            <Button
              variant="ghost"
              onClick={() => navigate('/auth/login')}
              className="flex items-center text-slate-100 hover:text-white hover:bg-white/10 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </header>

        {/* Card */}
        <Card className="rounded-2xl border border-[rgba(125,211,252,0.15)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(219,234,254,0.78))] shadow-[0_8px_32px_rgba(2,6,23,0.45),inset_0_1px_0_rgba(255,255,255,0.45)] supports-[backdrop-filter]:backdrop-blur-[24px] supports-[backdrop-filter]:backdrop-saturate-[1.2]">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-900">Criar Conta</CardTitle>
            <CardDescription className="text-center break-words whitespace-normal max-w-xs mx-auto text-gray-600">
              Escolha o tipo de conta e preencha os dados
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* User Type Toggle */}
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setUserType('client')}
                  className={`rounded-md flex items-center space-x-2 px-4 py-2 text-sm font-medium min-h-[40px] min-w-[120px] justify-center ${
                    userType === 'client' 
                      ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Building className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Sou Cliente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('writer')}
                  className={`rounded-md flex items-center space-x-2 px-4 py-2 text-sm font-medium min-h-[40px] min-w-[120px] justify-center ${
                    userType === 'writer' 
                      ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Sou Redator</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Client Form */}
              {userType === 'client' && (
                <>
                  <div>
                    <Label htmlFor="companyName" className="text-gray-900">
                      {documentType === 'cpf' ? 'Nome Completo *' : 'Nome da Empresa *'}
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder={documentType === 'cpf' ? 'Seu nome completo' : 'Nome da sua empresa'}
                      maxLength={60}
                      className={`glass-input ${errors.companyName ? 'border-red-500' : ''}`}
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cnpj" className="text-gray-900">CPF ou CNPJ *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => handleInputChange('cnpj', e.target.value)}
                        placeholder="Digite seu CPF ou CNPJ"
                        maxLength={18}
                        className={`glass-input ${errors.cnpj ? 'border-red-500' : ''}`}
                      />
                      {documentType === 'cnpj' && (
                        <Button
                          type="button"
                          onClick={() => verifyCNPJ(formData.cnpj)}
                          disabled={isVerifyingCNPJ || !formData.cnpj}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          {isVerifyingCNPJ ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Verificar'
                          )}
                        </Button>
                      )}
                    </div>
                    {errors.cnpj && (
                      <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>
                    )}
                    
                    {/* Feedback de verificação de CNPJ */}
                    {documentType === 'cnpj' && cnpjVerification && (
                      <div className={`mt-2 p-3 rounded-lg ${cnpjVerification.verified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-start">
                          {cnpjVerification.verified ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            {cnpjVerification.verified ? (
                              <>
                                <p className="text-sm font-medium text-green-800">✅ CNPJ Verificado!</p>
                                <p className="text-sm text-green-700 mt-1">
                                  🏢 {cnpjVerification.companyName}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                  📍 {cnpjVerification.city}, {cnpjVerification.state} • Situação: {cnpjVerification.status}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-red-800">{cnpjVerification.error}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Campos condicionais - CNPJ */}
                  {documentType === 'cnpj' && (
                    <div>
                      <Label htmlFor="contactName" className="text-gray-900">Nome do Responsável *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        placeholder="Nome do responsável"
                        maxLength={60}
                        className={`glass-input ${errors.contactName ? 'border-red-500' : ''}`}
                      />
                      {errors.contactName && (
                        <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
                      )}
                    </div>
                  )}

                  {/* Campos condicionais - CPF (OAB + Upload) */}
                  {documentType === 'cpf' && (
                    <>
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">📋 Verificação de Identidade</h3>
                        
                        <div>
                          <Label htmlFor="oabNumber" className="text-gray-900">Número da OAB *</Label>
                          <Input
                            id="oabNumber"
                            value={formData.oabNumber}
                            onChange={(e) => handleInputChange('oabNumber', e.target.value)}
                            placeholder="123456/SP"
                            maxLength={15}
                            className={`glass-input ${errors.oabNumber ? 'border-red-500' : ''}`}
                          />
                          {errors.oabNumber && (
                            <p className="text-red-500 text-sm mt-1">{errors.oabNumber}</p>
                          )}
                        </div>

                        {/* Upload Carteirinha OAB - Frente */}
                        <div className="mt-4">
                          <Label className="text-gray-900">Carteirinha da OAB - Frente *</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-8 w-8 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {oabFiles.oab_front ? oabFiles.oab_front.name : 'Nenhum arquivo selecionado'}
                                  </p>
                                  <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                                  className="hidden"
                                  id="oab_front"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setOabFiles(prev => ({ ...prev, oab_front: file }));
                                    if (errors.oab_front) {
                                      setErrors(prev => ({ ...prev, oab_front: '' }));
                                    }
                                  }}
                                />
                                <label
                                  htmlFor="oab_front"
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Selecionar
                                </label>
                              </div>
                            </div>
                          </div>
                          {errors.oab_front && (
                            <p className="text-red-500 text-sm mt-1">{errors.oab_front}</p>
                          )}
                        </div>

                        {/* Upload Carteirinha OAB - Verso */}
                        <div className="mt-4">
                          <Label className="text-gray-900">Carteirinha da OAB - Verso *</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-8 w-8 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {oabFiles.oab_back ? oabFiles.oab_back.name : 'Nenhum arquivo selecionado'}
                                  </p>
                                  <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                                  className="hidden"
                                  id="oab_back"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setOabFiles(prev => ({ ...prev, oab_back: file }));
                                    if (errors.oab_back) {
                                      setErrors(prev => ({ ...prev, oab_back: '' }));
                                    }
                                  }}
                                />
                                <label
                                  htmlFor="oab_back"
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Selecionar
                                </label>
                              </div>
                            </div>
                          </div>
                          {errors.oab_back && (
                            <p className="text-red-500 text-sm mt-1">{errors.oab_back}</p>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-3">
                          📋 Envie fotos claras de ambos os lados da sua carteirinha para verificação de identidade
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Writer Form */}
              {userType === 'writer' && (
                <>
                  <div>
                    <Label htmlFor="fullName" className="text-gray-900">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Seu nome completo"
                      maxLength={60}
                      className={`glass-input ${errors.fullName ? 'border-red-500' : ''}`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cpf" className="text-gray-900">CPF *</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className={`glass-input ${errors.cpf ? 'border-red-500' : ''}`}
                    />
                    {errors.cpf && (
                      <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="oabNumber" className="text-gray-900">Número da OAB *</Label>
                    <Input
                      id="oabNumber"
                      value={formData.oabNumber}
                      onChange={(e) => handleInputChange('oabNumber', e.target.value)}
                      placeholder="123456/SP"
                      maxLength={15}
                      className={`glass-input ${errors.oabNumber ? 'border-red-500' : ''}`}
                    />
                    {errors.oabNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.oabNumber}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="specializations" className="text-gray-900">Especialização Principal *</Label>
                    <Select
                      value={formData.specializations}
                      onValueChange={(value) => handleInputChange('specializations', value)}
                    >
                      <SelectTrigger className={`glass-input ${errors.specializations ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Selecione sua especialização" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 overflow-y-auto bg-white border-gray-300">
                        {LAW_AREAS.map((area) => (
                          <SelectItem key={area.value} value={area.value} className="text-gray-900">
                            {area.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.specializations && (
                      <p className="text-red-500 text-sm mt-1">{errors.specializations}</p>
                    )}
                  </div>

                  {/* Carteirinha OAB */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">📋 Carteirinha da OAB</h3>
                    
                    {/* Upload Carteirinha OAB - Frente */}
                    <div>
                      <Label className="text-gray-900">Frente da Carteirinha *</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {oabFiles.oab_front ? oabFiles.oab_front.name : 'Nenhum arquivo selecionado'}
                              </p>
                              <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,application/pdf"
                              className="hidden"
                              id="writer_oab_front"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setOabFiles(prev => ({ ...prev, oab_front: file }));
                                if (errors.oab_front) {
                                  setErrors(prev => ({ ...prev, oab_front: '' }));
                                }
                              }}
                            />
                            <label
                              htmlFor="writer_oab_front"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Selecionar
                            </label>
                          </div>
                        </div>
                      </div>
                      {errors.oab_front && (
                        <p className="text-red-500 text-sm mt-1">{errors.oab_front}</p>
                      )}
                    </div>

                    {/* Upload Carteirinha OAB - Verso */}
                    <div className="mt-4">
                      <Label className="text-gray-900">Verso da Carteirinha *</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {oabFiles.oab_back ? oabFiles.oab_back.name : 'Nenhum arquivo selecionado'}
                              </p>
                              <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,application/pdf"
                              className="hidden"
                              id="writer_oab_back"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setOabFiles(prev => ({ ...prev, oab_back: file }));
                                if (errors.oab_back) {
                                  setErrors(prev => ({ ...prev, oab_back: '' }));
                                }
                              }}
                            />
                            <label
                              htmlFor="writer_oab_back"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Selecionar
                            </label>
                          </div>
                        </div>
                      </div>
                      {errors.oab_back && (
                        <p className="text-red-500 text-sm mt-1">{errors.oab_back}</p>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3">
                      📋 Envie fotos claras de ambos os lados da sua carteirinha OAB
                    </p>
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div>
                <Label htmlFor="email" className="text-gray-900">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  maxLength={80}
                  className={`glass-input ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-900">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="glass-input"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-900">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    className={`glass-input ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent bg-transparent text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-900">Confirmar Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirme sua senha"
                    autoComplete="new-password"
                    className={`glass-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent bg-transparent text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Petition Upload Section - Only for Writers */}
              {userType === 'writer' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Petições Autorais</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Faça o upload de 3 petições de sua autoria para análise e aprovação (formato PDF, máx. 5MB cada).
                      </p>
                    </div>

                    {/* Petition 1 */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Petição Autoral 1</p>
                            <p className="text-xs text-gray-500">
                              {petitionFiles.petition1 ? petitionFiles.petition1.name : 'Nenhum arquivo selecionado'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            id="petition1"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setPetitionFiles(prev => ({ ...prev, petition1: file }));
                            }}
                          />
                          <label
                            htmlFor="petition1"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar
                          </label>
                        </div>
                      </div>
                    </div>
                    {errors.petition1 && (
                      <p className="text-red-500 text-sm mt-1">{errors.petition1}</p>
                    )}

                    {/* Petition 2 */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Petição Autoral 2</p>
                            <p className="text-xs text-gray-500">
                              {petitionFiles.petition2 ? petitionFiles.petition2.name : 'Nenhum arquivo selecionado'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            id="petition2"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setPetitionFiles(prev => ({ ...prev, petition2: file }));
                            }}
                          />
                          <label
                            htmlFor="petition2"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar
                          </label>
                        </div>
                      </div>
                    </div>
                    {errors.petition2 && (
                      <p className="text-red-500 text-sm mt-1">{errors.petition2}</p>
                    )}

                    {/* Petition 3 */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Petição Autoral 3</p>
                            <p className="text-xs text-gray-500">
                              {petitionFiles.petition3 ? petitionFiles.petition3.name : 'Nenhum arquivo selecionado'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            id="petition3"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setPetitionFiles(prev => ({ ...prev, petition3: file }));
                            }}
                          />
                          <label
                            htmlFor="petition3"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar
                          </label>
                        </div>
                      </div>
                    </div>
                    {errors.petition3 && (
                      <p className="text-red-500 text-sm mt-1">{errors.petition3}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <div className="text-sm">
                  <Label htmlFor="terms" className="cursor-pointer text-gray-700">
                    Aceito os{' '}
                    <Link
                      to="/legal/terms"
                      className="text-orange-600 hover:text-orange-700 underline"
                      target="_blank"
                    >
                      Termos de Serviço
                    </Link>
                    {' '}e a{' '}
                    <Link
                      to="/legal/privacy"
                      className="text-orange-600 hover:text-orange-700 underline"
                      target="_blank"
                    >
                      Política de Privacidade
                    </Link>
                  </Label>
                </div>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm">{errors.terms}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {`Criar conta como ${userType === 'client' ? 'Cliente' : 'Redator'}`}
              </Button>

              {userType === 'client' ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleRegister}
                  disabled={googleLoading}
                  className="w-full border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Chrome className="mr-2 h-4 w-4" />
                      Cadastrar-se com Google
                    </>
                  )}
                </Button>
              ) : null}
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link
                  to="/auth/login"
                  className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Aprovação para Redatores */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900">
              🎉 Cadastro Realizado com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-4">
              Sua conta foi criada e está sendo analisada pela nossa equipe.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aguarde nossa aprovação
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Analisaremos suas petições autorais e informações profissionais. 
                Você receberá um email em até 5 dias úteis com o resultado da análise.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>Importante:</strong> Verifique sua caixa de entrada e spam. 
                      O email conterá instruções para acessar a plataforma.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  setShowApprovalModal(false);
                  navigate('/auth/login');
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6"
              >
                Entendi, obrigado!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
