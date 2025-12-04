import { useState, useEffect, useMemo } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Users as UsersIcon,
  UserCheck,
  Edit,
  Shield,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabaseClient'
import { EmailService } from '@/services/emailService'
import { toast } from 'sonner'

type StatusUI = 'active' | 'pending' | 'suspended' | 'blocked' | 'unknown';
type VerifUI  = 'verified' | 'pending' | 'rejected' | 'unknown';

type UiUser = {
  id: string;
  name: string;
  email: string | null;
  role: 'CLIENT' | 'WRITER' | 'ADMIN' | 'UNKNOWN';
  created_at: string | null;
  _raw: any;
  statusUI: StatusUI;
  verifUI: VerifUI;
  activity?: number;
  // Dados de suspensão
  suspendedUntil?: string | null;
  isBlocked?: boolean;
  suspensionReason?: string | null;
  totalLateDeliveries?: number;
  daysRemaining?: number | null;
  suspensionType?: string | null;
  averageRating?: number | null;
  totalRatings?: number;
};

const ROLE_LABEL: Record<UiUser['role'], string> = {
  CLIENT: 'Cliente',
  WRITER: 'Redator',
  ADMIN:  'Admin',
  UNKNOWN: '—',
};

const statusBadge = (v: StatusUI) => {
  switch (v) {
    case 'active':    return 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20';
    case 'pending':   return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20';
    case 'suspended': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20';
    case 'blocked':   return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
    default:          return 'bg-muted text-muted-foreground border border-border';
  }
};
const verifBadge = (v: VerifUI) => {
  switch (v) {
    case 'verified': return 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20';
    case 'pending':  return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20';
    case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
    default:         return 'bg-muted text-muted-foreground border border-border';
  }
};

function toStatusUI(raw: any): StatusUI {
  if (typeof raw === 'boolean') return raw ? 'active' : 'blocked';
  const s = String(raw ?? '').toLowerCase();
  if (!s) return 'unknown';
  if (['active', 'ativo'].includes(s))     return 'active';
  if (['pending', 'pendente'].includes(s)) return 'pending';
  if (['suspended', 'suspenso'].includes(s)) return 'suspended';
  if (['blocked', 'bloqueado', 'inativo', 'desativado'].includes(s)) return 'blocked';
  return 'unknown';
}
function toVerifUI(raw: any): VerifUI {
  if (typeof raw === 'boolean') return raw ? 'verified' : 'pending';
  const s = String(raw ?? '').toLowerCase();
  if (!s) return 'unknown';
  if (['verified', 'verificado'].includes(s)) return 'verified';
  if (['rejected', 'rejeitado'].includes(s)) return 'rejected';
  if (['pending', 'pendente'].includes(s))   return 'pending';
  return 'unknown';
}

