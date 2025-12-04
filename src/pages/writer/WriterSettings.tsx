import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, Bell, CreditCard, Star, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useAvatar } from '@/contexts/AvatarContext';
import { useTabNavigation } from '@/contexts/TabNavigationContext';
import { supabase } from '@/lib/supabaseClient'
import { notifyAdmin } from '@/api/notify-admin';
import { DatabaseService, WriterRatingStats } from '@/services/databaseService';

interface WriterProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  oab: string;
  oab_state: string;
  specialties: string[];
  experience_years: number;
  bio: string;
  hourly_rate: number;
  availability: string;
  city: string;
  state: string;
  rating: number;
  completed_petitions: number;
  bank_data: {
    bank: string;
    agency: string;
    account: string;
    pix_key: string;
  };
  avatar?: string;
}

const availableSpecialties = [
  'Compliance',
  'Direito Administrativo',
  'Direito Aeronáutico',
  'Direito Agrário',
  'Direito Ambiental',
  'Direito Antitruste',
  'Direito Autoral',
  'Direito Bancário',
  'Direito Cibernético',
  'Direito Civil',
  'Direito Comercial',
  'Direito Concorrencial',
  'Direito Condominial',
  'Direito Constitucional',
  'Direito Contratual',
  'Direito Cooperativo',
  'Direito da Energia',
  'Direito da Informática',
  'Direito da Seguridade Social',
  'Direito das Sucessões',
  'Direito de Família',
  'Direito de Marcas e Patentes',
  'Direito de Propriedade Intelectual',
  'Direito de Proteção de Dados (LGPD)',
  'Direito Desportivo',
  'Direito Digital/Tecnológico',
  'Direito do Agronegócio',
  'Direito do Comércio Internacional',
  'Direito do Consumidor',
  'Direito do Entretenimento',
  'Direito Eleitoral',
  'Direito Empresarial',
  'Direito Espacial',
  'Direito Farmacêutico',
  'Direito Financeiro',
  'Direito Imobiliário',
  'Direito Internacional dos Direitos Humanos',
  'Direito Internacional Privado',
  'Direito Internacional Público',
  'Direito Marítimo',
  'Direito Médico/Hospitalar',
  'Direito Militar',
  'Direito Minerário',
  'Direito Municipal',
  'Direito Notarial e Registral',
  'Direito Penal',
  'Direito Petrolífero',
  'Direito Previdenciário',
  'Direito Processual Civil',
  'Direito Processual do Trabalho',
  'Direito Processual Penal',
  'Direito Regulatório',
  'Direito Sanitário',
  'Direito Securitário',
  'Direito Sindical',
  'Direito Trabalhista',
  'Direito Tributário',
  'Direito Urbanístico',
  'Governança Corporativa'
].sort();

const UFS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

// Função para formatar Agência (formato: XXXX ou XXXX-X)
const formatAgency = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 5 dígitos (4 + 1 dígito verificador)
  const limited = numbers.slice(0, 5);
  
  // Formata: XXXX ou XXXX-X
  if (limited.length <= 4) {
    return limited;
  } else {
    return `${limited.slice(0, 4)}-${limited.slice(4)}`;
  }
};

// Função para formatar Conta (formato: XXXXX-X ou XXXXXXXX-X)
const formatAccount = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 9 dígitos (8 + 1 dígito verificador)
  const limited = numbers.slice(0, 9);
  
  // Formata: XXXXX-X ou XXXXXXXX-X
  if (limited.length <= 5) {
    return limited;
  } else if (limited.length <= 8) {
    return `${limited.slice(0, 5)}-${limited.slice(5)}`;
  } else {
    return `${limited.slice(0, 8)}-${limited.slice(8)}`;
  }
};

