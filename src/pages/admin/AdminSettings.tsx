import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Bell, Database } from 'lucide-react';
import { toast } from 'sonner';
import { useTabNavigation } from '@/contexts/TabNavigationContext';
import { useNewAuth } from '@/contexts/NewAuthContext';
import BackupList from '@/components/admin/BackupList';
import { supabase } from '@/lib/supabaseClient'

interface SystemSettings {
  id: string;
  platform_name: string;
  platform_description: string;
  min_petition_value: number;
  max_petition_value: number;
  fixed_petition_cost: number;
  auto_assignment: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  maintenance_mode: boolean;
  max_file_size: number;
  allowed_file_types: string[] | null; // segurança
  support_email: string;
  support_phone: string;
}

export default function AdminSettings() {
  // ---------- Estados ----------
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const { profileTabValue, setProfileTabValue } = useTabNavigation();
  const { user } = useNewAuth();

  // Perfil do admin (controlados)
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // ---------- Efeitos ----------
  // Carrega configurações reais
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .single();

      if (error || !data) {
        toast.error('Erro ao carregar configurações');
        console.error(error);
        return;
      }
      setSettings(data);
    };

    fetchSettings();
  }, []);

  // Função para carregar dados do admin (reutilizável)
  const fetchAdminData = useCallback(async () => {
    if (!user) return;

    setAdminEmail(user.email ?? '');

    // Buscar primeiro em profiles_v2
    const { data: profile, error: profileError } = await supabase
      .from('profiles_v2')
      .select('full_name')
      .eq('firebase_uid', user.uid)
      .maybeSingle();

    if (!profileError && profile?.full_name) {
      setAdminName(profile.full_name as string);
      return;
    }

    // Se não encontrou em profiles_v2, tentar user_profiles
    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('firebase_uid', user.uid)
      .maybeSingle();

    if (!userProfileError && userProfile?.full_name) {
      setAdminName(userProfile.full_name as string);
    }
  }, [user]);

  // Carrega dados do admin logado (email do Firebase Auth e nome na tabela profiles_v2 ou user_profiles)
  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // ---------- Persistência ----------
  // Salvar/atualizar system_settings
  const saveSettings = async () => {
    if (!settings) {
      toast.error('Nenhuma configuração para salvar');
      return;
    }
    const { id, ...fieldsToUpdate } = settings;
    
    console.log('💾 Salvando configurações:', {
      id,
      auto_assignment: fieldsToUpdate.auto_assignment,
      maintenance_mode: fieldsToUpdate.maintenance_mode,
      ...fieldsToUpdate
    });
    
    const { error } = await supabase
      .from('system_settings')
      .update(fieldsToUpdate)
      .eq('id', id);

    if (error) {
      toast.error('Erro ao salvar configurações');
      console.error('❌ Erro ao salvar:', error);
    } else {
      console.log('✅ Configurações salvas com sucesso!');
      toast.success('Configurações salvas com sucesso!');
    }
  };

  // Salvar Perfil do Administrador (nome na tabela profiles_v2 e user_profiles)
  const handleSaveProfile = async () => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Verificar se o perfil existe em profiles_v2
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles_v2')
        .select('id, firebase_uid')
        .eq('firebase_uid', user.uid)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar perfil:', checkError);
        toast.error('Erro ao verificar perfil');
        return;
      }

      // Fazer upsert (insert ou update) em profiles_v2
      const profileData = {
        firebase_uid: user.uid,
        email: user.email || '',
        full_name: adminName,
        role: 'admin',
        updated_at: new Date().toISOString(),
      };

      let error;
      if (existingProfile) {
        // Update se existe
        const { error: updateError } = await supabase
          .from('profiles_v2')
          .update({ full_name: adminName, updated_at: new Date().toISOString() })
          .eq('firebase_uid', user.uid);
        error = updateError;
      } else {
        // Insert se não existe
        const { error: insertError } = await supabase
          .from('profiles_v2')
          .insert({
            ...profileData,
            created_at: new Date().toISOString(),
          });
        error = insertError;
      }

      if (error) {
        console.error('Erro ao salvar perfil em profiles_v2:', error);
        toast.error('Erro ao salvar perfil');
        return;
      }

      // Também tentar salvar em user_profiles (se existir)
      const { data: existingUserProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('firebase_uid', user.uid)
        .maybeSingle();

      if (existingUserProfile) {
        const { error: userProfileError } = await supabase
          .from('user_profiles')
          .update({ full_name: adminName, updated_at: new Date().toISOString() })
          .eq('firebase_uid', user.uid);
        
        if (userProfileError) {
          console.warn('Aviso: não foi possível atualizar user_profiles:', userProfileError);
        }
      }

      // Recarregar os dados do banco após salvar
      await fetchAdminData();
      
      toast.success('Perfil atualizado com sucesso!');
    } catch (e) {
      console.error(e);
      toast.error('Erro inesperado ao salvar perfil');
    }
  };

  // Alias para botões existentes
  const handleSaveGeneral = saveSettings;
  const handleSaveNotifications = saveSettings;

  // Backup real (multi-tabelas)
  const handleCreateBackup = async () => {
    try {
      // 1) Checa usuário + perfil admin
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      console.log('🔍 Verificando permissão de backup:', { uid: user.uid, email: user.email });

      const { data: profile, error: profileError } = await supabase
        .from('profiles_v2')
        .select('*')
        .eq('firebase_uid', user.uid)
        .single();

      console.log('📋 Perfil encontrado:', { profile, error: profileError });

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        toast.error(`Erro ao verificar permissões: ${profileError.message}`);
        return;
      }

      if (!profile) {
        toast.error('Perfil não encontrado');
        return;
      }

      const roleNormalized = String(profile.role || '').toLowerCase();
      console.log('🔐 Role normalizado:', roleNormalized);

      if (roleNormalized !== 'admin') {
        toast.error(`Apenas administradores podem fazer backups (seu role: ${profile.role})`);
        return;
      }

      // 2) Tabelas reais do seu projeto (ajuste se necessário)
      const tableNames = [
        'users',
        'peticoes',
        'plans',
        'system_settings',
        'app_2d8133c678_payments',
      ];

      const backupData: Record<string, any[]> = {};
      const warnings: string[] = [];

      for (const table of tableNames) {
        const { data, error, status } = await supabase.from(table).select('*');
        if (error) {
          console.error(`Falha ao ler ${table}:`, { status, error });
          warnings.push(`${table}: ${status === 404 ? 'não encontrada' : (error.message || 'erro ao ler')}`);
          continue;
        }
        backupData[table] = data ?? [];
      }

      if (Object.keys(backupData).length === 0) {
        toast.error('Nenhuma tabela lida. Verifique nomes e RLS.');
        return;
      }

      // 3) Monta arquivo e envia ao bucket "admin-backups"
      const payload = { __meta__: { created_at: new Date().toISOString(), warnings }, ...backupData };
      const fileName = `backup_full_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });

      console.log('📤 Gerando backup para download:', { fileName, size: blob.size, tabelas: Object.keys(backupData).length });

      // Download direto do backup no navegador
      // (Evita problemas com Firebase Auth vs Supabase Auth no Storage RLS)
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Backup gerado e baixado com sucesso!');
      toast.success(`✅ Backup criado! Arquivo salvo em Downloads: ${fileName}`);

      if (warnings.length > 0) {
        console.warn('⚠️ Avisos do backup:', warnings);
        toast.warning(`⚠️ ${warnings.length} tabela(s) não foram incluídas no backup.`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro inesperado ao criar backup');
    }
  };

  if (!settings) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-sm text-muted-foreground">Gerencie as configurações gerais da plataforma</p>
      </div>

      <Tabs value={profileTabValue} onValueChange={setProfileTabValue} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* Aba Perfil */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Perfil do Administrador</span>
              </CardTitle>
              <CardDescription style={{ whiteSpace: 'nowrap', overflow: 'visible', textOverflow: 'clip' }}>Informações pessoais do administrador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Nome Completo</Label>
                  <Input
                    id="adminName"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminEmail}
                    readOnly
                    disabled
                  />
                </div>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSaveProfile}>
                Salvar Perfil
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Geral */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configurações Gerais</span>
              </CardTitle>
              <CardDescription style={{ whiteSpace: 'nowrap', overflow: 'visible', textOverflow: 'clip' }}>Configurações básicas da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Nome da Plataforma</Label>
                  <Input
                    id="platformName"
                    value={settings.platform_name}
                    onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email de Suporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Telefone de Suporte</Label>
                  <Input
                    id="supportPhone"
                    value={settings.support_phone}
                    onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Tamanho Máximo de Arquivo (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.max_file_size}
                    onChange={(e) => setSettings({ ...settings, max_file_size: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fixedPetitionCost">Custo Fixo por Petição (R$)</Label>
                  <Input
                    id="fixedPetitionCost"
                    type="number"
                    step="0.01"
                    value={settings.fixed_petition_cost}
                    onChange={(e) => setSettings({ ...settings, fixed_petition_cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição da Plataforma</Label>
                <Textarea
                  id="description"
                  value={settings.platform_description}
                  onChange={(e) => setSettings({ ...settings, platform_description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Atribuição Automática</p>
                    <p className="text-sm text-muted-foreground">
                      Atribuir automaticamente petições aos redatores
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_assignment}
                    onCheckedChange={(checked) => setSettings({ ...settings, auto_assignment: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Modo Manutenção</p>
                    <p className="text-sm text-muted-foreground">Desabilitar acesso público à plataforma</p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveGeneral} className="bg-orange-600 hover:bg-orange-700">
                Salvar Configurações Gerais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Configurações de Notificação</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações por Email</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar emails para usuários sobre atividades importantes
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações por SMS</p>
                    <p className="text-sm text-muted-foreground">Enviar SMS para notificações urgentes</p>
                  </div>
                  <Switch
                    checked={settings.sms_notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, sms_notifications: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} className="bg-orange-600 hover:bg-orange-700">
                Salvar Configurações de Notificação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Segurança */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Configurações de Segurança</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tipos de Arquivo Permitidos</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.allowed_file_types?.map((type, index) => (
                    <span key={index} className="px-2 py-1 bg-muted text-foreground rounded text-sm border border-border">
                      .{type}
                    </span>
                  )) ?? <span className="text-sm text-muted-foreground">—</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Backup */}
        <TabsContent value="backup" className="space-y-6">
          <BackupList />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Backup</span>
              </CardTitle>
              <CardDescription style={{ whiteSpace: 'nowrap', overflow: 'visible', textOverflow: 'clip' }}>Gere um backup completo do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleCreateBackup} className="w-full">
                Criar Backup Agora
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}