import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Crown, Star, Zap, Plus, RefreshCw } from 'lucide-react';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { UserSettingsService } from '@/services/userSettingsService';

interface PetitionUsageCardProps {
  className?: string;
}

const planIcons = {
  free: AlertTriangle,
  start: Star,
  pro: Crown,
  elite: Zap,
  concierge: Star,
};

const planColors = {
  free: 'text-muted-foreground',
  start: 'text-sky-600 dark:text-sky-300',
  pro: 'text-violet-600 dark:text-violet-300',
  elite: 'text-orange-600 dark:text-orange-300',
  concierge: 'text-orange-600 dark:text-orange-300',
};

const planNames = {
  free: 'Gratuito',
  start: 'Start',
  pro: 'Pro',
  elite: 'Elite',
  concierge: 'Acesso Concierge',
};

interface UsageStats {
  plan_info: {
    plan_code: string;
    plan_name: string;
    base_limit: number;
    bonus: number;
    total_limit: number;
    has_active_plan: boolean;
  };
  period_usage: number;
  total_usage: number;
  credits_balance: number;
  period_remaining: number;
  validity_days: number;
}

// Função auxiliar para remover caracteres de controle do UID
const cleanUid = (uid: string): string => {
  return uid.trim().replace(/\0/g, '').replace(
    // eslint-disable-next-line no-control-regex
    /[\u0000-\u001F\u007F]/g, 
    ''
  );
};

