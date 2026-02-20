import React, { useMemo, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient'
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useUser } from '@/contexts/UserContext';
import { Petition } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Eye, FileText, CheckCircle, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { PetitionUsageCard } from '@/components/dashboard/PetitionUsageCard';
import { toast } from 'sonner';
import { UserSettingsService } from '@/services/userSettingsService';

const getStatusColor = (status: string) => {
  const upperStatus = status?.toUpperCase();
  switch (upperStatus) {
    case 'PENDING': return 'secondary';
    case 'ASSIGNED': return 'default';
    case 'IN_PROGRESS': return 'default';
    case 'COMPLETED': return 'default';
    case 'APPROVED': return 'default';
    case 'CANCELLED': return 'destructive';
    default: return 'secondary';
  }
};

const getStatusLabel = (status: string) => {
  const upperStatus = status?.toUpperCase();
  switch (upperStatus) {
    case 'PENDING': return 'Pendente';
    case 'ASSIGNED': return 'Atribuída';
    case 'IN_PROGRESS': return 'Em Andamento';
    case 'COMPLETED': return 'Concluída';
    case 'APPROVED': return 'Aprovada';
    case 'CANCELLED': return 'Cancelada';
    default: return status;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'HIGH': return 'destructive';
    case 'MEDIUM': return 'default';
    case 'LOW': return 'secondary';
    default: return 'secondary';
  }
};

