import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useUser } from '@/contexts/UserContext';
import { useAvatar } from '@/contexts/AvatarContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTabNavigation } from '@/contexts/TabNavigationContext';
import { UserSettingsService, UserSettings, PaymentCard, UserPlan } from '@/services/userSettingsService';
import { 
  User, 
  Bell, 
  CreditCard, 
  Shield, 
  Settings as SettingsIcon,
  Download,
  Trash2,
  Plus,
  Edit,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Settings() {
  const { user, loading: authLoading } = useNewAuth();
  const { profile: userProfile, updateAvatar } = useUser();
  const { updateAvatarFromBase64, reloadAvatar } = useAvatar();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profileTabValue, setProfileTabValue } = useTabNavigation();

  // All useState hooks MUST be before any early returns
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    document: ''
  });

  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    push: false
  });

  const [security, setSecurity] = useState({
    emailNotifications: true,
    loginAlerts: true
  });

  const [billingAddress, setBillingAddress] = useState({
    street: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    country: 'Brasil',
    taxId: '',
    phone: '+55 11 99999-9999',
    email: 'joao@exemplo.com'
  });

  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [editAddressData, setEditAddressData] = useState(billingAddress);
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    holder: '',
    document: ''
  });

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil'
  });

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [changeType, setChangeType] = useState('next-cycle');
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [paymentTab, setPaymentTab] = useState('current');
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [newCardData, setNewCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const [apiKeys, setApiKeys] = useState([
    {
      id: '1',
      name: 'Produção',
      key: 'sk_live_...',
      created: '2023-12-01',
      lastUsed: '2023-12-15'
    }
  ]);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyData, setApiKeyData] = useState({
    name: '',
    permissions: [] as string[]
  });

  const [subscriptionHistory, setSubscriptionHistory] = useState([
    {
      id: '1',
      plan: 'PROFISSIONAL',
      period: 'Nov 2023 - Dez 2023',
      amount: 5000,
      status: 'Pago',
      date: '2023-11-15'
    }
  ]);

  const [usage, setUsage] = useState({
    petitions: 0,
    petitions_limit: 50,
    api_calls: 0,
    storage_used: '0 MB'
  });

  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<UserPlan[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Removido array mock de planos - agora carregamos do banco

  const [isLoading, setIsLoading] = useState(false);
  const [exportData, setExportData] = useState({
    petitions: true,
    chats: true,
    documents: false,
    settings: true
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Additional states for button functionality
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Carregar dados reais do usuário de forma assíncrona (não bloqueia a interface)
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.uid) return;
      
      try {
        // Carregar configurações principais primeiro
        const settings = await UserSettingsService.getUserSettings(user.uid);
        if (settings) {
          setUserSettings(settings);
          
          // Atualizar formData com dados reais
          setFormData({
            name: settings.full_name || '',
            email: settings.email || '',
            phone: settings.phone || '',
            company: settings.company || '',
            document: settings.document || ''
          });

          // Atualizar notificações com dados reais
          setNotifications({
            email: settings.email_notifications ?? true,
            push: settings.push_notifications ?? false
          });

          // Atualizar segurança com dados reais
          setSecurity({
            emailNotifications: settings.email_notifications ?? true,
            loginAlerts: settings.login_alerts ?? true
          });

          // Atualizar endereço de cobrança com dados reais
          setBillingAddress(prev => ({
            ...prev,
            street: settings.billing_street || '',
            city: settings.billing_city || '',
            state: settings.billing_state || '',
            zipCode: settings.billing_zip_code || '',
            country: settings.billing_country || 'Brasil',
            taxId: '',
            phone: settings.phone || '',
            email: settings.email || ''
          }));

          // Definir foto do perfil se existir
          if (settings.avatar_url) {
            setProfilePhoto(settings.avatar_url);
          }
        }

        // Função para recarregar dados do plano
        const loadPlanData = async () => {
          try {
            const [plan, usageData, cards, plans] = await Promise.all([
              UserSettingsService.getUserCurrentPlan(user.uid),
              UserSettingsService.getUserUsage(user.uid),
              UserSettingsService.getUserPaymentCards(user.uid),
              UserSettingsService.getAvailablePlans()
            ]);
            setCurrentPlan(plan);
            setUsage(usageData);
            setPaymentCards(cards);
            setAvailablePlans(plans);
          } catch (error) {
            console.error('Erro ao carregar dados adicionais:', error);
          }
        };

        // Carregar dados iniciais
        loadPlanData();

      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro ao carregar configurações",
          description: "Não foi possível carregar suas configurações. Tente novamente.",
          variant: "destructive"
        });
      }
    };

    loadUserSettings();
  }, [user?.uid, toast]);

  // Escutar evento customizado de atualização de plano
  useEffect(() => {
    if (!user?.uid) return;

    const handlePlanUpdate = async () => {
      try {
        const [plan, usageData] = await Promise.all([
          UserSettingsService.getUserCurrentPlan(user.uid),
          UserSettingsService.getUserUsage(user.uid)
        ]);
        setCurrentPlan(plan);
        setUsage(usageData);
      } catch (error) {
        console.error('Erro ao recarregar dados do plano:', error);
      }
    };

    window.addEventListener('planUpdated', handlePlanUpdate);

    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate);
    };
  }, [user?.uid]);

  // Inicializar dados do endereço quando o modal abrir
  useEffect(() => {
    if (addressDialogOpen) {
      setNewAddressData({
        street: billingAddress.street,
        city: billingAddress.city,
        state: billingAddress.state,
        zipCode: billingAddress.zipCode
      });
    }
  }, [addressDialogOpen, billingAddress]);

  // Funções de formatação
  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + número)
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara
    if (limited.length <= 10) {
      // Telefone fixo: (11) 1234-5678
      return limited.replace(/(\d{2})(\d{4})(\d{0,4})/, (match, ddd, part1, part2) => {
        if (part2) return `(${ddd}) ${part1}-${part2}`;
        if (part1) return `(${ddd}) ${part1}`;
        if (ddd) return `(${ddd}`;
        return limited;
      });
    } else {
      // Celular: (11) 91234-5678
      return limited.replace(/(\d{2})(\d{5})(\d{0,4})/, (match, ddd, part1, part2) => {
        if (part2) return `(${ddd}) ${part1}-${part2}`;
        if (part1) return `(${ddd}) ${part1}`;
        if (ddd) return `(${ddd}`;
        return limited;
      });
    }
  };

  const formatDocument = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Se tiver 11 dígitos ou menos, formata como CPF
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (match, part1, part2, part3, part4) => {
        if (part4) return `${part1}.${part2}.${part3}-${part4}`;
        if (part3) return `${part1}.${part2}.${part3}`;
        if (part2) return `${part1}.${part2}`;
        if (part1) return part1;
        return numbers;
      });
    } else {
      // Se tiver mais de 11 dígitos, formata como CNPJ (limita a 14)
      const limited = numbers.slice(0, 14);
      return limited.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (match, part1, part2, part3, part4, part5) => {
        if (part5) return `${part1}.${part2}.${part3}/${part4}-${part5}`;
        if (part4) return `${part1}.${part2}.${part3}/${part4}`;
        if (part3) return `${part1}.${part2}.${part3}`;
        if (part2) return `${part1}.${part2}`;
        if (part1) return part1;
        return limited;
      });
    }
  };

  // Early return ONLY for auth loading - settings will load in background
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  const handleUpdateProfile = async (data: any) => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const success =       await UserSettingsService.updateUserSettings(user.uid, {
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        document: data.document
      });

      if (success) {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        });
        
        // Recarregar dados
        const updatedSettings = await UserSettingsService.getUserSettings(user.uid);
        if (updatedSettings) {
          setUserSettings(updatedSettings);
        }
      } else {
        throw new Error('Falha ao salvar dados');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível salvar suas informações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user?.uid) return;
    
    setIsAddressLoading(true);
    try {
      const updateData = {
        billing_street: newAddressData.street,
        billing_city: newAddressData.city,
        billing_state: newAddressData.state,
        billing_zip_code: newAddressData.zipCode,
        billing_country: 'Brasil'
      };
      
      const success = await UserSettingsService.updateUserSettings(user.uid, updateData);

      if (success) {
        setBillingAddress(prev => ({
          ...prev,
          street: newAddressData.street,
          city: newAddressData.city,
          state: newAddressData.state,
          zipCode: newAddressData.zipCode
        }));
        
        toast({
          title: "Endereço atualizado",
          description: "Seu endereço foi salvo com sucesso.",
        });
        
        setAddressDialogOpen(false);
      } else {
        console.error('❌ Falha ao salvar endereço - success = false');
        throw new Error('Falha ao salvar endereço');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Erro ao salvar endereço",
        description: "Não foi possível salvar seu endereço. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleExport = async () => {
    if (!user?.uid) return;
    
    try {
      const data = await UserSettingsService.exportUserData(user.uid);
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veredicta-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Dados exportados",
        description: "Seus dados foram baixados com sucesso.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erro ao exportar dados",
        description: "Não foi possível exportar seus dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;


    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem (JPG, PNG).",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingPhoto(true);

    // Create FileReader to convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      
      try {
        // Salvar no banco de dados
        const success = await UserSettingsService.updateAvatar(user?.uid || '', result);
        
        if (success) {
          setProfilePhoto(result);
          
          // Atualizar imediatamente no contexto (para feedback visual rápido)
          updateAvatar(result); // Update shared context
          updateAvatarFromBase64(result); // Update header avatar - CRÍTICO para header
          
          // Atualizar userSettings local também
          setUserSettings(prev => prev ? { ...prev, avatar_url: result } : null);
          
          toast({
            title: "Foto alterada",
            description: "Sua foto de perfil foi atualizada com sucesso.",
          });
          setPhotoDialogOpen(false);
          
          // NÃO recarregar do banco imediatamente - isso pode sobrescrever o valor que acabamos de definir
          // Só recarregar se necessário (ex: após refresh da página)
        } else {
          throw new Error('Falha ao salvar foto');
        }
      } catch (error) {
        console.error('❌ Error updating avatar:', error);
        toast({
          title: "Erro ao alterar foto",
          description: "Não foi possível salvar sua foto. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setUploadingPhoto(false);
      }
    };

    reader.onerror = () => {
      setUploadingPhoto(false);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar a imagem. Tente novamente.",
        variant: "destructive"
      });
    };

    reader.readAsDataURL(file);
  };

  // Função para formatar número do cartão com espaços
  const formatCardNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Adiciona espaços a cada 4 dígitos
    const formattedValue = numericValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Limita a 19 caracteres (16 dígitos + 3 espaços)
    return formattedValue.slice(0, 19);
  };

  // Função para limpar formatação (remover espaços) antes de salvar
  const cleanCardNumber = (formattedNumber: string) => {
    return formattedNumber.replace(/\s/g, '');
  };

  // Função para formatar data de validade (MM/AA)
  const formatExpiryDate = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Adiciona barra após 2 dígitos
    if (numericValue.length >= 2) {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}`;
    }
    
    return numericValue;
  };

  const handleAddCard = async () => {
    if (!user?.uid) return;

    // Validar dados do cartão
    if (!newCardData.number || !newCardData.name || !newCardData.expiry || !newCardData.cvv) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos do cartão.",
        variant: "destructive"
      });
      return;
    }

    // Limpar formatação do número do cartão (remover espaços)
    const cleanNumber = cleanCardNumber(newCardData.number);
    
    // Extrair últimos 4 dígitos e bandeira
    const lastFour = cleanNumber.slice(-4);
    const brand = cleanNumber.startsWith('4') ? 'Visa' : 
                  cleanNumber.startsWith('5') ? 'Mastercard' : 'Outro';

    // Extrair mês e ano da validade
    const [month, year] = newCardData.expiry.split('/');
    if (!month || !year) {
      toast({
        title: "Data inválida",
        description: "Use o formato MM/AA para a validade.",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await UserSettingsService.addPaymentCard(user.uid, {
        last_four: lastFour,
        brand: brand,
        expiry_month: parseInt(month),
        expiry_year: parseInt('20' + year),
        holder_name: newCardData.name
      });

      if (success) {
        toast({
          title: "Cartão adicionado",
          description: "Seu cartão foi adicionado com sucesso.",
        });
        
        // Recarregar cartões
        const cards = await UserSettingsService.getUserPaymentCards(user.uid);
        setPaymentCards(cards);
        
        setCardDialogOpen(false);
        setNewCardData({ number: '', name: '', expiry: '', cvv: '' });
      } else {
        throw new Error('Falha ao adicionar cartão');
      }
    } catch (error: any) {
      console.error('Error adding card:', error);
      
      let errorMessage = "Não foi possível adicionar o cartão. Tente novamente.";
      
      // Tratar erros específicos
      if (error?.code === '42501') {
        errorMessage = "Erro de permissão. Verifique se você está logado corretamente.";
      } else if (error?.message?.includes('row-level security policy')) {
        errorMessage = "Erro de segurança. Faça logout e login novamente.";
      } else if (error?.message?.includes('duplicate key')) {
        errorMessage = "Este cartão já está cadastrado.";
      }
      
      toast({
        title: "Erro ao adicionar cartão",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Função para formatar CEP (00000-000)
  const formatCEP = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Adiciona hífen após 5 dígitos
    if (numericValue.length >= 5) {
      return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
    }
    
    return numericValue;
  };

  // Função para validar dados de CEP de diferentes APIs
  const isValidCepData = (data: any, apiIndex: number): boolean => {
    if (!data) return false;
    
    switch (apiIndex) {
      case 0: // BrasilAPI
        return data.cep && (data.street || data.city || data.state);
      case 1: // ViaCEP
        return !data.erro && (data.logradouro || data.localidade || data.uf);
      case 2: // AwesomeAPI
        return data.cep && (data.address || data.city || data.state);
      case 3: // Postmon
        return data.code && (data.address || data.district || data.state);
      default:
        return false;
    }
  };

  // Função para processar dados de CEP de diferentes APIs
  const processCepData = (data: any, apiIndex: number) => {
    switch (apiIndex) {
      case 0: // BrasilAPI
        return {
          street: data.street || '',
          city: data.city || '',
          state: data.state || ''
        };
      case 1: // ViaCEP
        return {
          street: data.logradouro || '',
          city: data.localidade || '',
          state: data.uf || ''
        };
      case 2: // AwesomeAPI
        return {
          street: data.address || '',
          city: data.city || '',
          state: data.state || ''
        };
      case 3: // Postmon
        return {
          street: data.address || '',
          city: data.district || '',
          state: data.state || ''
        };
      default:
        return { street: '', city: '', state: '' };
    }
  };

  // Função para buscar endereço por CEP
  const fetchAddressByCEP = async (cep: string) => {
    try {
      
      // Limpar CEP (remover hífen e espaços)
      const cleanCEP = cep.replace(/\D/g, '');
      
      // Validar se tem 8 dígitos
      if (cleanCEP.length !== 8) {
        console.error('❌ fetchAddressByCEP: CEP inválido - deve ter 8 dígitos, tem:', cleanCEP.length);
        throw new Error('CEP deve ter 8 dígitos');
      }

      // Tentar múltiplas APIs de CEP para contornar problemas de CORS
      const apis = [
        `https://brasilapi.com.br/api/cep/v1/${cleanCEP}`, // Primeira tentativa - geralmente funciona melhor
        `https://viacep.com.br/ws/${cleanCEP}/json/`, // Segunda tentativa
        `https://cep.awesomeapi.com.br/json/${cleanCEP}`, // Terceira tentativa
        `https://api.postmon.com.br/v1/cep/${cleanCEP}` // Quarta tentativa
      ];
      
      let response = null;
      let cepData = null;
      
      for (let i = 0; i < apis.length; i++) {
        try {
          const apiUrl = apis[i];
          
          // Fazer requisição para a API
          response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            mode: 'cors'
          });
          
          if (response.ok) {
            cepData = await response.json();
            
            // Verificar se os dados estão válidos para esta API
            if (isValidCepData(cepData, i)) {
              break;
            }
          }
        } catch (error) {
          if (i === apis.length - 1) {
            throw error; // Se for a última tentativa, relança o erro
          }
        }
      }
      
      if (!cepData) {
        throw new Error('Todas as APIs de CEP falharam');
      }
      
      // Encontrar qual API funcionou
      let workingApiIndex = -1;
      for (let i = 0; i < apis.length; i++) {
        if (isValidCepData(cepData, i)) {
          workingApiIndex = i;
          break;
        }
      }
      
      if (workingApiIndex === -1) {
        console.error('❌ fetchAddressByCEP: Dados recebidos não são válidos para nenhuma API');
        throw new Error('Dados do endereço inválidos');
      }
      
      // Processar dados da API que funcionou
      const processedData = processCepData(cepData, workingApiIndex);
      
      // Atualizar os campos do endereço
      setNewAddressData(prev => ({
        ...prev,
        street: processedData.street,
        city: processedData.city,
        state: processedData.state,
        zipCode: cep
      }));
      
      toast({
        title: "Endereço encontrado",
        description: "Endereço preenchido automaticamente pelo CEP.",
      });
      
    } catch (error) {
      console.error('❌ fetchAddressByCEP: Erro completo:', error);
      console.error('❌ fetchAddressByCEP: Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      toast({
        title: "Erro ao buscar CEP",
        description: error instanceof Error ? error.message : "CEP não encontrado. Preencha manualmente.",
        variant: "destructive"
      });
    }
  };

  const handleAddressEdit = async () => {
    // Chamar a função que salva no banco de dados
    await handleSaveAddress();
  };

  const handlePlanChange = () => {
    toast({
      title: "Plano alterado",
      description: "Seu plano foi alterado com sucesso.",
    });
    setPlanDialogOpen(false);
  };

  const handleChangePassword = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a senha atual, nova senha e confirmação.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e confirmação devem ser iguais.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.new.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      const success = await UserSettingsService.changePassword(passwordData.new, passwordData.current);

      if (success) {
        toast({
          title: "Senha alterada",
          description: "Sua senha foi alterada com sucesso.",
        });
        
        // Recarregar configurações para atualizar data
        const settings = await UserSettingsService.getUserSettings(user?.uid || '');
        if (settings) {
          setUserSettings(settings);
        }
        
        setIsPasswordModalOpen(false);
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        throw new Error('Falha ao alterar senha');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      let errorMessage = "Não foi possível alterar a senha. Tente novamente.";
      
      // Tratar erros específicos do Firebase
      if (error?.code === 'auth/requires-recent-login') {
        errorMessage = "Para alterar a senha, é necessário fazer login novamente. Por favor, faça logout e login novamente.";
      } else if (error?.code === 'auth/wrong-password') {
        errorMessage = "Senha atual incorreta. Verifique e tente novamente.";
      } else if (error?.code === 'auth/weak-password') {
        errorMessage = "A nova senha é muito fraca. Escolha uma senha mais forte.";
      } else if (error?.code === 'auth/invalid-credential') {
        errorMessage = "Credenciais inválidas. Verifique sua senha atual.";
      } else if (error?.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
      }
      
      toast({
        title: "Erro ao alterar senha",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Conta excluída",
      description: "Sua conta foi excluída permanentemente.",
      variant: "destructive"
    });
  };

  // Função para recarregar dados de uso e plano (útil para atualizar contadores)
  const refreshUsageData = async () => {
    if (!user?.uid) return;
    
    try {
      // Atualizar tanto o uso quanto o plano atual em paralelo
      const [usageData, planData] = await Promise.all([
        UserSettingsService.getUserUsage(user.uid),
        UserSettingsService.getUserCurrentPlan(user.uid)
      ]);
      
      setUsage(usageData);
      setCurrentPlan(planData);
      
      // Mostrar feedback visual
      toast({
        title: "Dados atualizados",
        description: "As informações de uso e plano foram atualizadas.",
      });
    } catch (error) {
      console.error('❌ Erro ao recarregar dados de uso:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Adicionar useEffect para atualizar dados de uso quando a página carregar
  useEffect(() => {
    if (user?.uid) {
      refreshUsageData();
    }
  }, [user?.uid]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-6 w-6 text-orange-600" />
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      <Tabs value={profileTabValue} onValueChange={setProfileTabValue} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="billing">Cobrança</TabsTrigger>
          <TabsTrigger value="plan">Plano</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={profilePhoto || userSettings?.avatar_url} 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg">
                    {formData.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || user?.email?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={uploadingPhoto}>
                        {uploadingPhoto ? 'Carregando...' : 'Alterar Foto'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Alterar Foto de Perfil</DialogTitle>
                        <DialogDescription>
                          Selecione uma nova foto para seu perfil. Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        {profilePhoto && (
                          <div className="mb-4 flex justify-center">
                            <Avatar className="h-24 w-24">
                              <AvatarImage 
                                src={profilePhoto} 
                                className="object-cover"
                              />
                              <AvatarFallback>Preview</AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handlePhotoChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                          disabled={uploadingPhoto}
                        />
                        {uploadingPhoto && (
                          <div className="flex items-center justify-center mt-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                            <span className="ml-2 text-sm text-gray-600">Processando imagem...</span>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPhotoDialogOpen(false)} disabled={uploadingPhoto}>
                          Cancelar
                        </Button>
                        {profilePhoto && (
                          <Button 
                            onClick={() => {
                              setProfilePhoto(null);
                              updateAvatar(''); // Remove from shared context
                              updateAvatarFromBase64(''); // Remove from header
                              toast({
                                title: "Foto removida",
                                description: "Foto de perfil foi removida.",
                              });
                            }}
                            variant="outline"
                            disabled={uploadingPhoto}
                          >
                            Remover Foto
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG até 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      setFormData(prev => ({...prev, phone: formatted}));
                    }}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({...prev, company: e.target.value}))}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="document">Documento</Label>
                  <Input
                    id="document"
                    value={formData.document}
                    onChange={(e) => {
                      const formatted = formatDocument(e.target.value);
                      setFormData(prev => ({...prev, document: formatted}));
                    }}
                    placeholder="CPF ou CNPJ"
                  />
                </div>
              </div>

              <Button onClick={() => handleUpdateProfile(formData)} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Preferências de notificação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">Receba atualizações por email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={async (checked) => {
                    setNotifications(prev => ({...prev, email: checked}));
                    
                    // Salvar no banco de dados
                    if (user?.uid) {
                      try {
                        const success = await UserSettingsService.updateUserSettings(user.uid, {
                          email_notifications: checked
                        });
                      } catch (error) {
                        console.error('📧 Error saving email notifications:', error);
                        toast({
                          title: "Erro",
                          description: "Não foi possível salvar as configurações de email.",
                          variant: "destructive"
                        });
                      }
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={async (checked) => {
                    setNotifications(prev => ({...prev, push: checked}));
                    
                    // Salvar no banco de dados
                    if (user?.uid) {
                      try {
                        const success = await UserSettingsService.updateUserSettings(user.uid, {
                          push_notifications: checked
                        });
                      } catch (error) {
                        console.error('🔔 Error saving push notifications:', error);
                        toast({
                          title: "Erro",
                          description: "Não foi possível salvar as configurações de push.",
                          variant: "destructive"
                        });
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="login-alerts">Alertas de Login</Label>
                  <p className="text-sm text-muted-foreground">Seja notificado sobre novos logins</p>
                </div>
                <Switch
                  id="login-alerts"
                  checked={security.loginAlerts}
                  onCheckedChange={async (checked) => {
                    setSecurity(prev => ({...prev, loginAlerts: checked}));
                    
                    // Salvar no banco de dados
                    if (user?.uid) {
                      await UserSettingsService.updateUserSettings(user.uid, {
                        login_alerts: checked
                      });
                    }
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
                  Alterar Senha
                </Button>
                <p className="text-sm text-gray-500">
                  Última alteração: {userSettings?.last_password_change ? 
                    new Date(userSettings.last_password_change).toLocaleDateString('pt-BR') : 
                    'Não informado'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informações de Cobrança
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Métodos de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentCards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum cartão cadastrado</p>
                  <p className="text-sm">Adicione um cartão para facilitar seus pagamentos</p>
                </div>
              ) : (
                paymentCards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-6 rounded text-white text-xs flex items-center justify-center font-bold ${
                        card.brand === 'Visa' ? 'bg-blue-600' : 
                        card.brand === 'Mastercard' ? 'bg-red-600' : 'bg-gray-600'
                      }`}>
                        {card.brand.toUpperCase().slice(0, 4)}
                      </div>
                      <div>
                        <p className="font-medium">**** **** **** {card.last_four}</p>
                        <p className="text-sm text-muted-foreground">
                          Expira em {card.expiry_month.toString().padStart(2, '0')}/{card.expiry_year.toString().slice(-2)}
                        </p>
                        <p className="text-xs text-gray-400">{card.holder_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {card.is_default && <Badge variant="secondary">Padrão</Badge>}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (user?.uid) {
                            await UserSettingsService.removePaymentCard(user.uid, card.id);
                            const cards = await UserSettingsService.getUserPaymentCards(user.uid);
                            setPaymentCards(cards);
                            toast({
                              title: "Cartão removido",
                              description: "Cartão removido com sucesso.",
                            });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}

              <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Cartão
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Cartão</DialogTitle>
                    <DialogDescription>
                      Adicione um novo cartão de crédito.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        value={newCardData.number}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          setNewCardData(prev => ({ ...prev, number: formatted }));
                        }}
                        maxLength={19}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input
                        id="cardName"
                        placeholder="Nome como está no cartão"
                        value={newCardData.name}
                        onChange={(e) => setNewCardData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Validade</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/AA"
                          value={newCardData.expiry}
                          onChange={(e) => {
                            const formatted = formatExpiryDate(e.target.value);
                            setNewCardData(prev => ({ ...prev, expiry: formatted }));
                          }}
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input
                          id="cardCvv"
                          placeholder="123"
                          value={newCardData.cvv}
                          onChange={(e) => {
                            // Permitir apenas números e máximo 3 dígitos
                            const numericValue = e.target.value.replace(/\D/g, '').slice(0, 3);
                            setNewCardData(prev => ({ ...prev, cvv: numericValue }));
                          }}
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCardDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddCard}>
                      Adicionar Cartão
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço de Cobrança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{billingAddress.street}</p>
                <p className="text-gray-600">
                  {billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}
                </p>
                <p className="text-gray-600">{billingAddress.country}</p>
              </div>
              <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Endereço
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Endereço</DialogTitle>
                    <DialogDescription>
                      Atualize suas informações de endereço.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="street">Rua e Número</Label>
                      <Input
                        id="street"
                        value={newAddressData.street}
                        onChange={(e) => setNewAddressData(prev => ({ ...prev, street: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={newAddressData.city}
                          onChange={(e) => setNewAddressData(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={newAddressData.state}
                          onChange={(e) => setNewAddressData(prev => ({ ...prev, state: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">CEP</Label>
                      <div className="flex gap-2">
                        <Input
                          id="zipCode"
                          placeholder="00000-000"
                          value={newAddressData.zipCode}
                          onChange={(e) => {
                            const formatted = formatCEP(e.target.value);
                            setNewAddressData(prev => ({ ...prev, zipCode: formatted }));
                            
                            // Buscar automaticamente quando tiver 8 dígitos
                            const cleanCEP = formatted.replace(/\D/g, '');
                            if (cleanCEP.length === 8) {
                              // Aguardar um pouco para o usuário terminar de digitar
                              setTimeout(() => {
                                fetchAddressByCEP(formatted);
                              }, 500);
                            }
                          }}
                          maxLength={9}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const cleanCEP = newAddressData.zipCode.replace(/\D/g, '');
                            
                            if (cleanCEP.length === 8) {
                              fetchAddressByCEP(newAddressData.zipCode);
                            } else {
                              toast({
                                title: "CEP inválido",
                                description: `CEP deve ter 8 dígitos. Você digitou ${cleanCEP.length} dígitos.`,
                                variant: "destructive"
                              });
                            }
                          }}
                          disabled={newAddressData.zipCode.replace(/\D/g, '').length !== 8}
                        >
                          Buscar
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Digite o CEP e clique em "Buscar" para preencher automaticamente
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddressEdit}>
                      Salvar Endereço
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plano Atual</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Assinatura e plano
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Se não tem plano ativo, assumir plano Free
                const activePlan = currentPlan || {
                  id: 'free',
                  plan_code: 'free',
                  name: 'Free',
                  price: 0,
                  features: ['1 petição gratuita'],
                  petitions_limit: 1,
                  api_access: false,
                  support_level: 'email',
                  status: 'active' as const
                };

                return (
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={activePlan.name === 'Free' ? 'secondary' : 'default'} 
                      className="text-lg py-2 px-4"
                    >
                      {activePlan.name}
                    </Badge>
                    <div>
                      <p className="font-semibold">
                        {activePlan.price > 0 ? `R$ ${activePlan.price}/mês` : 'Gratuito'}
                      </p>
                      {activePlan.next_billing_date ? (
                        <p className="text-sm text-muted-foreground">
                          Próxima cobrança: {new Date(activePlan.next_billing_date).toLocaleDateString('pt-BR')}
                        </p>
                      ) : activePlan.name !== 'Free' ? (
                        <p className="text-sm text-muted-foreground">
                          Cobrança não informada
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Plano gratuito - sem cobrança
                        </p>
                      )}
                      {activePlan.name === 'Free' && (
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ Apenas 1 petição por CPF/CNPJ
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="mt-6 p-4 bg-container-primary border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">Uso Atual</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshUsageData}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Atualizar
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Petições:</span>
                    <span className="ml-2 font-medium">
                      {usage.petitions}/{usage.petitions_limit || 1}
                    </span>
                    {currentPlan && (
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${Math.min((usage.petitions / (usage.petitions_limit || 1)) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chamadas API:</span>
                    <span className="ml-2 font-medium">{usage.api_calls}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Armazenamento:</span>
                    <span className="ml-2 font-medium">{usage.storage_used}</span>
                  </div>
                  {currentPlan && (
                    <div>
                      <span className="text-muted-foreground">Suporte:</span>
                      <span className="ml-2 font-medium capitalize">{currentPlan.support_level}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                className="mt-4"
                onClick={() => navigate('/client/plans')}
              >
                Alterar Plano
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Dados</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Exportar dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Exportar Dados</Label>
                    <p className="text-sm text-muted-foreground">
                      Baixe uma cópia dos seus dados
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-red-600">Excluir Conta</Label>
                    <p className="text-sm text-muted-foreground">
                      Remova permanentemente sua conta e todos os dados
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Conta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso irá excluir permanentemente sua conta e remover todos os seus dados de nossos servidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Excluir Conta
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Alterar Senha */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite sua nova senha abaixo. Certifique-se de que ela seja segura.
            </DialogDescription>
          </DialogHeader>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleChangePassword();
            }}
            className="space-y-4"
          >
            {/* Campo de username oculto para acessibilidade e autofill */}
            <input
              type="text"
              autoComplete="username"
              value={user?.email || ''}
              readOnly
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            />
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                placeholder="Digite sua senha atual"
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
              />
              <p className="text-xs text-gray-500">
                Necessária para confirmar sua identidade
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Digite sua nova senha"
                value={passwordData.new}
                onChange={(e) => {
                  setPasswordData(prev => ({ ...prev, new: e.target.value }));
                  // Calcular força da senha
                  const strength = Math.min(e.target.value.length * 2, 100);
                  setPasswordStrength(strength);
                }}
              />
              
              {/* Indicador de força da senha */}
              {passwordData.new && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Força da senha:</span>
                    <span className={passwordStrength >= 80 ? 'text-green-600' : passwordStrength >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                      {passwordStrength >= 80 ? 'Forte' : passwordStrength >= 60 ? 'Média' : 'Fraca'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${passwordStrength >= 80 ? 'bg-green-500' : passwordStrength >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Confirme sua nova senha"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
              />
              
              {/* Indicador de correspondência */}
              {passwordData.confirm && (
                <div className={`text-xs ${passwordData.new === passwordData.confirm ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordData.new === passwordData.confirm ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                </div>
              )}
            </div>

            {/* Dicas de segurança */}
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Dicas para uma senha segura:</h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Use pelo menos 8 caracteres</li>
                <li>• Combine letras maiúsculas e minúsculas</li>
                <li>• Inclua números e símbolos especiais</li>
                <li>• Evite informações pessoais</li>
              </ul>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordData({ current: '', new: '', confirm: '' });
                  setPasswordStrength(0);
                }}
                disabled={isPasswordLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isPasswordLoading || !passwordData.current || !passwordData.new || !passwordData.confirm || passwordData.new !== passwordData.confirm}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isPasswordLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Alterando...
                  </>
                ) : (
                  'Alterar Senha'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}