export const PetitionUsageCard: React.FC<PetitionUsageCardProps> = ({ className }) => {
  const { user } = useNewAuth();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsageStats = React.useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      
      // Buscar plano atual do usuário
      const userPlan = await UserSettingsService.getUserCurrentPlan(user.uid);
      
      // Buscar data de início do plano atual (quando a assinatura foi criada/atualizada)
      let planStartDate: Date | null = null;
      if (userPlan?.next_billing_date) {
        // Se tem next_billing_date, calcular a data de início do ciclo atual
        // (geralmente 30 dias antes do próximo billing)
        const billingDate = new Date(userPlan.next_billing_date);
        planStartDate = new Date(billingDate.getTime() - (30 * 24 * 60 * 60 * 1000));
      }
      
      // Para plano gratuito, contar TODAS as petições (sem filtro de data)
      // Para planos pagos, contar apenas petições do ciclo atual
      const planCodeLower = String(userPlan?.plan_code || '').toLowerCase();
      const isFreePlan = !userPlan || planCodeLower === 'free';
      const isConcierge = planCodeLower === 'concierge';
      
      // Concierge não tem ciclo mensal; contar total (sem filtro de data)
      if (!isFreePlan && !isConcierge) {
        // Buscar assinatura para pegar a data exata de início (apenas para planos pagos)
        const { data: subscription } = await supabase
          .rpc('get_user_subscription', { p_user_id: user.uid })
          .maybeSingle();
        
        if (subscription?.created_at || subscription?.updated_at) {
          // Usar a data mais recente entre created_at e updated_at
          const subDate = subscription.updated_at || subscription.created_at;
          if (subDate) {
            planStartDate = new Date(subDate);
          }
        }
      }
      
      
      // Contar petições
      const cleanedUid = cleanUid(user.uid);
      let query = supabase
        .from('petitions')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', cleanedUid);
      
      // Se tem data de início do plano E não é plano gratuito, filtrar apenas petições criadas após essa data
      if (planStartDate && !isFreePlan && !isConcierge) {
        query = query.gte('created_at', planStartDate.toISOString());
      }
      // Para plano gratuito, não filtrar por data - contar TODAS as petições
      
      const { count, error } = await query;
      
      const petitionCount = count || 0;
      
      // Usar plano do usuário ou fallback para gratuito
      const planCode = planCodeLower || 'free';
      const planName = userPlan?.name || (planCode === 'concierge' ? 'Acesso Concierge' : 'Gratuito');
      const limit = planCode === 'concierge' ? 1 : (userPlan?.petitions_limit || 1);
      const hasActivePlan = !!userPlan && planCode !== 'free';
      
      // Calcular restantes: limite total - petições usadas no período do plano
      const remaining = Math.max(0, limit - petitionCount);
      
      const stats = {
        plan_info: {
          plan_code: planCode,
          plan_name: planName,
          base_limit: limit,
          bonus: 0,
          total_limit: limit,
          has_active_plan: hasActivePlan
        },
        period_usage: petitionCount,
        total_usage: petitionCount,
        credits_balance: 0,
        period_remaining: remaining,
        // Concierge e Free são "total" (sem ciclo)
        validity_days: planCode === 'concierge' || planCode === 'free' ? 0 : 30
      };
      
      setUsageStats(stats);
    } catch (error) {
      console.error('❌ PetitionUsageCard: Erro ao buscar estatísticas de uso:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    
    fetchUsageStats();

    // Escutar mudanças em tempo real nas petições
    const cleanedUid = cleanUid(user.uid);
    const channel = supabase
      .channel(`petition-usage-updates-${cleanedUid}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'petitions',
        filter: `client_id=eq.${cleanUid}`
      }, (payload) => {
        // Aguardar um pouco para garantir que a mudança foi persistida
        setTimeout(() => {
          fetchUsageStats();
        }, 500);
      })
      .subscribe((status) => {
      });

    // Escutar evento customizado de atualização de plano
  const handlePlanUpdate = () => {
    fetchUsageStats();
    };
    window.addEventListener('planUpdated', handlePlanUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('planUpdated', handlePlanUpdate);
    };
  }, [user?.uid, fetchUsageStats]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-2 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageStats) {
    return null;
  }

  const { plan_info, period_usage, period_remaining, validity_days } = usageStats;
  const { plan_code, plan_name, total_limit } = plan_info;
  
  const usagePercentage = total_limit > 0 ? (period_usage / total_limit) * 100 : 0;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  const IconComponent = planIcons[plan_code as keyof typeof planIcons] || AlertTriangle;
  const planColor = planColors[plan_code as keyof typeof planColors] || 'text-muted-foreground';
  const planDisplayName = planNames[plan_code as keyof typeof planNames] || 'Desconhecido';

  const getValidityText = () => {
    if (plan_code === 'free' || plan_code === 'concierge') return 'total';
    if (validity_days === 30) return '30 dias';
    if (validity_days === 60) return '60 dias';
    if (validity_days === 90) return '90 dias';
    return 'período';
  };

  const getStatusColor = () => {
    if (isAtLimit) return 'text-rose-600 dark:text-rose-300';
    if (isNearLimit) return 'text-orange-600 dark:text-orange-300';
    return 'text-emerald-600 dark:text-emerald-300';
  };

  const getStatusText = () => {
    if (isAtLimit) return 'Limite atingido';
    if (isNearLimit) return 'Próximo do limite';
    return 'Uso normal';
  };

  const getProgressColor = () => {
    if (isAtLimit) return '[&>div]:bg-rose-500';
    if (isNearLimit) return '[&>div]:bg-orange-500';
    return '[&>div]:bg-emerald-500';
  };

  return (
    <Card
      glowDot
      className={[
        className,
        'rounded-2xl border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 motion-reduce:transform-none',
        isAtLimit
          ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30'
          : isNearLimit
            ? 'border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/30'
            : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${planColor}`} />
            Uso de Petições
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUsageStats}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plano atual */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Plano atual</p>
            <p className="font-semibold">{planDisplayName}</p>
          </div>
          <Badge variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'default'}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Uso ({getValidityText()})</span>
            <span className={getStatusColor()}>
              {period_usage} / {total_limit}
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className={`h-2 ${getProgressColor()}`}
          />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Restantes</p>
            <p className={`font-semibold ${getStatusColor()}`}>
              {period_remaining}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Validade</p>
            <p className="font-semibold">
              {getValidityText()}
            </p>
          </div>
        </div>

        {/* Ações */}
        {isAtLimit && (
          <div className="pt-2 border-t">
            <p className="text-sm text-red-600 mb-3">
              Você atingiu o limite de petições. Assine um plano para continuar.
            </p>
            <Button size="sm" className="w-full" onClick={() => navigate('/client/plans')}>
              <Plus className="h-4 w-4 mr-2" />
              Ver Planos
            </Button>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="pt-2 border-t">
            <p className="text-sm text-orange-600 mb-3">
              Você está próximo do limite. Considere fazer upgrade do seu plano.
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/client/plans')}>
              Ver Planos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
