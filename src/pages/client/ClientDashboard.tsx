import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'
import { DatabaseService } from '@/services/databaseService'
import { useNewAuth } from '@/contexts/NewAuthContext';
import { Petition } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, FileText, CreditCard, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { PetitionUsageCard } from '@/components/dashboard/PetitionUsageCard';
import { toast } from 'sonner';

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
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [selected, setSelected] = useState<Petition | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar retorno do Stripe e atualizar plano automaticamente
    const urlParams = new URLSearchParams(window.location.search);
    // Aceitar ambos os formatos: payment=success OU success=true
    const paymentSuccess = urlParams.get('payment') === 'success' || urlParams.get('success') === 'true';
    const sessionId = urlParams.get('session_id');
    const plan = urlParams.get('plan');
    const hasFreeBonus = urlParams.get('free_bonus') === 'true';
    
    console.log('🔍 Verificando parâmetros da URL:', {
      paymentSuccess,
      sessionId,
      plan,
      hasFreeBonus,
      userId: user?.uid,
      allParams: Object.fromEntries(urlParams.entries())
    });
    
    // Atualizar plano se tiver plan na URL (mesmo sem session_id)
    if (paymentSuccess && plan && user?.uid) {
      console.log('✅ Retorno do Stripe detectado! Atualizando plano...', { 
        sessionId, 
        plan, 
        userId: user.uid 
      });
      
      // Verificar pagamento e atualizar plano (sessionId é opcional)
      verifyAndUpdatePlan(sessionId || 'manual', user.uid, plan, hasFreeBonus);
    } else if (hasFreeBonus) {
      // Verificar se realmente tem bônus FREE ativo
      checkFreeBonusStatus();
    }
    
    // Limpar URL após processar
    if (paymentSuccess || hasFreeBonus) {
      window.history.replaceState({}, '', '/client');
    }
  }, [user?.uid]);
  
  const verifyAndUpdatePlan = async (
    sessionId: string, 
    userId: string, 
    plan: string, 
    includeFreeBonus: boolean
  ) => {
    try {
      console.log('📡 Atualizando plano automaticamente...', { sessionId, userId, plan });
      
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

      console.log('✅ Plano atualizado com sucesso!');
      
      // Verificar se realmente foi atualizado
      const { data: verifyData } = await supabaseClient
        .from('user_subscriptions')
        .select('plan_code, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      console.log('🔍 Verificação pós-atualização:', verifyData);
      
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
              } else {
                console.log('✅ Plano FREE bônus criado!');
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

  useEffect(() => {
    if (!user?.uid) return;

    async function loadPetitions() {
      console.log('🔍 Carregando petições para client_id:', user.uid);
      
      try {
        // Usar apenas a tabela atual 'petitions'
        const { data, error } = await supabase
          .from('petitions')
          .select('id, title, type, status, priority, created_at, deadline, assigned_writer_id, writer_name, price, description')
          .eq('client_id', user.uid)
          .order('created_at', { ascending: false })
          .limit(50);
        
        console.log('📊 Resultado da query petitions:', { data, error });
        
        if (error) {
          console.error('❌ Erro ao buscar petições:', error);
          // Se der erro de RLS, tentar RPC
          if (error.code === '42501') {
            console.log('🔄 Tentando RPC get_client_petitions...');
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_client_petitions', {
              p_client_id: user.uid
            });
            console.log('📊 Resultado RPC:', { data: rpcData, error: rpcError });
            if (!rpcError && rpcData) {
              setPetitions(rpcData as any);
              return;
            }
          }
        } else if (data) {
          console.log('✅ Petições encontradas:', data.length);
          setPetitions(data as any);
          return;
        }
        
        console.log('⚠️ Nenhuma petição encontrada');
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
    
    console.log('🔍 Petições aprovadas/concluídas:', allCompletedOrApproved);
    console.log('📅 Datas disponíveis:', allCompletedOrApproved.map(p => ({
      title: p.title,
      created_at: p.created_at,
      completed_at: p.completed_at,
      accepted_at: p.accepted_at,
      updated_at: (p as any).updated_at
    })));
    
    const completedPetitions = allCompletedOrApproved.filter(p => 
      (p.completed_at || p.accepted_at) && p.created_at
    );
    
    console.log('📊 Petições com datas válidas:', completedPetitions.length);
    
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
        console.log('⏱️ Tempo médio calculado (até hoje):', average);
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
    console.log('⏱️ Tempo médio calculado:', average);
    return average.toString();
  };

  const stats = {
    activePetitions: petitions.filter(p => {
      const status = p.status?.toUpperCase();
      return ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(status);
    }).length,
    // Considerar COMPLETED e APPROVED como concluídas (case-insensitive)
    completedThisMonth: petitions.filter(p => {
      const status = p.status?.toUpperCase();
      return status === 'COMPLETED' || status === 'APPROVED';
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo de volta, {user?.email}</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de uso de petições */}
        <PetitionUsageCard className="lg:col-span-1" />

        <Card className="bg-container-primary border-border flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Petições Ativas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-container-inner rounded-b-lg flex-1 flex flex-col justify-center">
            <div className="text-2xl font-bold">{stats.activePetitions}</div>
            <p className="text-xs text-muted-foreground">em andamento</p>
          </CardContent>
        </Card>

        <Card className="bg-container-secondary border-border flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-container-inner rounded-b-lg flex-1 flex flex-col justify-center">
            <div className="text-2xl font-bold">{stats.completedThisMonth}</div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Petições em tempo real */}
      <Card className="bg-container-secondary border-border">
        <CardHeader>
          <CardTitle>Suas Petições</CardTitle>
          <CardDescription>Últimas petições criadas</CardDescription>
        </CardHeader>
        <CardContent className="bg-container-inner rounded-b-lg">
          {petitions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma petição encontrada</h3>
              <p className="text-muted-foreground">Você ainda não criou nenhuma petição</p>
            </div>
          ) : (
            <div className="space-y-4">
              {petitions.slice(0, 5).map((petition) => (
                <div key={petition.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Badge variant={getStatusColor(petition.status) as any}>
                        {getStatusLabel(petition.status)}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{petition.title}</h4>
                      <p className="text-sm text-muted-foreground">{petition.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelected(petition)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
              {petitions.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={() => navigate('/client/petitions')}>
                    Ver todas as petições
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <Card className="bg-container-primary border-border">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription className="!max-w-none !overflow-visible !whitespace-normal">Acesso rápido às principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent className="bg-container-inner rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/client/chat')}
            >
              <MessageSquare className="h-6 w-6" />
              <span>Chat</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              <Badge variant={getStatusColor(selected?.status || '') as any} className="mr-2">
                {getStatusLabel(selected?.status || '')}
              </Badge>
              {selected?.priority && (
                <Badge variant={getPriorityColor(selected.priority) as any}>
                  {selected.priority}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Button onClick={() => {
                setSelected(null);
                navigate('/client/chat', { state: { petitionId: selected?.id } });
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
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
              Parabéns!
            </DialogTitle>
            
            <DialogDescription className="text-gray-600 mb-4">
              Seu plano foi ativado com sucesso!
            </DialogDescription>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-2">
                🎁 Bônus de Boas-vindas
              </h4>
              <p className="text-sm text-green-700">
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
    </div>
  );
}
