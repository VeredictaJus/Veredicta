import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  Loader2,
  Lock,
  RefreshCcw,
  Send,
  UserRoundCheck,
} from 'lucide-react';

import { supabase } from '@/lib/supabaseClient';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type LifeCycleStatus =
  | 'TRIAL_ATIVO'
  | 'TRIAL_USADO_AGUARDANDO_REGULARIZACAO'
  | 'FREE_ATIVO'
  | 'PAGO_ATIVO'
  | 'BLOQUEADO_POR_REGULARIZACAO'
  | 'BLOQUEADO_ADMIN';

type UserProfileRow = {
  id: string;
  firebase_uid?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  status?: string | null;
  is_blocked?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_trial?: boolean | null;
  trial_petition_used?: boolean | null;
  regularization_required?: boolean | null;
  trial_started_at?: string | null;
  trial_completed_at?: string | null;
  regularized_at?: string | null;
  trial_origin?: string | null;
};

type SubscriptionRow = {
  user_id: string;
  plan_code?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type PetitionRow = {
  id: string;
  client_id: string;
  status?: string | null;
  is_pilot?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type LifecycleUser = {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  status: LifeCycleStatus;
  statusLabel: string;
  statusTone: 'default' | 'secondary' | 'destructive' | 'outline';
  planCode: string;
  planLabel: string;
  isTrialPetitionUsed: boolean;
  petitionCount: number;
  firstPetitionAt: string | null;
  lastActivityAt: string | null;
  profileCompleted: boolean;
  createdAt: string | null;
  events: Array<{ label: string; at: string | null }>;
};

const READY_STATUSES = new Set(['approved', 'completed', 'delivered']);

function normalizePlan(planCode?: string | null) {
  const normalized = String(planCode || '').toLowerCase();
  if (!normalized) return 'free';
  return normalized;
}

function getStatusMeta(status: LifeCycleStatus) {
  switch (status) {
    case 'TRIAL_ATIVO':
      return { label: 'Trial Ativo', tone: 'secondary' as const };
    case 'TRIAL_USADO_AGUARDANDO_REGULARIZACAO':
      return { label: 'Trial Usado - Regularização Pendente', tone: 'outline' as const };
    case 'FREE_ATIVO':
      return { label: 'Free Ativo', tone: 'default' as const };
    case 'PAGO_ATIVO':
      return { label: 'Pago Ativo', tone: 'default' as const };
    case 'BLOQUEADO_POR_REGULARIZACAO':
      return { label: 'Bloqueado por Regularização', tone: 'destructive' as const };
    case 'BLOQUEADO_ADMIN':
      return { label: 'Bloqueado pelo Admin', tone: 'destructive' as const };
    default:
      return { label: 'Indefinido', tone: 'secondary' as const };
  }
}

function toPtBrDate(date: string | null) {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('pt-BR');
}

function toPtBrDateTime(date: string | null) {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleString('pt-BR');
}

function buildLifecycleUser(
  profile: UserProfileRow,
  subscription: SubscriptionRow | null,
  userPetitions: PetitionRow[]
): LifecycleUser {
  const firebaseUid = String(profile.firebase_uid || '');
  const planCode = normalizePlan(subscription?.plan_code);
  const planLabel = planCode === 'free' ? 'Free' : planCode === 'concierge' ? 'Trial/Concierge' : planCode;

  const petitionCount = userPetitions.length;
  const pilotPetitions = userPetitions.filter((petition) => Boolean(petition.is_pilot));
  const isTrialPetitionUsedByPetition = pilotPetitions.length > 0;
  const explicitTrialUsed = Boolean(profile.trial_petition_used);
  const isTrialPetitionUsed = explicitTrialUsed || isTrialPetitionUsedByPetition;

  const firstPetitionAt =
    [...userPetitions]
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
      .at(0)?.created_at || null;

  const lastActivityAt =
    [...userPetitions]
      .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
      .at(0)?.updated_at ||
    profile.updated_at ||
    profile.created_at ||
    null;

  const hasCpfCnpj = Boolean(String(profile.cpf || profile.cnpj || '').trim());
  const profileCompleted = hasCpfCnpj;
  const explicitRegularizationRequired = Boolean(profile.regularization_required);
  const explicitIsTrial = Boolean(profile.is_trial);

  const isBlocked = Boolean(profile.is_blocked) || String(profile.status || '').toLowerCase() === 'blocked';
  const hasReadyPilot = pilotPetitions.some((petition) =>
    READY_STATUSES.has(String(petition.status || '').toLowerCase())
  );

  let status: LifeCycleStatus = 'FREE_ATIVO';
  if ((isBlocked || explicitRegularizationRequired) && isTrialPetitionUsed && !profileCompleted) {
    status = 'BLOQUEADO_POR_REGULARIZACAO';
  } else if (isBlocked) {
    status = 'BLOQUEADO_ADMIN';
  } else if (planCode !== 'free' && planCode !== 'concierge') {
    status = 'PAGO_ATIVO';
  } else if (isTrialPetitionUsed && !profileCompleted && hasReadyPilot) {
    status = 'TRIAL_USADO_AGUARDANDO_REGULARIZACAO';
  } else if ((explicitIsTrial || !isTrialPetitionUsed) && !profileCompleted) {
    status = 'TRIAL_ATIVO';
  } else {
    status = 'FREE_ATIVO';
  }

  const statusMeta = getStatusMeta(status);
  const events: Array<{ label: string; at: string | null }> = [
    { label: 'Conta criada', at: profile.created_at || null },
    { label: 'Entrada trial', at: profile.trial_started_at || null },
    { label: 'Primeira petição enviada', at: firstPetitionAt },
    {
      label: hasReadyPilot ? 'Peça piloto concluída' : 'Peça piloto em andamento',
      at: hasReadyPilot
        ? [...pilotPetitions]
            .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
            .at(0)?.updated_at || null
        : null,
    },
    {
      label: profileCompleted ? 'Cadastro regularizado' : 'Aguardando regularização',
      at: profileCompleted ? profile.regularized_at || profile.updated_at || null : null,
    },
  ];

  return {
    id: profile.id,
    firebaseUid,
    name: profile.full_name || '—',
    email: profile.email || '—',
    phone: profile.phone || '—',
    cpfCnpj: profile.cpf || profile.cnpj || '—',
    status,
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
    planCode,
    planLabel,
    isTrialPetitionUsed,
    petitionCount,
    firstPetitionAt,
    lastActivityAt,
    profileCompleted,
    createdAt: profile.created_at || null,
    events,
  };
}

export default function UserLifecycle() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LifeCycleStatus>('all');
  const [trialFilter, setTrialFilter] = useState<'all' | 'used' | 'not_used'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [rows, setRows] = useState<LifecycleUser[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const profilesPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'client')
        .not('firebase_uid', 'is', null)
        .order('created_at', { ascending: false })
        .limit(3000);

      const subscriptionsPromise = supabase
        .from('user_subscriptions')
        .select('user_id, plan_code, status, created_at, updated_at')
        .eq('status', 'active');

      let petitionsResponse = await supabase
        .from('petitions')
        .select('id, client_id, status, is_pilot, created_at, updated_at')
        .limit(6000);

      if (petitionsResponse.error) {
        const message = String(petitionsResponse.error.message || '');
        const missingPilotColumn =
          petitionsResponse.error.code === '42703' || /column .*is_pilot.* does not exist/i.test(message);
        if (missingPilotColumn) {
          petitionsResponse = await supabase
            .from('petitions')
            .select('id, client_id, status, created_at, updated_at')
            .limit(6000);
          if (!petitionsResponse.error && petitionsResponse.data) {
            petitionsResponse.data = petitionsResponse.data.map((petition: any) => ({
              ...petition,
              is_pilot: false,
            }));
          }
        }
      }

      const [profilesResponse, subscriptionsResponse] = await Promise.all([
        profilesPromise,
        subscriptionsPromise,
      ]);

      if (profilesResponse.error) throw profilesResponse.error;

      const subscriptionsRelationMissing =
        subscriptionsResponse.error &&
        (subscriptionsResponse.error.code === '42P01' ||
          /relation .*user_subscriptions.* does not exist/i.test(String(subscriptionsResponse.error.message || '')));

      const subscriptions = subscriptionsRelationMissing ? [] : (subscriptionsResponse.data || []);

      if (subscriptionsResponse.error && !subscriptionsRelationMissing) {
        throw subscriptionsResponse.error;
      }

      if (petitionsResponse.error) throw petitionsResponse.error;

      const profiles = (profilesResponse.data || []) as UserProfileRow[];
      const allPetitions = (petitionsResponse.data || []) as PetitionRow[];

      const activeSubscriptionsByUser = new Map<string, SubscriptionRow>();
      for (const sub of subscriptions as SubscriptionRow[]) {
        const userId = String(sub.user_id || '');
        if (!userId) continue;
        const current = activeSubscriptionsByUser.get(userId);
        if (!current) {
          activeSubscriptionsByUser.set(userId, sub);
          continue;
        }
        const currentDate = new Date(current.updated_at || current.created_at || 0).getTime();
        const incomingDate = new Date(sub.updated_at || sub.created_at || 0).getTime();
        if (incomingDate >= currentDate) {
          activeSubscriptionsByUser.set(userId, sub);
        }
      }

      const petitionsByClient = new Map<string, PetitionRow[]>();
      for (const petition of allPetitions) {
        const clientId = String(petition.client_id || '');
        if (!clientId) continue;
        const existing = petitionsByClient.get(clientId) || [];
        existing.push(petition);
        petitionsByClient.set(clientId, existing);
      }

      const lifecycleUsers = profiles
        .filter((profile) => String(profile.firebase_uid || '').trim())
        .map((profile) => {
          const firebaseUid = String(profile.firebase_uid || '');
          const userSubscription = activeSubscriptionsByUser.get(firebaseUid) || null;
          const userPetitions = petitionsByClient.get(firebaseUid) || [];
          return buildLifecycleUser(profile, userSubscription, userPetitions);
        });

      setRows(lifecycleUsers);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Não foi possível carregar o ciclo de vida dos usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !term ||
        row.name.toLowerCase().includes(term) ||
        row.email.toLowerCase().includes(term) ||
        row.phone.toLowerCase().includes(term) ||
        row.cpfCnpj.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      const matchesTrial =
        trialFilter === 'all' ||
        (trialFilter === 'used' ? row.isTrialPetitionUsed : !row.isTrialPetitionUsed);
      const matchesPlan =
        planFilter === 'all' ||
        (planFilter === 'free'
          ? row.planCode === 'free' || row.planCode === 'concierge'
          : row.planCode !== 'free' && row.planCode !== 'concierge');

      return matchesSearch && matchesStatus && matchesTrial && matchesPlan;
    });
  }, [rows, search, statusFilter, trialFilter, planFilter]);

  const kpis = useMemo(() => {
    const trials = rows.filter((row) => row.status === 'TRIAL_ATIVO').length;
    const trialUsedPending = rows.filter(
      (row) => row.status === 'TRIAL_USADO_AGUARDANDO_REGULARIZACAO'
    ).length;
    const freeUsers = rows.filter((row) => row.status === 'FREE_ATIVO').length;
    const paidUsers = rows.filter((row) => row.status === 'PAGO_ATIVO').length;
    const blocked = rows.filter(
      (row) => row.status === 'BLOQUEADO_ADMIN' || row.status === 'BLOQUEADO_POR_REGULARIZACAO'
    ).length;
    return { trials, trialUsedPending, freeUsers, paidUsers, blocked };
  }, [rows]);

  return (
    <div className="space-y-6">
      <Card className="border-amber-200/45 bg-gradient-to-br from-amber-50/45 to-orange-50/25 shadow-[0_8px_24px_-18px_rgba(245,158,11,0.22)] dark:border-border/60 dark:bg-card/80 dark:bg-none dark:shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Ciclo de Vida de Usuários</CardTitle>
            <CardDescription>
              Funil QR - Trial - Regularização - Plano para acompanhamento de conversão.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            <span className="ml-2">Atualizar</span>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-xs text-muted-foreground">Trial Ativo</p>
                <p className="text-2xl font-bold">{kpis.trials}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Regularização Pendente</p>
                <p className="text-2xl font-bold">{kpis.trialUsedPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Free Ativo</p>
                <p className="text-2xl font-bold">{kpis.freeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <UserRoundCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs text-muted-foreground">Pago Ativo</p>
                <p className="text-2xl font-bold">{kpis.paidUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Bloqueados</p>
                <p className="text-2xl font-bold">{kpis.blocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input
            placeholder="Buscar por nome, email, telefone ou CPF/CNPJ"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Status do ciclo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="TRIAL_ATIVO">Trial ativo</SelectItem>
              <SelectItem value="TRIAL_USADO_AGUARDANDO_REGULARIZACAO">Regularização pendente</SelectItem>
              <SelectItem value="FREE_ATIVO">Free ativo</SelectItem>
              <SelectItem value="PAGO_ATIVO">Pago ativo</SelectItem>
              <SelectItem value="BLOQUEADO_POR_REGULARIZACAO">Bloqueado por regularização</SelectItem>
              <SelectItem value="BLOQUEADO_ADMIN">Bloqueado pelo admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={trialFilter} onValueChange={(value) => setTrialFilter(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Petição trial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="used">Trial usado</SelectItem>
              <SelectItem value="not_used">Trial não usado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={(value) => setPlanFilter(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os planos</SelectItem>
              <SelectItem value="free">Free/Trial</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários no Funil</CardTitle>
          <CardDescription>
            {filtered.length} usuário(s) filtrado(s) de {rows.length} cliente(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status do ciclo</TableHead>
                  <TableHead>Petição Trial</TableHead>
                  <TableHead>Qtd. Petições</TableHead>
                  <TableHead>Cadastro completo</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Última atividade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      Nenhum usuário encontrado para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">{row.email}</div>
                        <div className="text-xs text-muted-foreground">{row.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.statusTone}>{row.statusLabel}</Badge>
                      </TableCell>
                      <TableCell>{row.isTrialPetitionUsed ? 'Usada' : 'Não usada'}</TableCell>
                      <TableCell>{row.petitionCount}</TableCell>
                      <TableCell>{row.profileCompleted ? 'Sim' : 'Não'}</TableCell>
                      <TableCell>{row.planLabel}</TableCell>
                      <TableCell>{toPtBrDate(row.lastActivityAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                              <DialogHeader>
                                <DialogTitle>{row.name}</DialogTitle>
                                <DialogDescription>
                                  Linha do tempo e dados de regularização do cliente.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-xs text-muted-foreground">Email</div>
                                    <div>{row.email}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Telefone</div>
                                    <div>{row.phone}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">CPF/CNPJ</div>
                                    <div>{row.cpfCnpj}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Plano Atual</div>
                                    <div>{row.planLabel}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Criado em</div>
                                    <div>{toPtBrDateTime(row.createdAt)}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Última atividade</div>
                                    <div>{toPtBrDateTime(row.lastActivityAt)}</div>
                                  </div>
                                </div>

                                <div className="rounded-md border p-3">
                                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Timeline
                                  </div>
                                  <div className="space-y-2">
                                    {row.events.map((event) => (
                                      <div key={`${row.id}-${event.label}`} className="flex items-center justify-between gap-3">
                                        <span>{event.label}</span>
                                        <span className="text-xs text-muted-foreground">{toPtBrDateTime(event.at)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                const token = await auth.currentUser?.getIdToken();
                                if (!token) {
                                  toast.error('Sessão expirada. Faça login novamente.');
                                  return;
                                }
                                const resp = await fetch('/api/users/send-regularization-link', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ firebase_uid: row.firebaseUid }),
                                });
                                const payload = await resp.json().catch(() => ({}));
                                if (!resp.ok) throw new Error(payload?.error || 'Erro ao enviar link');
                                toast.success('Link de regularização enviado por e-mail.');
                              } catch (error: any) {
                                toast.error(error?.message || 'Não foi possível enviar o link.');
                              }
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = `/#/admin/user-profile/${encodeURIComponent(row.id)}`;
                              window.open(url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