export default function WriterSettings() {
  const { user } = useNewAuth();
  const { avatarUrl: contextAvatarUrl, setAvatarUrl, reloadAvatar } = useAvatar();
  const { profileTabValue, setProfileTabValue } = useTabNavigation();
  const [searchParams] = useSearchParams();


  // controla se este perfil já existia (para decidir se notifica admin)
  const [isExistingProfile, setIsExistingProfile] = useState(false);

  // Debug/estado de tela
  const [profile, setProfile] = useState<WriterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ✅ Estatísticas de avaliações (mesmas do dashboard)
  const [ratingStats, setRatingStats] = useState<WriterRatingStats>({
    average_rating: 0,
    total_ratings: 0,
    rating_distribution: {}
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    newPetitions: true,
    payments: true,
    messages: true,
    marketingEmails: false
  });

  // Tab via URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['profile', 'professional', 'notifications', 'banking'].includes(tabFromUrl)) {
      setProfileTabValue(tabFromUrl);
    }
  }, [searchParams]);

  // Carrega perfil e estatísticas de avaliações
  useEffect(() => {
    if (user) {
      loadWriterProfile();
      loadRatingStats();
    }
  }, [user]);

  // ✅ Carregar estatísticas de avaliações (mesmas do dashboard)
  const loadRatingStats = async () => {
    if (!user?.uid) return;
    
    try {
      const stats = await DatabaseService.getWriterRatingStats(user.uid);
      setRatingStats(stats);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas de avaliações:', error);
    }
  };

  // Sincronizar photoPreview com contextAvatarUrl quando mudar
  useEffect(() => {
    if (contextAvatarUrl && !photoPreview) {
      setPhotoPreview(contextAvatarUrl);
    }
  }, [contextAvatarUrl, photoPreview]);

  const loadWriterProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Usuário demo
      if (user.uid.includes('mock_')) {
        const demoProfile: WriterProfile = {
          id: user.uid,
          name: 'Redator Demo',
          email: user.email,
          phone: '(11) 99999-0000',
          oab: '000000',
          oab_state: 'SP',
          specialties: ['Direito Civil', 'Direito Processual Civil'],
          experience_years: 5,
          bio: 'Perfil de demonstração do redator jurídico.',
          hourly_rate: 150,
          availability: 'full_time',
          city: 'São Paulo',
          state: 'SP',
          rating: 4.8,
          completed_petitions: 0,
          bank_data: { bank: '', agency: '', account: '', pix_key: '' }
        };
        setProfile(demoProfile);
        setIsExistingProfile(true);
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles_v2')
        .select('*')
        .ilike('firebase_uid', user.uid)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error loading profile:', error);
        throw error;
      }

      if (profileData) {
        const userProfile: WriterProfile = {
          id: profileData.id,
          name: profileData.full_name || 'Redator',
          email: profileData.email || user.email,
          phone: profileData.phone || '',
          oab: profileData.oab_number || '',
          oab_state: profileData.oab_state || 'SP',
          // specialties já vem como JSONB (objeto/array), não precisa parse
          specialties: Array.isArray(profileData.specialties) 
            ? profileData.specialties 
            : (profileData.specialties ? JSON.parse(profileData.specialties) : []),
          experience_years: profileData.experience_years || 0,
          bio: profileData.bio || '',
          hourly_rate: profileData.hourly_rate || 0,
          availability: profileData.availability || 'full_time',
          city: profileData.city || '',
          state: profileData.state || '',
          rating: profileData.average_rating || profileData.rating || 0, // ✅ Usar average_rating (atualizado por trigger) ou rating (fallback)
          completed_petitions: profileData.completed_petitions || 0,
          bank_data: {
            bank: profileData.bank_name || '',
            agency: profileData.bank_agency || '',
            account: profileData.bank_account || '',
            pix_key: profileData.pix_key || ''
          },
          avatar: profileData.avatar_url || undefined
        };
        setProfile(userProfile);
        // Inicializar photoPreview com o avatar do perfil
        if (profileData.avatar_url) {
          setPhotoPreview(profileData.avatar_url);
        }
        setIsExistingProfile(true);
      } else {
        const defaultProfile: WriterProfile = {
          id: user.uid,
          name: 'Redator',
          email: user.email,
          phone: '',
          oab: '',
          oab_state: 'SP',
          specialties: [],
          experience_years: 0,
          bio: '',
          hourly_rate: 0,
          availability: 'full_time',
          city: '',
          state: '',
          rating: 0,
          completed_petitions: 0,
          bank_data: { bank: '', agency: '', account: '', pix_key: '' }
        };
        setProfile(defaultProfile);
        setIsExistingProfile(false);
      }
    } catch (error) {
      console.error('❌ Error loading writer profile:', error);
      toast.error('Erro ao carregar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = useCallback(async () => {
    if (!profile || !user) return;

    try {
      setSaving(true);

      // Demo
      if (user.uid.includes('mock_')) {
        toast.success('Perfil atualizado com sucesso! (Demo)');
        return;
      }

      // Dados completos do perfil do redator
      const updateData = {
        full_name: profile.name,
        email: profile.email,
        role: 'writer',
        phone: profile.phone,
        oab_number: profile.oab,
        oab_state: profile.oab_state,
        // specialties como JSONB (objeto/array direto, sem stringify)
        specialties: profile.specialties || [],
        experience_years: profile.experience_years,
        bio: profile.bio,
        hourly_rate: profile.hourly_rate,
        availability: profile.availability,
        city: profile.city,
        state: profile.state,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles_v2')
        .upsert({
          firebase_uid: user.uid,
          ...updateData
        }, {
          onConflict: 'firebase_uid'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating profile:', error);
        throw error;
      }

      // notifica admin só no primeiro cadastro
      if (!isExistingProfile) {
        try {
          // Enviar email ao admin
          await notifyAdmin({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            specialties: profile.specialties,
            oab: profile.oab,
            oab_state: profile.oab_state
          });
          console.log('✅ Email enviado ao admin');

          // Criar notificação no banco para todos os admins
          const { data: admins } = await supabase
            .from('profiles_v2')
            .select('firebase_uid')
            .eq('role', 'admin');

          if (admins && admins.length > 0) {
            const notifications = admins.map(admin => ({
              user_id: admin.firebase_uid,
              title: '👤 Novo Redator Aguardando Aprovação',
              body: `${profile.name} (${profile.email}) se cadastrou como redator e está aguardando aprovação.`,
              type: 'approval',
              priority: 'high' as const,
              is_read: false,
              related_entity_type: 'writer',
              related_entity_id: user.uid
            }));

            const { error: notificationError } = await supabase
              .from('app_2d8133c678_notifications')
              .insert(notifications);

            if (notificationError) {
              console.error('❌ Erro ao criar notificações para admins:', notificationError);
            }
          }
        } catch (notifyError) {
          console.error('❌ Erro ao notificar admin:', notifyError);
        } finally {
          setIsExistingProfile(true);
        }
      }

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }, [profile, user, isExistingProfile]);

  const handleBankDataUpdate = useCallback(async () => {
    if (!profile || !user) return;

    try {
      setSaving(true);

      if (user.uid.includes('mock_')) {
        toast.success('Dados bancários atualizados! (Demo)');
        return;
      }

      const { error } = await supabase
        .from('profiles_v2')
        .update({
          bank_name: profile.bank_data.bank,
          bank_agency: profile.bank_data.agency,
          bank_account: profile.bank_data.account,
          pix_key: profile.bank_data.pix_key,
          updated_at: new Date().toISOString()
        })
        .ilike('firebase_uid', user.uid);

      if (error) {
        console.error('❌ Error updating bank data:', error);
        throw error;
      }

      toast.success('Dados bancários atualizados!');
    } catch (error) {
      console.error('❌ Error updating bank data:', error);
      toast.error('Erro ao atualizar dados bancários. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }, [profile, user]);

  const handleAddSpecialty = useCallback((specialty: string) => {
    if (!profile || !specialty) return;
    if (profile.specialties.includes(specialty)) {
      toast.info('Essa especialidade já foi adicionada.');
      return;
    }
    setProfile({ ...profile, specialties: [...profile.specialties, specialty] });
  }, [profile]);

  const handleRemoveSpecialty = useCallback((specialty: string) => {
    if (!profile) return;
    setProfile({ ...profile, specialties: profile.specialties.filter(s => s !== specialty) });
  }, [profile]);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !profile) {
      if (!file) toast.error('Nenhum arquivo selecionado');
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo 2MB permitido.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WEBP.');
      return;
    }

    setUploadingPhoto(true);

    try {
      // SOLUÇÃO DEFINITIVA: Converter para base64 e salvar no banco
      // Isso funciona 100% e não depende de storage público/assinado
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const base64String = e.target?.result as string;
          // Verificar se o perfil existe primeiro
          const { data: existingProfile } = await supabase
            .from('profiles_v2')
            .select('firebase_uid, email, role')
            .ilike('firebase_uid', user.uid)
            .maybeSingle();

          // Salvar base64 no banco
          let updateData;
          let updateError;

          if (existingProfile) {
            const result = await supabase
              .from('profiles_v2')
              .update({ 
                avatar_url: base64String, 
                updated_at: new Date().toISOString() 
              })
              .ilike('firebase_uid', user.uid)
              .select();
            
            updateError = result.error;
            updateData = result.data;
          } else {
            const result = await supabase
              .from('profiles_v2')
              .upsert({
                firebase_uid: user.uid,
                email: user.email || '',
                role: 'writer',
                avatar_url: base64String,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'firebase_uid'
              })
              .select();
            
            updateError = result.error;
            updateData = result.data;
          }

          if (updateError) {
            console.error('❌ Database update error:', updateError);
            toast.error(`Erro ao salvar avatar: ${updateError.message}`);
            setUploadingPhoto(false);
            return;
          }

          if (!updateData || updateData.length === 0) {
            console.error('❌ Nenhuma linha foi atualizada');
            toast.error('Erro: nenhuma linha foi atualizada.');
            setUploadingPhoto(false);
            return;
          }

          // Também salvar em user_profiles
          const { error: userProfilesError } = await supabase
            .from('user_profiles')
            .update({ avatar_url: base64String })
            .ilike('firebase_uid', user.uid);

          if (userProfilesError) {
            console.warn('⚠️ Aviso ao atualizar user_profiles:', userProfilesError);
          }

          // Atualizar estado local e contexto IMEDIATAMENTE
          setProfile(prev => (prev ? { ...prev, avatar: base64String } : prev));
          setPhotoPreview(base64String);
          setAvatarUrl(base64String); // Atualizar contexto
          
          // Recarregar avatar do contexto
          setTimeout(async () => {
            try {
              await reloadAvatar();
            } catch (reloadError) {
              console.warn('⚠️ Erro ao recarregar avatar:', reloadError);
            }
          }, 500);
          
          toast.success('Foto atualizada com sucesso!');
          setUploadingPhoto(false);
          
          // Limpar input
          if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error: any) {
          console.error('❌ Error processing avatar:', error);
          toast.error(`Erro ao processar foto: ${error.message || 'Erro desconhecido'}`);
          setUploadingPhoto(false);
        }
      };

      reader.onerror = () => {
        console.error('❌ Erro ao ler arquivo');
        toast.error('Erro ao ler arquivo. Tente novamente.');
        setUploadingPhoto(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast.error(`Erro ao atualizar foto: ${error.message || 'Erro desconhecido'}`);
      setUploadingPhoto(false);
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Erro ao carregar perfil do redator.</p>
          <Button onClick={loadWriterProfile}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie seu perfil profissional e preferências</p>
      </div>

      <Tabs 
        value={profileTabValue} 
        onValueChange={setProfileTabValue} 
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="professional">Profissional</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="banking">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informações Pessoais</span>
              </CardTitle>
              <CardDescription className="!whitespace-nowrap !max-w-none !overflow-visible">
                Atualize suas informações pessoais e de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage 
                    src={photoPreview || profile.avatar || contextAvatarUrl || undefined} 
                    key={`avatar-${photoPreview || profile.avatar || contextAvatarUrl || 'default'}`} // Forçar re-render quando mudar
                    onError={(e) => {
                      console.error('❌ Erro ao carregar imagem do avatar:', {
                        src: photoPreview || profile.avatar || contextAvatarUrl,
                        photoPreview,
                        profileAvatar: profile.avatar,
                        contextAvatar: contextAvatarUrl,
                        error: e
                      });
                    }}
                    onLoad={() => {
                    }}
                  />
                  <AvatarFallback className="text-lg">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".jpg,.jpeg,.png,.gif"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Button variant="outline" onClick={handlePhotoClick} disabled={uploadingPhoto}>
                    {uploadingPhoto ? 'Enviando...' : 'Alterar Foto'}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">JPG, PNG ou GIF. Máximo 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oab">OAB</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="oab"
                      value={profile.oab}
                      onChange={e => setProfile({ ...profile, oab: e.target.value })}
                      className="flex-1"
                    />
                    <Select value={profile.oab_state} onValueChange={value => setProfile({ ...profile, oab_state: value })}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UFS.map(uf => (
                          <SelectItem key={uf.value} value={uf.value}>
                            {uf.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select value={profile.state} onValueChange={value => setProfile({ ...profile, state: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UFS.map(uf => (
                        <SelectItem key={uf.value} value={uf.value}>
                          {uf.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleProfileUpdate} className="bg-orange-600 hover:bg-orange-700" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          {!profile ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando dados profissionais...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Perfil Profissional</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avaliação</p>
                        <div className="flex items-center space-x-1">
                          {ratingStats.total_ratings > 0 ? (
                            <>
                              {renderStars(ratingStats.average_rating)}
                              <span className="text-sm font-medium">({ratingStats.average_rating.toFixed(1)})</span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sem avaliações</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Trabalhos</p>
                      <p className="text-2xl font-bold">{profile.completed_petitions || 0}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Localização</p>
                      <p className="text-sm font-bold">
                        {profile.city && profile.state 
                          ? `${profile.city}, ${profile.state}`
                          : profile.city || profile.state || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Descrição Profissional</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    placeholder="Descreva sua experiência e especialidades..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Anos de Experiência</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={profile.experience_years}
                      onChange={e =>
                        setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Disponibilidade</Label>
                  <Select
                    value={profile.availability}
                    onValueChange={value => setProfile({ ...profile, availability: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Tempo Integral</SelectItem>
                      <SelectItem value="part_time">Meio Período</SelectItem>
                      <SelectItem value="weekends">Finais de Semana</SelectItem>
                      <SelectItem value="evenings">Noites</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Especialidades Jurídicas</Label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.specialties.map((specialty, index) => (
                    <Badge key={index} className="bg-orange-100 text-orange-800">
                      {specialty}
                      <button
                        onClick={() => handleRemoveSpecialty(specialty)}
                        className="ml-2 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={handleAddSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpecialties
                      .filter(specialty => !profile.specialties.includes(specialty))
                      .map(specialty => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleProfileUpdate} className="bg-orange-600 hover:bg-orange-700" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Perfil Profissional'
                )}
              </Button>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {!profile ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando preferências...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Preferências de Notificação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Novas Petições Disponíveis</p>
                    <p className="text-sm text-muted-foreground">Ser notificado quando surgirem trabalhos compatíveis</p>
                  </div>
                  <Switch
                    checked={notifications.newPetitions}
                    onCheckedChange={checked => setNotifications({ ...notifications, newPetitions: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pagamentos</p>
                    <p className="text-sm text-muted-foreground">Confirmações de pagamento e transferências</p>
                  </div>
                  <Switch
                    checked={notifications.payments}
                    onCheckedChange={checked => setNotifications({ ...notifications, payments: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mensagens de Clientes</p>
                    <p className="text-sm text-muted-foreground">Novas mensagens no chat</p>
                  </div>
                  <Switch
                    checked={notifications.messages}
                    onCheckedChange={checked => setNotifications({ ...notifications, messages: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="banking" className="space-y-6">
          {!profile ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando dados bancários...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Dados Bancários</span>
                </CardTitle>
                <CardDescription className="!whitespace-nowrap !max-w-none !overflow-visible">
                  Configure seus dados para recebimento de pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Banco</Label>
                  <Select
                    value={profile.bank_data.bank}
                    onValueChange={value => setProfile({ ...profile, bank_data: { ...profile.bank_data, bank: value } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Banco do Brasil">Banco do Brasil</SelectItem>
                      <SelectItem value="Caixa Econômica">Caixa Econômica</SelectItem>
                      <SelectItem value="Bradesco">Bradesco</SelectItem>
                      <SelectItem value="Itaú">Itaú</SelectItem>
                      <SelectItem value="Santander">Santander</SelectItem>
                      <SelectItem value="Nubank">Nubank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency">Agência</Label>
                  <Input
                    id="agency"
                    value={profile.bank_data.agency}
                    onChange={e => {
                      const formatted = formatAgency(e.target.value);
                      setProfile({ ...profile, bank_data: { ...profile.bank_data, agency: formatted } });
                    }}
                    placeholder="0000 ou 0000-0"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Conta</Label>
                  <Input
                    id="account"
                    value={profile.bank_data.account}
                    onChange={e => {
                      const formatted = formatAccount(e.target.value);
                      setProfile({ ...profile, bank_data: { ...profile.bank_data, account: formatted } });
                    }}
                    placeholder="00000-0 ou 00000000-0"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pixKey">Chave PIX</Label>
                  <Input
                    id="pixKey"
                    value={profile.bank_data.pix_key}
                    onChange={e => setProfile({ ...profile, bank_data: { ...profile.bank_data, pix_key: e.target.value } })}
                    placeholder="Email, CPF, telefone ou chave aleatória"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg border border-blue-500/20">
                <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Informações de Pagamento</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Pagamentos são processados em até 2 dias úteis após aprovação</li>
                  <li>• PIX é instantâneo e sem taxas</li>
                  <li>• Transferências bancárias podem ter taxa do banco</li>
                  <li>• Mantenha seus dados sempre atualizados</li>
                </ul>
              </div>

              <Button onClick={handleBankDataUpdate} className="bg-orange-600 hover:bg-orange-700" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Dados Bancários'
                )}
              </Button>
            </CardContent>
          </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