export default function Users() {
  const [users, setUsers] = useState<UiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UiUser['role']>('all');
  const [statusFilter, setStatusFilter] =
    useState<'all' | 'active' | 'pending' | 'suspended' | 'blocked'>('all');
  
  // ✅ Função auxiliar para truncar nomes muito longos (> 50 caracteres)
  const truncateLongName = (name: string | undefined | null): string => {
    if (!name) return '';
    if (name.length > 50) {
      return name.substring(0, 47) + '...';
    }
    return name;
  };

  // ✅ Função auxiliar para truncar emails muito longos (> 40 caracteres)
  const truncateLongEmail = (email: string | undefined | null): string => {
    if (!email) return '';
    if (email.length > 40) {
      return email.substring(0, 37) + '...';
    }
    return email;
  };

  const [selected, setSelected] = useState<UiUser | null>(null);

  const calculateSuspensionDays = (suspendedUntil?: string | null, lateCount = 0) => {
    if (suspendedUntil) {
      const until = new Date(suspendedUntil);
      const now = new Date();
      if (!Number.isNaN(until.getTime()) && until > now) {
        const diffMs = until.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          return diffDays;
        }
      }
    }

    if (lateCount >= 6) return 60;
    if (lateCount >= 3) return 30;
    return 30;
  };

  const fetchSuspensionProfile = async (firebaseUid: string) => {
    // ✅ CORREÇÃO: Campos básicos primeiro
    const baseColumns = 'firebase_uid, email, full_name';
    const optionalColumns = 'suspended_until, total_late_deliveries, suspension_type, suspension_email_sent_at';

    // Tentar query completa primeiro
    let { data: profile, error } = await supabase
      .from('profiles_v2')
      .select(`${baseColumns}, ${optionalColumns}`)
      .eq('firebase_uid', firebaseUid)
      .maybeSingle();

    // ✅ CORREÇÃO: Se der erro 400, tentar apenas campos básicos
    // Verificar se é erro de Bad Request (campo não existe) através do código ou mensagem
    const isBadRequest = error && (
      error.code === '42703' || // Column does not exist
      error.message?.includes('column') && error.message?.includes('does not exist') ||
      error.message?.includes('Bad Request')
    );
    
    if (isBadRequest && error.code !== 'PGRST116') {
      console.warn('⚠️ Erro ao buscar campos opcionais, tentando apenas campos básicos:', error.message);
      const { data: basicData, error: basicError } = await supabase
        .from('profiles_v2')
        .select(baseColumns)
        .eq('firebase_uid', firebaseUid)
        .maybeSingle();
      
      if (!basicError && basicData) {
        profile = {
          ...basicData,
          suspended_until: null,
          total_late_deliveries: 0,
          suspension_type: null,
          suspension_email_sent_at: null
        };
        error = null;
      } else if (basicError && basicError.code !== 'PGRST116') {
        error = basicError;
      }
    }

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (profile) return profile;

    // Tentar user_profiles como fallback
    let { data: legacyProfile, error: legacyError } = await supabase
      .from('user_profiles')
      .select(`${baseColumns}, ${optionalColumns}`)
      .eq('firebase_uid', firebaseUid)
      .maybeSingle();

    // ✅ CORREÇÃO: Se der erro 400, tentar apenas campos básicos
    // Verificar se é erro de Bad Request (campo não existe) através do código ou mensagem
    const isLegacyBadRequest = legacyError && (
      legacyError.code === '42703' || // Column does not exist
      legacyError.message?.includes('column') && legacyError.message?.includes('does not exist') ||
      legacyError.message?.includes('Bad Request')
    );
    
    if (isLegacyBadRequest && legacyError.code !== 'PGRST116') {
      console.warn('⚠️ Erro ao buscar campos opcionais de user_profiles, tentando apenas campos básicos:', legacyError.message);
      const { data: basicData, error: basicError } = await supabase
        .from('user_profiles')
        .select(baseColumns)
        .eq('firebase_uid', firebaseUid)
        .maybeSingle();
      
      if (!basicError && basicData) {
        legacyProfile = {
          ...basicData,
          suspended_until: null,
          total_late_deliveries: 0,
          suspension_type: null,
          suspension_email_sent_at: null
        };
        legacyError = null;
      } else if (basicError && basicError.code !== 'PGRST116') {
        legacyError = basicError;
      }
    }

    if (legacyError && legacyError.code !== 'PGRST116') {
      throw legacyError;
    }

    return legacyProfile;
  };

  const sendSuspensionNotification = async (targetUser: UiUser) => {
    if (targetUser.role !== 'WRITER') return;

    const firebaseUid =
      targetUser._raw?.firebase_uid ||
      targetUser._raw?.firebaseUid ||
      targetUser.id;

    if (!firebaseUid) {
      toast.warning('Não foi possível identificar o redator para envio do e-mail de suspensão.');
      return;
    }

    try {
      const profile = await fetchSuspensionProfile(firebaseUid);

      if (!profile) {
        toast.warning('Não foi possível carregar os dados completos do redator para enviar o e-mail de suspensão.');
        return;
      }

      const email = profile.email || targetUser.email;
      if (!email) {
        toast.warning('Redator suspenso, mas sem e-mail cadastrado.');
        return;
      }

      const lateCount = profile.total_late_deliveries ?? targetUser.totalLateDeliveries ?? 0;
      const suspensionDays = calculateSuspensionDays(profile.suspended_until, lateCount);
      const userName = profile.full_name || targetUser.name || 'Redator';

      const success = await EmailService.sendWriterSuspensionEmail(email, userName, lateCount, suspensionDays);

      if (!success) {
        throw new Error('Falha ao enviar email de suspensão.');
      }

      toast.success('E-mail de suspensão enviado ao redator automaticamente.');
    } catch (err: any) {
      console.error('Erro ao enviar e-mail de suspensão:', err);
      toast.error(err?.message || 'Erro ao enviar e-mail de suspensão.');
    }
  };

  const sendBlockNotification = async (targetUser: UiUser) => {
    if (targetUser.role !== 'WRITER') return;

    const firebaseUid =
      targetUser._raw?.firebase_uid ||
      targetUser._raw?.firebaseUid ||
      targetUser.id;

    if (!firebaseUid) {
      toast.warning('Não foi possível identificar o redator para envio do e-mail de bloqueio.');
      return;
    }

    try {
      const profile = await fetchSuspensionProfile(firebaseUid);

      if (!profile) {
        toast.warning('Não foi possível carregar os dados completos do redator para enviar o e-mail de bloqueio.');
        return;
      }

      const email = profile.email || targetUser.email;
      if (!email) {
        toast.warning('Redator bloqueado, mas sem e-mail cadastrado.');
        return;
      }

      const lateCount = profile.total_late_deliveries ?? targetUser.totalLateDeliveries ?? 0;
      const userName = profile.full_name || targetUser.name || 'Redator';

      const success = await EmailService.sendWriterBlockEmail(email, userName, lateCount);

      if (!success) {
        throw new Error('Falha ao enviar email de bloqueio.');
      }

      toast.success('E-mail de bloqueio enviado ao redator automaticamente.');
    } catch (err: any) {
      console.error('Erro ao enviar email de bloqueio:', err);
      toast.error(err?.message || 'Erro ao enviar email de bloqueio.');
    }
  };

  // Removido - vamos usar o supabase client diretamente

  const findKeys = (user: UiUser) => {
    const statusKey = user.statusUI ? 'status' : null;
    const verifKey = user.verifUI ? 'verification_status' : null;
    return { statusKey, verifKey };
  };

  const updateUserField = async (user: UiUser, field: string, value: any) => {
    // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('Updating user field:', field, 'Value:', value, 'User:', user.id);
    }
    
    try {
      // Determinar qual coluna atualizar
      let columnName: string;
      if (field === 'status') {
        columnName = 'status';
      } else if (field === 'verification') {
        columnName = 'verification_status';
      } else {
        throw new Error(`Campo desconhecido: ${field}`);
      }

      // Detectar de qual tabela o usuário veio
      const sourceTable = user._raw._sourceTable || 'profiles_v2';

      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log('🔄 Atualizando no banco:', { userId: user.id, table: sourceTable, column: columnName, value });
      }

      // Atualizar na tabela correta
      const { error } = await supabase
        .from(sourceTable)
        .update({ [columnName]: value })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Erro ao atualizar:', error);
        
        // Se a coluna não existe, não é erro fatal
        if (error.message.includes('Could not find')) {
          toast.warning(`Coluna '${columnName}' não existe na tabela ${sourceTable}. Este usuário não pode ter este campo atualizado.`);
          return; // Retorna sem erro, mas não atualiza
        }
        
        throw error;
      }

      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log('✅ Atualizado com sucesso no banco');
      }

      const shouldNotifySuspension =
        field === 'status' &&
        value === 'suspended' &&
        user.role === 'WRITER' &&
        user.statusUI !== 'suspended';

      const shouldNotifyBlock =
        field === 'status' &&
        value === 'blocked' &&
        user.role === 'WRITER' &&
        user.statusUI !== 'blocked';

      // Atualizar estado local para refletir a mudança imediatamente
      setUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { 
              ...u, 
              [field === 'status' ? 'statusUI' : 'verifUI']: value,
              _raw: { ...u._raw, [columnName]: value }
            }
          : u
      ));

      toast.success('Usuário atualizado com sucesso!');

      if (shouldNotifySuspension) {
        await sendSuspensionNotification({ ...user, statusUI: 'suspended' });
      }

      if (shouldNotifyBlock) {
        await sendBlockNotification({ ...user, statusUI: 'blocked' });
      }
      
    } catch (err: any) {
      console.error('❌ Erro ao atualizar usuário:', err);
      toast.error(`Erro ao atualizar: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const deleteUser = async (user: UiUser) => {
    // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('Deleting user:', user.id);
    }
    
    try {
      // Detectar de qual tabela o usuário veio
      const sourceTable = user._raw._sourceTable || 'profiles_v2';
      
      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log('🗑️ Excluindo usuário:', { userId: user.id, table: sourceTable });
      }
      
      // Excluir da tabela correta
      const { error } = await supabase
        .from(sourceTable)
        .delete()
        .eq('id', user.id);
      
      if (error) {
        console.error('❌ Erro ao excluir:', error);
        throw error;
      }
      
      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log('✅ Usuário excluído com sucesso');
      }
      
      // Remover do estado local
      setUsers(prev => prev.filter(u => u.id !== user.id));
      
      toast.success('Usuário excluído com sucesso!');
      
    } catch (err: any) {
      console.error('❌ Erro ao excluir usuário:', err);
      toast.error(`Erro ao excluir: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ CORREÇÃO: Query com campos básicos primeiro, depois tentar campos opcionais
      // Campos básicos para user_profiles (inclui is_active)
      const baseColumnsUserProfiles = 'id, firebase_uid, email, full_name, role, is_active, created_at, updated_at';
      // Campos básicos para profiles_v2 (NÃO inclui is_active, pois não existe nessa tabela)
      const baseColumnsProfilesV2 = 'id, firebase_uid, email, full_name, role, created_at, updated_at';
      
      // Campos opcionais de suspensão (podem não existir em todas as tabelas)
      const optionalColumns = 'suspended_until, is_blocked, suspension_reason, suspension_type';
      
      let rowsUserProfiles: any[] = [];
      let rowsProfilesV2: any[] = [];
      let errorUserProfiles: any = null;
      let errorProfilesV2: any = null;

      // ✅ CORREÇÃO: Tentar query completa para user_profiles, mas usar campos básicos para profiles_v2
      // profiles_v2 pode não ter os campos opcionais, então começamos com campos básicos
      try {
        const [
          resultUserProfiles,
          resultProfilesV2Basic
        ] = await Promise.all([
          supabase
            .from('user_profiles')
            .select(`${baseColumnsUserProfiles}, ${optionalColumns}`)
            .limit(2000),
          supabase
            .from('profiles_v2')
            .select(baseColumnsProfilesV2)
            .limit(2000)
        ]);

        rowsUserProfiles = resultUserProfiles.data || [];
        rowsProfilesV2 = resultProfilesV2Basic.data || [];
        errorUserProfiles = resultUserProfiles.error;
        errorProfilesV2 = resultProfilesV2Basic.error;

        // Adicionar campos opcionais com valores padrão para profiles_v2
        if (rowsProfilesV2.length > 0) {
          rowsProfilesV2 = rowsProfilesV2.map(row => ({
            ...row,
            is_active: true,
            suspended_until: null,
            is_blocked: false,
            suspension_reason: null,
            suspension_type: null
          }));
        }

        // ✅ CORREÇÃO: Se houver erro em profiles_v2 (mesmo que seja PGRST116 - nenhuma linha), apenas registrar
        // Não precisamos fazer fallback pois já começamos com campos básicos
        if (errorProfilesV2 && errorProfilesV2.code !== 'PGRST116') {
          console.warn('⚠️ Erro ao buscar profiles_v2:', errorProfilesV2?.message);
        }

        // Verificar se é erro de Bad Request (campo não existe) através do código ou mensagem
        const isUserProfilesBadRequest = errorUserProfiles && (
          errorUserProfiles.code === '42703' || // Column does not exist
          errorUserProfiles.code === 'PGRST116' || // No rows returned (mas também pode ser Bad Request)
          (errorUserProfiles.message?.includes('column') && errorUserProfiles.message?.includes('does not exist')) ||
          errorUserProfiles.message?.includes('Bad Request') ||
          errorUserProfiles.message?.includes('400') ||
          (errorUserProfiles.status && errorUserProfiles.status === 400)
        );
        
        if (isUserProfilesBadRequest) {
          console.warn('⚠️ Erro ao buscar campos opcionais de user_profiles, tentando apenas campos básicos:', errorUserProfiles?.message);
          
          const { data: basicData, error: basicError } = await supabase
            .from('user_profiles')
            .select(baseColumnsUserProfiles)
            .limit(2000);
          
          if (!basicError && basicData) {
            rowsUserProfiles = basicData.map(row => ({
              ...row,
              suspended_until: null,
              is_blocked: false,
              suspension_reason: null,
              suspension_type: null
            }));
            errorUserProfiles = null;
          } else if (basicError) {
            // Se também falhar com campos básicos, manter o erro original
            console.error('❌ Erro ao buscar campos básicos de user_profiles:', basicError);
          }
        }
      } catch (err) {
        console.error('❌ Erro ao carregar usuários:', err);
        throw err;
      }

      // Combinar resultados de ambas as tabelas
      const rows = [
        ...(rowsUserProfiles || []),
        ...(rowsProfilesV2 || [])
      ];

      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log(`✅ Usuários carregados: ${rowsUserProfiles?.length || 0} de user_profiles + ${rowsProfilesV2?.length || 0} de profiles_v2`);
      }

      // Se ambas deram erro, lançar exceção
      if ((errorUserProfiles || errorProfilesV2) && rows.length === 0) {
        throw errorUserProfiles || errorProfilesV2;
      }

      // ✅ OTIMIZAÇÃO: Criar Date() uma vez antes do loop (evita criação repetida)
      const now = new Date();

      const mapped: UiUser[] = (rows || []).map((p: any): UiUser => {
        const roleRaw = String(p.user_type ?? p.role ?? '').toUpperCase();
        const role: UiUser['role'] =
          roleRaw === 'CLIENT' ? 'CLIENT' :
          roleRaw === 'WRITER' ? 'WRITER' :
          roleRaw === 'ADMIN'  ? 'ADMIN'  : 'UNKNOWN';

        const name = p.full_name ?? p.nome ?? p.name ?? p.fullname ?? '—';
        const email =
          (typeof p.email === 'string' && p.email) ? p.email :
          (typeof p.user_email === 'string' && p.user_email) ? p.user_email : null;

        const statusKey = ['status', 'account_status', 'situacao', 'ativo'].find(k => k in p);
        const verifKey  = ['verification_status', 'verified', 'is_verified', 'verificado'].find(k => k in p);

        // Detectar de qual tabela veio (user_profiles tem firebase_uid, profiles_v2 não)
        const sourceTable = p.firebase_uid ? 'user_profiles' : 'profiles_v2';

        // 🔒 CALCULAR STATUS BASEADO EM SUSPENSÃO
        const isBlocked = p.is_blocked || false;
        const suspendedUntil = p.suspended_until;
        const suspendedUntilDate = suspendedUntil ? new Date(suspendedUntil) : null;
        const isSuspended = suspendedUntilDate ? now < suspendedUntilDate : false;
        const daysRemaining = suspendedUntilDate && isSuspended
          ? Math.ceil((suspendedUntilDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        // Determinar statusUI baseado em suspensão/bloqueio
        let calculatedStatus: StatusUI;
        if (isBlocked) {
          calculatedStatus = 'blocked';
        } else if (isSuspended) {
          calculatedStatus = 'suspended';
        } else {
          // Usar status da coluna status, ou 'active' por padrão
          calculatedStatus = toStatusUI(statusKey ? p[statusKey] : 'active');
        }

        return {
          id: String(p.id ?? ''),
          name,
          email,
          role,
          created_at: p.created_at ?? p.inserted_at ?? p.createdAt ?? null,
          _raw: { ...p, _sourceTable: sourceTable }, // Adicionar info da tabela de origem
          statusUI: calculatedStatus,
          verifUI:  toVerifUI (verifKey  ? p[verifKey]  : undefined),
          activity: undefined,
          // Dados de suspensão
          suspendedUntil: p.suspended_until || null,
          isBlocked,
          suspensionReason: p.suspension_reason || null,
          totalLateDeliveries: p.total_late_deliveries || 0,
          daysRemaining,
          suspensionType: p.suspension_type || null,
          averageRating: p.average_rating ? parseFloat(p.average_rating) : null,
          totalRatings: p.total_ratings || 0,
        };
      });

      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log(`✅ ${mapped.length} usuários carregados do banco de dados`);
      }
      
      setUsers(mapped);
    } catch (err: any) {
      console.error('❌ Erro ao carregar usuários:', err);
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !term ||
        u.name.toLowerCase().includes(term) ||
        (u.email ? u.email.toLowerCase().includes(term) : false);

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.statusUI === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    clients: users.filter(u => u.role === 'CLIENT').length,
    writers: users.filter(u => u.role === 'WRITER').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
  }), [users]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Gerenciar Usuários</h2>
        <p className="text-sm text-muted-foreground">
          Administre todos os usuários do sistema
        </p>
      </div>

      {error ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-center text-red-600 dark:text-red-400 max-w-xl">
            <p className="mb-4">Erro ao carregar usuários:</p>
            <pre className="text-xs bg-red-500/10 p-3 rounded border border-red-500/20 overflow-auto">
              {error}
            </pre>
            <Button onClick={loadUsers} className="mt-4">Tentar novamente</Button>
          </div>
        </div>
      ) : (
        <>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card><CardContent className="pt-6"><div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Total Usuários</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div></CardContent></Card>

            <Card><CardContent className="pt-6"><div className="flex items-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold">{stats.clients}</p>
              </div>
            </div></CardContent></Card>

            <Card><CardContent className="pt-6"><div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Edit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Redatores</p>
                <p className="text-2xl font-bold">{stats.writers}</p>
              </div>
            </div></CardContent></Card>

            <Card><CardContent className="pt-6"><div className="flex items-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
            </div></CardContent></Card>
          </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
  <Input
    placeholder="Buscar por nome ou e-mail..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="sm:flex-1"
  />

  {/* 👉 NOVO: Status (lado da busca) — usa o MESMO estado do filtro da direita */}
  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
    <SelectTrigger className="w-[160px]">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos</SelectItem>
      <SelectItem value="active">Ativo</SelectItem>
      <SelectItem value="pending">Pendente</SelectItem>
      <SelectItem value="suspended">Suspenso</SelectItem>
      <SelectItem value="blocked">Bloqueado</SelectItem>
    </SelectContent>
  </Select>

              <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="CLIENT">Clientes</SelectItem>
                  <SelectItem value="WRITER">Redatores</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                  <SelectItem value="UNKNOWN">Sem tipo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabela */}
            <div className="bg-card border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="text-foreground">Usuário</TableHead>
                    <TableHead className="text-foreground">Tipo</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Cadastro</TableHead>
                    <TableHead className="text-right text-foreground">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!loading && filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((u) => {
                    const StatusIcon =
  u.statusUI === 'active' ? CheckCircle2 :
  u.statusUI === 'pending' ? Clock :
  (u.statusUI === 'suspended' || u.statusUI === 'blocked') ? AlertTriangle :
  null;

                    return (
                      <TableRow key={u.id || crypto.randomUUID()}>
                        <TableCell className="max-w-[300px]">
                          <div className="font-medium truncate" title={u.name}>{truncateLongName(u.name)}</div>
                          <div className="text-sm text-muted-foreground truncate" title={u.email || ''}>{truncateLongEmail(u.email) ?? '—'}</div>
                        </TableCell>
                        <TableCell>{ROLE_LABEL[u.role]}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${statusBadge(u.statusUI)}`}>
                            {StatusIcon ? <StatusIcon className="h-3 w-3 mr-1" /> : null}
                            {u.statusUI === 'unknown' ? '—' : (
                              u.statusUI === 'active' ? 'Ativo' :
                              u.statusUI === 'pending' ? 'Pendente' :
                              u.statusUI === 'suspended' ? 'Suspenso' :
                              'Bloqueado'
                            )}
                          </span>
                        </TableCell>
                        <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Gerenciar */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelected(u)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>Gerenciar Usuário</DialogTitle>
                                  <DialogDescription>
                                    Atualize o status e configurações do usuário
                                  </DialogDescription>
                                </DialogHeader>

                                {selected && selected.id === u.id ? (() => {
                                  const { statusKey, verifKey } = findKeys(selected);
                                  const statusDisabled = !statusKey;
                                  const verifDisabled  = !verifKey;

                                  return (
                                    <div className="space-y-4">
                                      <div>
                                        <div className="text-sm font-medium">Nome</div>
                                        <div className="text-sm text-muted-foreground truncate" title={selected.name}>{truncateLongName(selected.name)}</div>
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium">Email</div>
                                        <div className="text-sm text-muted-foreground truncate" title={selected.email || ''}>{truncateLongEmail(selected.email) ?? '—'}</div>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium mb-2 block">Status</label>
                                          <Select
                                            disabled={statusDisabled}
                                            value={
                                              selected.statusUI === 'unknown' ? 'unknown' : selected.statusUI
                                            }
                                            onValueChange={async (val: any) => {
                                              try {
                                                await updateUserField(selected, 'status', val as StatusUI);
                                              } catch (e) {
                                                console.error(e);
                                              }
                                            }}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder={statusDisabled ? 'Indisponível' : undefined} />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="active">Ativo</SelectItem>
                                              <SelectItem value="pending">Pendente</SelectItem>
                                              <SelectItem value="suspended">Suspenso</SelectItem>
                                              <SelectItem value="blocked">Bloqueado</SelectItem>
                                              <SelectItem value="unknown" disabled>—</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          {statusDisabled && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                              Sua tabela não possui um campo de status (ex.: <code>status</code> ou <code>ativo</code>).
                                            </p>
                                          )}
                                        </div>

                                        <div>
                                          <label className="text-sm font-medium mb-2 block">Verificação</label>
                                          <Select
                                            disabled={verifDisabled}
                                            value={
                                              selected.verifUI === 'unknown' ? 'unknown' : selected.verifUI
                                            }
                                            onValueChange={async (val: any) => {
                                              try {
                                                await updateUserField(selected, 'verification', val as VerifUI);
                                              } catch (e) {
                                                console.error(e);
                                              }
                                            }}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder={verifDisabled ? 'Indisponível' : undefined} />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="verified">Verificado</SelectItem>
                                              <SelectItem value="pending">Pendente</SelectItem>
                                              <SelectItem value="rejected">Rejeitado</SelectItem>
                                              <SelectItem value="unknown" disabled>—</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          {verifDisabled && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                              Sua tabela não possui um campo de verificação (ex.: <code>verification_status</code> ou <code>verified</code>).
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {/* 🔒 INFORMAÇÕES DE SUSPENSÃO (apenas para redatores) */}
                                      {selected.role === 'WRITER' && (selected.isBlocked || selected.suspendedUntil || (selected.averageRating !== null && selected.averageRating < 3.8 && (selected.totalRatings || 0) >= 3)) && (
                                        <div className="border-t pt-4 mt-4">
                                          <div className="text-sm font-medium mb-3">📋 Informações de Suspensão / Avaliação</div>
                                          
                                          {/* Suspensão por Baixa Avaliação */}
                                          {selected.suspensionType === 'low_rating' && selected.suspendedUntil && (
                                            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-2 mb-3">
                                              <div className="flex items-center gap-2 text-red-900 dark:text-red-100 font-semibold">
                                                <AlertTriangle className="h-4 w-4" />
                                                Suspenso por Baixa Avaliação
                                              </div>
                                              <div className="flex items-center gap-4">
                                                <div>
                                                  <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                                                    {selected.averageRating?.toFixed(1) || 'N/A'} ⭐
                                                  </p>
                                                  <p className="text-xs text-red-700 dark:text-red-300">Média atual</p>
                                                </div>
                                                <div className="border-l pl-3">
                                                  <p className="text-xl font-bold text-red-800 dark:text-red-200">
                                                    {selected.totalRatings || 0}
                                                  </p>
                                                  <p className="text-xs text-red-700 dark:text-red-300">Avaliações</p>
                                                </div>
                                                <div className="border-l pl-3">
                                                  <p className="text-sm text-red-800 dark:text-red-200">
                                                    Mínimo: <strong>3.8 ⭐</strong>
                                                  </p>
                                                </div>
                                              </div>
                                              {selected.suspensionReason && (
                                                <p className="text-xs text-red-700 dark:text-red-300">
                                                  {selected.suspensionReason}
                                                </p>
                                              )}
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={async () => {
                                                  const note = prompt('Digite o motivo da reativação:');
                                                  if (!note) return;
                                                  try {
                                                    const { error } = await supabase.rpc('admin_reactivate_low_rated_writer', {
                                                      writer_uid: selected._raw.firebase_uid,
                                                      admin_note: note
                                                    });
                                                    if (error) throw error;
                                                    toast.success('Redator reativado com sucesso!');
                                                    loadUsers();
                                                  } catch (err: any) {
                                                    toast.error(`Erro ao reativar: ${err.message}`);
                                                  }
                                                }}
                                                className="w-full mt-2"
                                              >
                                                ✅ Reativar Redator
                                              </Button>
                                            </div>
                                          )}

                                          {selected.isBlocked ? (
                                            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-2">
                                              <div className="flex items-center gap-2 text-red-900 dark:text-red-100 font-semibold">
                                                <AlertTriangle className="h-4 w-4" />
                                                Bloqueado Permanentemente
                                              </div>
                                              <p className="text-sm text-red-800 dark:text-red-200">
                                                Total de atrasos: <strong>{selected.totalLateDeliveries}</strong>
                                              </p>
                                              {selected.suspensionReason && (
                                                <p className="text-xs text-red-700 dark:text-red-300">
                                                  {selected.suspensionReason}
                                                </p>
                                              )}
                                            </div>
                                          ) : selected.daysRemaining && selected.daysRemaining > 0 ? (
                                            <div className="bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 rounded-lg p-3 space-y-2">
                                              <div className="flex items-center gap-2 text-orange-900 dark:text-orange-100 font-semibold">
                                                <Clock className="h-4 w-4" />
                                                Suspenso Temporariamente
                                              </div>
                                              <p className="text-sm text-orange-800 dark:text-orange-200">
                                                Dias restantes: <strong>{selected.daysRemaining}</strong>
                                              </p>
                                              <p className="text-sm text-orange-800 dark:text-orange-200">
                                                Total de atrasos: <strong>{selected.totalLateDeliveries}</strong>
                                              </p>
                                              {selected.suspensionReason && (
                                                <p className="text-xs text-orange-700 dark:text-orange-300">
                                                  {selected.suspensionReason}
                                                </p>
                                              )}
                                            </div>
                                          ) : null}

                                          {/* Botões de Ação Admin */}
                                          <div className="mt-3 flex gap-2">
                                            {selected.isBlocked && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={async () => {
                                                  try {
                                                    const { error } = await supabase.rpc('admin_unblock_writer', {
                                                      writer_uid: selected._raw.firebase_uid,
                                                      admin_note: 'Desbloqueado manualmente pelo admin'
                                                    });
                                                    if (error) throw error;
                                                    toast.success('Redator desbloqueado com sucesso!');
                                                    loadUsers();
                                                  } catch (err: any) {
                                                    toast.error(`Erro ao desbloquear: ${err.message}`);
                                                  }
                                                }}
                                                className="flex-1"
                                              >
                                                🔓 Desbloquear
                                              </Button>
                                            )}
                                            {(selected.totalLateDeliveries || 0) > 0 && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={async () => {
                                                  try {
                                                    const { error } = await supabase.rpc('admin_reset_penalties_count', {
                                                      writer_uid: selected._raw.firebase_uid,
                                                      admin_note: 'Contador resetado manualmente pelo admin'
                                                    });
                                                    if (error) throw error;
                                                    toast.success('Contador de atrasos resetado!');
                                                    loadUsers();
                                                  } catch (err: any) {
                                                    toast.error(`Erro ao resetar: ${err.message}`);
                                                  }
                                                }}
                                                className="flex-1"
                                              >
                                                🔄 Resetar Contador
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* 📊 EXIBIR AVALIAÇÕES (para todos os redatores) */}
                                      {selected.role === 'WRITER' && (
                                        <div className="border-t pt-4 mt-4">
                                          <div className="text-sm font-medium mb-2">⭐ Avaliações do Redator</div>
                                          <div className={`rounded-lg p-4 ${
                                            selected.averageRating === null || selected.totalRatings === 0 
                                              ? 'bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800'
                                              : selected.averageRating < 3.8
                                                ? 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800'
                                                : selected.averageRating < 4.0
                                                  ? 'bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800'
                                                  : 'bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800'
                                          }`}>
                                            <div className="flex items-center gap-6">
                                              <div>
                                                <p className="text-4xl font-bold">
                                                  {selected.averageRating?.toFixed(1) || 'N/A'} ⭐
                                                </p>
                                                <p className="text-xs mt-1">Média</p>
                                              </div>
                                              <div className="border-l-2 pl-4">
                                                <p className="text-2xl font-bold">{selected.totalRatings || 0}</p>
                                                <p className="text-xs">Avaliações</p>
                                              </div>
                                              <div className="border-l-2 pl-4 flex-1">
                                                <p className="text-sm font-medium">
                                                  {selected.averageRating === null || selected.totalRatings === 0
                                                    ? '📝 Sem avaliações'
                                                    : selected.averageRating >= 4.5
                                                      ? '⭐ Excelente'
                                                      : selected.averageRating >= 4.0
                                                        ? '👍 Bom'
                                                        : selected.averageRating >= 3.8
                                                          ? '✔️ Aceitável'
                                                          : '⚠️ Abaixo do mínimo'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  Mínimo: 3.8 ⭐
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Exibir total de atrasos mesmo se não suspenso */}
                                      {selected.role === 'WRITER' && !selected.isBlocked && !selected.suspendedUntil && (selected.totalLateDeliveries || 0) > 0 && (
                                        <div className="border-t pt-4 mt-4">
                                          <div className="text-sm font-medium mb-2">📊 Histórico de Atrasos</div>
                                          <div className="bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                            <p className="text-sm text-yellow-900 dark:text-yellow-100">
                                              Total de atrasos: <strong>{selected.totalLateDeliveries}</strong>
                                            </p>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={async () => {
                                                try {
                                                  const { error } = await supabase.rpc('admin_reset_penalties_count', {
                                                    writer_uid: selected._raw.firebase_uid,
                                                    admin_note: 'Contador resetado manualmente pelo admin'
                                                  });
                                                  if (error) throw error;
                                                  toast.success('Contador de atrasos resetado!');
                                                  loadUsers();
                                                } catch (err: any) {
                                                  toast.error(`Erro ao resetar: ${err.message}`);
                                                }
                                              }}
                                              className="w-full mt-2"
                                            >
                                              🔄 Resetar Contador
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })() : null}
                              </DialogContent>
                            </Dialog>

                            {/* Remover */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. O usuário será permanentemente removido do sistema.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={async () => {
                                      try {
                                        await deleteUser(u);
                                      } catch (e) {
                                        console.error(e);
                                      }
                                    }}
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                  )}
                </TableBody>
              </Table>
            </div>
        </>
      )}
    </div>
  );
}