export default function ClientDashboard() {
  const { user, getClient } = useNewAuth();
  const { profile: userProfile } = useUser();
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [selected, setSelected] = useState<Petition | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showNewClientWelcomeModal, setShowNewClientWelcomeModal] = useState(false);
  const [isPetitionsExpanded, setIsPetitionsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPlanCode, setCurrentPlanCode] = useState<string | null>(null);
  const activationHandledRef = useRef(false);

  // ✅ CORREÇÃO CRÍTICA: Garantir que apenas clientes possam acessar este componente
  // Verifica o role do usuário ao montar o componente
  useEffect(() => {
    if (user && user.role !== 'client') {
      console.warn('⚠️ Tentativa de acesso à área do cliente por usuário não-cliente:', {
        role: user.role,
        userId: user.uid
      });
      toast.error('Acesso não autorizado. Redirecionando...');
      
      // Redirecionar para o dashboard apropriado baseado no role
      const roleDashboard = user.role === 'admin' ? '/admin' : '/writer';
      navigate(roleDashboard, { replace: true });
      return;
    }
    
    // HashRouter: não usar window.location.pathname/search aqui (são da URL real, não do hash).
    // Se por algum motivo chegarmos com rota diferente, normalize via navigate.
    if (user?.role === 'client' && location.pathname !== '/client') {
      navigate(`/client${location.search || ''}`, { replace: true });
    }
  }, [user?.role, user?.uid, navigate, location.pathname, location.search]);

  useEffect(() => {
    // ✅ CORREÇÃO CRÍTICA: Verificar role ANTES de processar pagamento
    // Se não for cliente, não processar pagamento e redirecionar
    if (user && user.role !== 'client') {
      return; // Já foi tratado no useEffect anterior
    }

    // Verificar retorno do Stripe e atualizar plano automaticamente
    const urlParams = new URLSearchParams(location.search);
    const activateToken = urlParams.get('activate_token');
    // Aceitar ambos os formatos: payment=success OU success=true
    const paymentSuccess = urlParams.get('payment') === 'success' || urlParams.get('success') === 'true';
    const sessionId = urlParams.get('session_id');
    const plan = urlParams.get('plan');
    const hasFreeBonus = urlParams.get('free_bonus') === 'true';
    const userIdFromUrl = urlParams.get('user_id');
    
    // ✅ SEGURANÇA: Verificar se o user_id da URL corresponde ao usuário logado
    // Isso previne que um admin ou outro usuário processe o pagamento de outro cliente
    if (paymentSuccess && userIdFromUrl && user?.uid && userIdFromUrl !== user.uid) {
      console.warn('⚠️ Tentativa de processar pagamento de outro usuário:', {
        userIdFromUrl,
        currentUserId: user.uid
      });
      toast.error('Erro: Pagamento não corresponde ao usuário logado. Redirecionando...');
      // Limpar URL e redirecionar para planos
      navigate('/client/plans', { replace: true });
      return;
    }
    
    // 0) Ativação da peça piloto via token (link de brinde)
    if (activateToken && user?.uid && !activationHandledRef.current) {
      activationHandledRef.current = true;
      (async () => {
        try {
          const { data, error } = await supabase.rpc('redeem_pilot_activation_token', {
            p_token: String(activateToken || '').trim(),
            p_firebase_uid: user.uid,
          });

          if (error) {
            console.error('redeem_pilot_activation_token error:', error);
            toast.error(error.message || 'Não foi possível concluir a ativação.');
          } else {
            const ok = (data as any)?.success !== false;
            if (!ok) {
              toast.error((data as any)?.message || 'Não foi possível concluir a ativação.');
            } else {
              toast.success('Peça piloto ativada com sucesso.');
              setShowWelcomeModal(true);
            }
          }
        } catch (err: any) {
          console.error(err);
          toast.error(err?.message || 'Não foi possível concluir a ativação.');
        } finally {
          // Limpar URL (evita reprocessar se o usuário atualizar)
          navigate('/client', { replace: true });
          try {
            sessionStorage.removeItem('veredicta.pilot_activation_token');
          } catch {}
        }
      })();
      return;
    }

    // Atualizar plano se tiver plan na URL (mesmo sem session_id)
    // Só processar se o user_id corresponder OU se não houver user_id na URL (compatibilidade)
    if (paymentSuccess && plan && user?.uid && (!userIdFromUrl || userIdFromUrl === user.uid)) {
      // Verificar pagamento e atualizar plano (sessionId é opcional)
      verifyAndUpdatePlan(sessionId || 'manual', user.uid, plan, hasFreeBonus);
    } else if (hasFreeBonus && (!userIdFromUrl || userIdFromUrl === user?.uid)) {
      // Verificar se realmente tem bônus FREE ativo
      checkFreeBonusStatus();
    }
    
    // Limpar URL após processar
    if (paymentSuccess || hasFreeBonus) {
      navigate('/client', { replace: true });
    }
  }, [user?.uid, user?.role, navigate, location.search]);

  // Detectar plano (para adaptar textos do modal em Concierge)
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
  
  const verifyAndUpdatePlan = async (
    sessionId: string, 
    userId: string, 
    plan: string, 
    includeFreeBonus: boolean
  ) => {
    try {
      // Obter cliente Supabase (não precisa estar autenticado, a função RPC bypassa RLS)
      const { supabase: supabaseClient } = await getClient();
      
      // Usar função RPC que bypassa RLS
      const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error: rpcError } = await supabaseClient
        .rpc('update_user_subscription', {
          p_user_id: userId,
          p_plan_code: plan.toLowerCase(),
          p_status: 'active',
          p_next_billing_date: nextBillingDate
        });

      if (rpcError) {
        console.error('❌ Erro ao atualizar plano via RPC:', rpcError);
        toast.error('Erro ao ativar plano. Entre em contato com suporte.');
        return;
      }

      if (!data || data.length === 0) {
        console.error('❌ Nenhum dado retornado da função RPC');
        toast.error('Erro ao ativar plano. Tente novamente.');
        return;
      }
      
      // Verificar se realmente foi atualizado
      const { data: verifyData } = await supabaseClient
        .from('user_subscriptions')
        .select('plan_code, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      // Recarregar dados do usuário para refletir mudanças
      toast.success(`Plano ${plan.toUpperCase()} ativado com sucesso!`);
      
      // Disparar evento customizado para forçar atualização dos componentes
      window.dispatchEvent(new CustomEvent('planUpdated', { detail: { plan_code: plan.toLowerCase() } }));
      
      // Recarregar página após um breve delay para garantir que os dados foram salvos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      // Se incluir bônus FREE, verificar se cliente pode receber
      if (includeFreeBonus) {
        try {
          const { data: userProfile } = await supabaseClient
            .from('user_profiles')
            .select('cnpj, cpf')
            .eq('firebase_uid', userId)
            .single();

          if (userProfile) {
            const { data: existingFreeUsage } = await supabaseClient
              .from('user_subscriptions')
              .select(`
                user_id,
                user_profiles!inner(cnpj, cpf)
              `)
              .eq('plan_code', 'free')
              .eq('status', 'used')
              .or(`user_profiles.cnpj.eq.${userProfile.cnpj},user_profiles.cpf.eq.${userProfile.cpf}`);

            if (!existingFreeUsage || existingFreeUsage.length === 0) {
              const { error: freeError } = await supabaseClient
                .from('user_subscriptions')
                .insert({
                  user_id: userId,
                  plan_code: 'free',
                  status: 'active',
                  next_billing_date: new Date(Date.now() + 999 * 24 * 60 * 60 * 1000).toISOString(),
                  is_bonus: true,
                });

              if (freeError) {
                console.error('⚠️ Erro ao criar plano FREE bônus:', freeError);
              }
            }
          }
        } catch (bonusError) {
          console.error('⚠️ Erro ao processar bônus FREE:', bonusError);
          // Não falhar o processo se o bônus falhar
        }
      }

      toast.success(`Plano ${plan} ativado com sucesso!`);
      
      // Recarregar página para atualizar dados
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Erro ao atualizar plano:', error);
      toast.error(error?.message || 'Erro ao processar pagamento. Entre em contato com suporte.');
    }
  };

  const checkFreeBonusStatus = async () => {
    if (!user?.uid) return;

    try {
      const { data: freeBonus } = await supabase
        .from('user_subscriptions')
        .select('id, user_id, plan_code, status, is_bonus, created_at')
        .eq('user_id', user.uid)
        .eq('plan_code', 'free')
        .eq('is_bonus', true)
        .eq('status', 'active')
        .single();

      if (freeBonus) {
        setShowWelcomeModal(true);
      }
    } catch (error) {
      console.error('Erro ao verificar bônus FREE:', error);
    }
  };

  // ✅ Modal de boas-vindas para novos clientes
  useEffect(() => {
    if (!user?.uid || user.role !== 'client') return;

    async function checkNewClientWelcome() {
      try {
        // Verificar se o cliente já viu o modal de boas-vindas antes
        const welcomeModalKey = `welcome_modal_seen_${user.uid}`;
        const hasSeenWelcome = localStorage.getItem(welcomeModalKey);
        
        if (hasSeenWelcome) {
          console.log('✅ Cliente já viu o modal de boas-vindas');
          return; // Cliente já viu o modal
        }

        console.log('🔍 Verificando se é cliente novo...');
        const { supabase: supabaseClient } = await getClient();
        
        // ✅ CORREÇÃO: Verificar se é cliente novo verificando created_at do perfil
        // Se foi criado há menos de 30 minutos, considerar como novo cliente (aumentado de 5 para 30)
        let isNewClient = false;
        try {
          const { data: profile, error: profileError } = await supabaseClient
            .from('user_profiles')
            .select('created_at')
            .eq('firebase_uid', user.uid)
            .maybeSingle();

          if (profileError) {
            // Se for erro 400 (Bad Request), pode ser problema de RLS ou query malformada
            if (profileError.status === 400) {
              console.warn('⚠️ Erro 400 ao verificar perfil (possível problema de RLS ou query). Assumindo cliente novo:', profileError);
              isNewClient = true;
            } else {
              console.warn('⚠️ Erro ao verificar perfil:', profileError);
              // Em caso de erro, assumir que é novo se não viu o modal
              isNewClient = true;
            }
          } else if (profile?.created_at) {
            const createdAt = new Date(profile.created_at);
            const now = new Date();
            const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);
            // Considerar novo se foi criado há menos de 30 minutos (aumentado de 5)
            isNewClient = minutesSinceCreation < 30;
            console.log(`🔍 Cliente criado há ${minutesSinceCreation.toFixed(1)} minutos. É novo? ${isNewClient}`);
          } else {
            // Se não conseguir verificar, assumir que é novo se não viu o modal
            isNewClient = true;
            console.log('⚠️ Não foi possível verificar data de criação (perfil não encontrado). Assumindo cliente novo.');
          }
        } catch (profileErr) {
          console.warn('⚠️ Erro ao verificar perfil:', profileErr);
          // Em caso de erro, assumir que é novo se não viu o modal
          isNewClient = true;
        }

        // ✅ CORREÇÃO: Tentar verificar plano FREE com retry (pode não estar criado ainda)
        let subscription = null;
        let attempts = 0;
        const maxAttempts = 5; // Aumentado de 3 para 5
        
        while (attempts < maxAttempts && !subscription) {
          try {
            const { data: subData, error: subError } = await supabaseClient
              .from('user_subscriptions')
              .select('plan_code, status, created_at')
              .eq('user_id', user.uid)
              .eq('status', 'active')
              .eq('plan_code', 'free')
              .maybeSingle();

            if (subError) {
              // Se for erro 400 (Bad Request), pode ser problema de RLS ou query malformada
              if (subError.status === 400) {
                console.warn(`⚠️ Erro 400 ao verificar plano (tentativa ${attempts + 1}/${maxAttempts}):`, subError);
                // Se é cliente novo e deu erro 400, mostrar modal mesmo assim
                if (isNewClient && attempts >= maxAttempts - 1) {
                  console.log('✅ Cliente novo detectado. Erro 400 ao verificar plano. Mostrando modal mesmo assim.');
                  setShowNewClientWelcomeModal(true);
                  return;
                }
                // Tentar novamente se ainda há tentativas
                if (attempts < maxAttempts - 1) {
                  await new Promise(resolve => setTimeout(resolve, 2000 * (attempts + 1)));
                  attempts++;
                  continue;
                }
                // Se todas as tentativas falharam, mas é cliente novo, mostrar modal mesmo assim
                if (isNewClient) {
                  console.log('✅ Cliente novo detectado. Mostrando modal mesmo sem plano criado.');
                  setShowNewClientWelcomeModal(true);
                  return;
                }
                return;
              }
              // Se for erro de rede/CORS, tentar novamente
              if (subError.status === 406 || subError.code === 'PGRST116') {
                console.warn(`⚠️ Erro de rede ao verificar plano (tentativa ${attempts + 1}/${maxAttempts})`);
                if (attempts < maxAttempts - 1) {
                  await new Promise(resolve => setTimeout(resolve, 2000 * (attempts + 1))); // Delay crescente (2s, 4s, 6s, 8s)
                  attempts++;
                  continue;
                }
                // Se todas as tentativas falharam, mas é cliente novo, mostrar modal mesmo assim
                if (isNewClient) {
                  console.log('✅ Cliente novo detectado. Mostrando modal mesmo sem plano criado.');
                  setShowNewClientWelcomeModal(true);
                  return;
                }
                return;
              }
              console.error('Erro ao verificar plano:', subError);
              break;
            }

            subscription = subData;
            if (subscription) {
              console.log('✅ Plano FREE encontrado:', subscription);
            }
            break;
          } catch (dbError: any) {
            console.warn(`⚠️ Erro ao verificar plano (tentativa ${attempts + 1}/${maxAttempts}):`, dbError);
            if (attempts < maxAttempts - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000 * (attempts + 1)));
              attempts++;
              continue;
            }
            // Se todas as tentativas falharam, mas é cliente novo, mostrar modal mesmo assim
            if (isNewClient) {
              console.log('✅ Cliente novo detectado. Mostrando modal mesmo sem plano criado.');
              setShowNewClientWelcomeModal(true);
              return;
            }
            break;
          }
        }

        // ✅ CORREÇÃO: Mostrar modal se tem plano FREE OU se é cliente novo
        if (subscription || isNewClient) {
          console.log('✅ Mostrando modal de boas-vindas para novo cliente', { hasSubscription: !!subscription, isNewClient });
          setShowNewClientWelcomeModal(true);
        } else {
          console.log('⚠️ Cliente não é novo e não tem plano FREE. Não mostrando modal.');
        }
      } catch (error: any) {
        console.error('Erro geral ao verificar modal de boas-vindas:', error);
        // Em caso de erro geral (incluindo 400), se não viu o modal antes, mostrar para novos clientes
        const welcomeModalKey = `welcome_modal_seen_${user.uid}`;
        const hasSeenWelcome = localStorage.getItem(welcomeModalKey);
        if (!hasSeenWelcome) {
          console.log('⚠️ Erro ao verificar. Tentando mostrar modal como fallback (cliente novo assumido).');
          // Se for erro 400 ou qualquer outro erro, assumir que é cliente novo e mostrar modal
          setShowNewClientWelcomeModal(true);
        }
      }
    }

    // ✅ CORREÇÃO: Aguardar mais tempo antes de verificar para dar tempo do plano ser criado
    const timeout = setTimeout(() => {
      checkNewClientWelcome();
    }, 2000); // Aumentado de 1 segundo para 2 segundos

    return () => clearTimeout(timeout);
  }, [user?.uid, user?.role, getClient]);

  useEffect(() => {
    if (!user?.uid) return;

    async function loadPetitions() {
      try {
        // Usar apenas a tabela atual 'petitions'
        const { data, error } = await supabase
          .from('petitions')
          .select('id, display_id, title, type, status, priority, created_at, deadline, assigned_writer_id, writer_name, price, description')
          .eq('client_id', user.uid)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) {
          console.error('❌ Erro ao buscar petições:', error);
          // Se der erro de RLS, tentar RPC
          if (error.code === '42501') {
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_client_petitions', {
              p_client_id: user.uid
            });
            if (!rpcError && rpcData) {
              setPetitions(rpcData as any);
              return;
            }
          }
        } else if (data) {
          setPetitions(data as any);
          return;
        }
        
        setPetitions([]);
        
      } catch (err) {
        console.error('❌ Erro geral ao carregar petições:', err);
        setPetitions([]);
      }
    }
    loadPetitions();

    let channel: ReturnType<typeof supabase.channel> | null = null;

    // Função para criar/ativar subscription
    const activateSubscription = () => {
      if (channel) {
        return; // Já existe
      }

      channel = supabase
        .channel('client-petitions')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'petitions',
          filter: `client_id=eq.${user.uid}`
        }, (payload) => {
          const evt = payload.eventType;
          const newRow = payload.new as Petition;
          const oldRow = payload.old as Petition | null;
          setPetitions(prev => {
            if (evt === 'INSERT' && newRow) return [newRow, ...prev];
            if (evt === 'UPDATE' && newRow) return prev.map(p => p.id === newRow.id ? newRow : p);
            if (evt === 'DELETE' && oldRow) return prev.filter(p => p.id !== oldRow.id);
            return prev;
          });
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

    // Calcular tempo médio de conclusão
  const calculateAverageTime = () => {
    // Considerar COMPLETED e APPROVED como concluídas (case-insensitive)
    const allCompletedOrApproved = petitions.filter(p => {
      const status = p.status?.toUpperCase();
      return status === 'COMPLETED' || status === 'APPROVED';
    });
    
    const completedPetitions = allCompletedOrApproved.filter(p => 
      (p.completed_at || p.accepted_at) && p.created_at
    );
    
    if (completedPetitions.length === 0) {
      // Se não tem completed_at/accepted_at, usar created_at como fallback
      // e calcular até hoje
      if (allCompletedOrApproved.length > 0) {
        const totalDays = allCompletedOrApproved.reduce((sum, petition) => {
          const createdDate = new Date(petition.created_at);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - createdDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0);
        
        const average = Math.round(totalDays / allCompletedOrApproved.length);
        return average.toString();
      }
      return '—';
    }
    
    const totalDays = completedPetitions.reduce((sum, petition) => {
      const createdDate = new Date(petition.created_at);
      // Usar completed_at ou accepted_at, o que estiver disponível
      const finishedDate = new Date(petition.completed_at || petition.accepted_at || petition.created_at);
      const diffTime = Math.abs(finishedDate.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    const average = Math.round(totalDays / completedPetitions.length);
    return average.toString();
  };

  const stats = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const activePetitions = petitions.filter(p => {
      const status = p.status?.toUpperCase();
      return ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(status);
    }).length;

    const completedThisMonth = petitions.filter(p => {
      const status = p.status?.toUpperCase();
      if (status !== 'COMPLETED' && status !== 'APPROVED') return false;
      const dateRef = new Date((p.completed_at as any) || (p.accepted_at as any) || p.created_at);
      return dateRef.getMonth() === month && dateRef.getFullYear() === year;
    }).length;

    return { activePetitions, completedThisMonth };
  }, [petitions]);

  const avgCompletionDays = useMemo(() => calculateAverageTime(), [petitions]);

  const displayedPetitions = useMemo(() => {
    return isPetitionsExpanded ? petitions : petitions.slice(0, 5);
  }, [isPetitionsExpanded, petitions]);

  const canShowAllButton = !isPetitionsExpanded && petitions.length > 5;

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
  }: {
    title: string;
    value: React.ReactNode;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <Card className="group rounded-2xl border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 motion-reduce:transform-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
        <div className="rounded-xl bg-primary/10 text-primary p-2 transition-colors group-hover:bg-primary/15">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page header (conteúdo) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {userProfile?.name || user?.email || 'Usuário'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => navigate('/client/petitions/new')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground active:translate-y-[1px] transition-transform motion-reduce:transform-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova petição
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/client/petitions')}
            className="active:translate-y-[1px] transition-transform motion-reduce:transform-none"
          >
            Minhas petições
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/client/plans')}
            className="active:translate-y-[1px] transition-transform motion-reduce:transform-none"
          >
            Ver planos
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        <PetitionUsageCard className="lg:col-span-4" />

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Petições ativas"
            value={stats.activePetitions}
            subtitle="Em andamento"
            icon={FileText}
          />
          <StatCard
            title="Concluídas"
            value={stats.completedThisMonth}
            subtitle="Este mês"
            icon={CheckCircle}
          />
          <StatCard
            title="Tempo médio"
            value={avgCompletionDays}
            subtitle="Dias para conclusão"
            icon={Clock}
          />
        </div>
      </div>

      {/* Petições recentes / lista */}
      <Card className="rounded-2xl border-border/60 shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-700">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Suas petições</CardTitle>
            <CardDescription>
              {isPetitionsExpanded ? 'Lista completa em tempo real' : 'Últimas petições criadas'}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPetitionsExpanded((v) => !v)}
            >
              {isPetitionsExpanded ? 'Ver menos' : 'Ver mais'}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/client/petitions')}>
              Abrir página <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {petitions.length === 0 ? (
            <div className="text-center py-10">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Nenhuma petição ainda</h3>
              <p className="text-muted-foreground mb-5">Crie sua primeira petição para começar.</p>
              <Button onClick={() => navigate('/client/petitions/new')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Criar petição
              </Button>
            </div>
          ) : (
            <div className={isPetitionsExpanded ? 'max-h-[52vh] overflow-y-auto pr-1 space-y-2' : 'space-y-2'}>
              {displayedPetitions.map((petition) => (
                <button
                  key={petition.id}
                  type="button"
                  onClick={() => setSelected(petition)}
                  className="w-full text-left group flex items-start justify-between gap-4 p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border hover:shadow-sm transition-all duration-200 motion-reduce:transform-none"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-nowrap overflow-hidden">
                      <Badge variant={getStatusColor(petition.status) as any} className="shrink-0">
                        {getStatusLabel(petition.status)}
                      </Badge>
                      {petition.priority ? (
                        <Badge variant={getPriorityColor(petition.priority) as any} className="shrink-0">
                          {petition.priority}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-2">
                      <div className="font-medium text-foreground truncate">
                        {petition.title}
                      </div>
                      {petition.description ? (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {petition.description}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelected(petition);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </button>
              ))}

              {canShowAllButton ? (
                <div className="text-center pt-3">
                  <Button variant="outline" onClick={() => setIsPetitionsExpanded(true)}>
                    Ver todas ({petitions.length})
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-900">
        <Card className="rounded-2xl border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 motion-reduce:transform-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Nova petição</CardTitle>
            <CardDescription>Enviar uma nova demanda</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={() => navigate('/client/petitions/new')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground active:translate-y-[1px] transition-transform motion-reduce:transform-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar agora
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 motion-reduce:transform-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chat</CardTitle>
            <CardDescription>Fale com o redator ou suporte</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              onClick={() => navigate('/client/chat')}
              className="w-full active:translate-y-[1px] transition-transform motion-reduce:transform-none"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Abrir chat
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 motion-reduce:transform-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Planos</CardTitle>
            <CardDescription>Upgrade e limites</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              onClick={() => navigate('/client/plans')}
              className="w-full active:translate-y-[1px] transition-transform motion-reduce:transform-none"
            >
              Ver planos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de detalhes */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription className="sr-only">
              Detalhes da petição
            </DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getStatusColor(selected?.status || '') as any}>
                {getStatusLabel(selected?.status || '')}
              </Badge>
              {selected?.priority && (
                <Badge variant={getPriorityColor(selected.priority) as any}>
                  {selected.priority}
                </Badge>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {(selected?.display_id || selected?.id) && (
              <div>
                <h4 className="font-medium text-foreground mb-2">ID da Petição</h4>
                <Badge variant="outline" className="px-4 py-2 text-base font-mono font-semibold bg-muted/50 border-2">
                  {selected?.display_id || selected?.id}
                </Badge>
              </div>
            )}
            <div>
              <h4 className="font-medium text-foreground mb-2">Descrição</h4>
              <p className="text-muted-foreground">{selected?.description}</p>
            </div>
            {selected?.created_at && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Data de Criação</h4>
                <p className="text-muted-foreground">
                  {new Date(selected.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Fechar
              </Button>
              <Button onClick={async () => {
                if (!selected?.id || !user?.uid) return;
                
                try {
                  const petitionId = selected.id;
                  const displayId = selected.display_id;
                  
                  // Buscar conversas onde o usuário é participante E a petição corresponde
                  // Usar join com conversation_participants para garantir que o usuário é participante
                  let { data: conversationsWithParticipant, error: participantError } = await supabase
                    .from('conversations')
                    .select(`
                      id, 
                      petition_id, 
                      metadata, 
                      title,
                      conversation_participants!inner(user_id)
                    `)
                    .eq('type', 'petition')
                    .eq('conversation_participants.user_id', user.uid)
                    .or(`petition_id.eq.${petitionId},metadata->>petitionId.eq.${petitionId}`)
                    .limit(10);
                  
                  if (participantError) {
                    console.warn('⚠️ Erro ao buscar conversas com participante:', participantError);
                  }
                  
                  let foundConversation = null;
                  
                  // Filtrar para encontrar a conversa correta
                  if (conversationsWithParticipant && conversationsWithParticipant.length > 0) {
                    // Priorizar conversa com petition_id exato
                    foundConversation = conversationsWithParticipant.find(c => 
                      c.petition_id === petitionId
                    );
                    
                    // Se não encontrou por petition_id, buscar por metadata
                    if (!foundConversation) {
                      foundConversation = conversationsWithParticipant.find(c => {
                        const meta = c.metadata as any;
                        return meta?.petitionId === petitionId;
                      });
                    }
                    
                    // Se ainda não encontrou e tem display_id, buscar por display_id
                    if (!foundConversation && displayId && displayId !== petitionId) {
                      foundConversation = conversationsWithParticipant.find(c => {
                        const meta = c.metadata as any;
                        return meta?.petitionDisplayId === displayId || 
                               meta?.petition_display_id === displayId ||
                               meta?.display_id === displayId ||
                               (c.title && c.title.includes(displayId));
                      });
                    }
                    
                    // Fallback: primeira conversa encontrada (onde o usuário é participante)
                    if (!foundConversation && conversationsWithParticipant.length > 0) {
                      foundConversation = conversationsWithParticipant[0];
                    }
                  }
                  
                  // Se não encontrou conversa onde o usuário é participante, buscar qualquer conversa da petição
                  // (pode ser que o usuário precise ser adicionado como participante)
                  if (!foundConversation) {
                    const { data: allConversations, error: allError } = await supabase
                      .from('conversations')
                      .select('id, petition_id, metadata, title')
                      .eq('type', 'petition')
                      .or(`petition_id.eq.${petitionId},metadata->>petitionId.eq.${petitionId}`)
                      .limit(10);
                    
                    if (!allError && allConversations && allConversations.length > 0) {
                      // Priorizar por petition_id
                      foundConversation = allConversations.find(c => c.petition_id === petitionId) || allConversations[0];
                    }
                  }
                  
                  if (foundConversation) {
                    setSelected(null);
                    navigate(`/client/chat?conversation=${foundConversation.id}`);
                  } else {
                    // Se não existe conversa, navegar para o chat e criar uma
                    setSelected(null);
                    navigate('/client/chat', { 
                      state: { 
                        petitionId: selected.id,
                        petitionTitle: selected.title,
                        autoSelect: true
                      } 
                    });
                  }
                } catch (err) {
                  console.error('❌ Erro ao processar navegação para chat:', err);
                  toast.error('Erro ao abrir chat');
                }
              }}>
                Ir para Chat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Boas-vindas com Bônus FREE */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            
            <DialogTitle className="text-2xl font-bold text-foreground mb-2">
              Parabéns!
            </DialogTitle>
            
            <DialogDescription className="text-muted-foreground mb-4">
              Seu plano foi ativado com sucesso!
            </DialogDescription>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-foreground mb-2">
                🎁 Bônus de Boas-vindas
              </h4>
              <p className="text-sm text-muted-foreground">
                Você ganhou <strong>1 petição gratuita extra</strong> além do seu plano!
                <br />
                Use quando quiser, sem prazo de validade.
              </p>
            </div>
            
            <Button 
              onClick={() => setShowWelcomeModal(false)} 
              className="w-full"
            >
              Começar a usar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Boas-vindas para Novos Clientes - Aparece apenas na primeira vez */}
      <Dialog 
        open={showNewClientWelcomeModal} 
        onOpenChange={(open) => {
          // Quando fechar o modal, marcar como visto
          if (!open && user?.uid) {
            localStorage.setItem(`welcome_modal_seen_${user.uid}`, 'true');
            setShowNewClientWelcomeModal(false);
          }
        }}
      >
        <DialogContent className="max-w-lg sm:max-w-md">
          <div className="text-center py-4">
            {/* Ícone de boas-vindas */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 mb-6 shadow-lg">
              <span className="text-4xl">🎉</span>
            </div>
            
            {/* Título */}
            <DialogTitle className="text-3xl font-bold text-foreground mb-3">
              Bem-vindo à Veredicta!
            </DialogTitle>
            
            {/* Descrição */}
            <DialogDescription className="text-muted-foreground mb-6 text-base">
              Estamos muito felizes em tê-lo conosco! Você está pronto para começar.
            </DialogDescription>
            
            {/* Destaque para petição de cortesia */}
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-orange-500 text-white shadow-sm">
                  <span className="text-2xl">{isConcierge ? '📝' : '🎁'}</span>
                </div>
                <h4 className="text-xl font-bold text-foreground">
                  {isConcierge ? 'Primeiro passo' : 'Presente de Boas-vindas'}
                </h4>
              </div>
              
              <div className="bg-background/70 rounded-xl p-4 border border-border/60">
                <p className="text-base text-foreground leading-relaxed">
                  <span className="font-semibold text-primary text-lg">
                    {isConcierge ? 'Sua primeira petição pode ser criada agora' : 'Uma petição está disponível para você'}
                  </span>
                  !
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {isConcierge
                    ? 'Preencha as informações e envie seus documentos para iniciar a redação.'
                    : 'Use quando quiser para criar sua primeira petição jurídica com qualidade profissional.'}
                </p>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => {
                  if (user?.uid) {
                    localStorage.setItem(`welcome_modal_seen_${user.uid}`, 'true');
                  }
                  setShowNewClientWelcomeModal(false);
                  navigate('/client/petitions/new');
                }} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <FileText className="mr-2 h-5 w-5" />
                Criar Minha Primeira Petição
              </Button>
              <Button 
                onClick={() => {
                  if (user?.uid) {
                    localStorage.setItem(`welcome_modal_seen_${user.uid}`, 'true');
                  }
                  setShowNewClientWelcomeModal(false);
                }} 
                variant="outline"
                className="w-full border-2 py-6 text-base"
              >
                Explorar Plataforma Primeiro
              </Button>
            </div>
            
            {/* Nota informativa */}
            <p className="text-xs text-muted-foreground mt-4">
              Esta mensagem aparecerá apenas uma vez. Você pode criar sua primeira petição quando quiser!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
