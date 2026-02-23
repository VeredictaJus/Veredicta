import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Star, CreditCard, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { ClientProfile } from '@/types';
import { PlansService, Plan } from '@/services/plansService';
import { UserSettingsService, UserPlan } from '@/services/userSettingsService';
import { cn } from '@/lib/utils';
// Stripe será carregado apenas quando necessário (não precisa aqui)

export default function Plans() {
  const { user, loading } = useNewAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [currentUserPlan, setCurrentUserPlan] = useState<UserPlan | null>(null);
  const [hasUsedFreePlan, setHasUsedFreePlan] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    is_cancelled?: boolean;
    expires_at?: string;
    days_remaining?: number;
    can_reactivate?: boolean;
  }>({});
  const clientProfile = user as unknown as ClientProfile;

  // ✅ CORREÇÃO: Função que sempre calcula dinamicamente (não memoiza)
  // Isso garante que a URL seja sempre recalculada corretamente
  const getApiEndpoint = useCallback(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    const isVeredictaDomain = hostname.includes('veredictajus.com.br');
    
    // Priorizar sempre a URL do backend definida explicitamente
    if (API_URL && API_URL.trim() !== '') {
      const endpoint = `${API_URL.replace(/\/$/, '')}/api/stripe/create-checkout-session`;
      console.log('✅ [API Endpoint] Usando VITE_API_URL:', endpoint);
      return endpoint;
    }
    
    // ✅ CORREÇÃO CRÍTICA: Se estiver no domínio de produção, SEMPRE usar api.veredictajus.com.br
    // Verificar tanto www.veredictajus.com.br quanto veredictajus.com.br
    if (isVeredictaDomain || hostname === 'www.veredictajus.com.br' || hostname === 'veredictajus.com.br') {
      const endpoint = 'https://api.veredictajus.com.br/api/stripe/create-checkout-session';
      console.log('✅ [API Endpoint] Usando domínio de produção:', endpoint, '(hostname:', hostname, ')');
      return endpoint;
    }
    
    // Localhost usa rota relativa (vite-plugin-api-routes)
    if (isLocalhost) {
      const endpoint = '/api/stripe/create-checkout-session';
      console.log('✅ [API Endpoint] Usando rota localhost:', endpoint);
      return endpoint;
    }
    
    // Fallback para desenvolvimento
    const endpoint = `${window.location.protocol}//${hostname}:3001/api/stripe/create-checkout-session`;
    console.log('⚠️ [API Endpoint] Usando fallback:', endpoint);
    return endpoint;
  }, []);

  // Detectar plano desejado da URL
  const urlParams = new URLSearchParams(window.location.search);
  const desiredPlan = urlParams.get('plan');

  // Planos de fallback caso a tabela não exista ainda
  const fallbackPlans: Plan[] = [
    {
      id: 'fallback-0',
      name: 'Gratuito',
      price: 0,
      petitions_included: 1,
            is_active: true,
      features: [
        '1 petição gratuita',
        'Entrega em 3-5 dias úteis',
        '1 revisão gratuita',
        'Suporte por email'
      ],
      recommended: false
    },
    {
      id: 'fallback-1',
      name: 'Start',
      price: 97,
      petitions_included: 3,
      additional_credit_price: 150,
      is_active: true,
      features: [
        '3 petições incluídas',
        'Entrega em 2-3 dias úteis',
        '2 revisões gratuitas',
        'Suporte prioritário',
        'Acesso a templates exclusivos'
      ],
      recommended: false
    },
    {
      id: 'fallback-2',
      name: 'Pro',
      price: 197,
      petitions_included: 8,
      additional_credit_price: 150,
      is_active: true,
      features: [
        '8 petições incluídas',
        'Entrega em 1-2 dias úteis',
        '3 revisões gratuitas',
        'Suporte prioritário',
        'Acesso a templates exclusivos',
        'Consultoria jurídica básica'
      ],
      recommended: true
    },
    {
      id: 'fallback-3',
      name: 'Elite',
      price: 397,
      petitions_included: 20,
      additional_credit_price: 150,
      is_active: true,
      features: [
        '20 petições incluídas',
        'Entrega em 24 horas',
        'Revisões ilimitadas',
        'Suporte prioritário 24/7',
        'Acesso a templates exclusivos',
        'Consultoria jurídica completa',
        'Análise de documentos'
      ],
      recommended: false
    }
  ];

  useEffect(() => {
    const loadPlans = async () => {
      setLoadingPlans(true);
      try {
        // ✅ Usar getActivePlans() para buscar apenas planos ativos
        const plansData = await PlansService.getActivePlans();
        // Concierge é um plano interno (não exibir na página de planos)
        setPlans((plansData || []).filter((p) => (p.plan_code || '').toLowerCase() !== 'concierge'));
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        setPlans(fallbackPlans);
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
  }, []);

  // Mostrar toast do plano desejado
  useEffect(() => {
    if (desiredPlan) {
      const planNames: { [key: string]: string } = {
        'test': 'Teste',
        'free': 'Gratuito',
        'start': 'Start',
        'pro': 'Pro',
        'elite': 'Elite'
      };
      
      const planName = planNames[desiredPlan] || desiredPlan;
      toast.info(`🎯 Plano ${planName} selecionado! Escolha este plano para continuar.`);
    }
  }, [desiredPlan]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;

      try {
        // Carregar plano atual do usuário
        const userPlan = await UserSettingsService.getUserCurrentPlan(user.uid);
        setCurrentUserPlan(userPlan);

        // Verificar se já usou o plano gratuito
        const freePlanUsage = await UserSettingsService.checkFreePlanUsage(user.uid);
        setHasUsedFreePlan(freePlanUsage.can_use_free);

        // Carregar status da assinatura
        const status = await UserSettingsService.getSubscriptionStatus(user.uid);
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    loadUserData();
  }, [user?.uid]);
  
  const getButtonType = (plan: Plan) => {
    if (!currentUserPlan) {
      return 'subscribe';
    }
    
    // Verificar se é o plano atual (considerando diferentes nomes para Free)
    const isCurrentPlan = currentUserPlan.plan_code === plan.name.toLowerCase() || 
                         (currentUserPlan.plan_code === 'free' && (plan.name === 'Gratuito' || plan.name === 'Free'));
    
    if (isCurrentPlan) return 'current';
    if (plan.name === 'Gratuito' && hasUsedFreePlan) return 'used';
    return 'subscribe';
  };

  const getButtonText = (plan: Plan) => {
    const buttonType = getButtonType(plan);
    switch (buttonType) {
      case 'current':
        return subscriptionStatus.is_cancelled ? 'Reativar Assinatura' : 'Plano Atual';
      case 'used':
        return 'Já Utilizado';
      case 'subscribe':
        return plan.name === 'Gratuito' ? 'Começar Grátis' : 'Assinar Agora';
      default:
        return 'Assinar Agora';
    }
  };

  const getButtonVariant = (plan: Plan) => {
    const buttonType = getButtonType(plan);
    switch (buttonType) {
      case 'current':
        return 'secondary';
      case 'used':
        return 'outline';
      case 'subscribe':
        return 'default';
      default:
        return 'default';
    }
  };

  const isButtonDisabled = (plan: Plan) => {
    const buttonType = getButtonType(plan);
    return buttonType === 'used' || (buttonType === 'current' && !subscriptionStatus.is_cancelled);
  };

  const handleReactivateSubscription = async () => {
    if (!user?.uid) return;
    
    try {
      await UserSettingsService.reactivateCancelledPlan(user.uid, currentUserPlan?.plan_code || '');
      toast.success('Assinatura reativada com sucesso!');
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao reativar assinatura. Tente novamente.');
      console.error('Erro ao reativar:', error);
    }
  };

  const handleSubscribe = useCallback(async (plan: Plan) => {
    if (!user?.uid) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (plan.name === 'Gratuito') {
      // Para plano gratuito, apenas mostrar mensagem
      toast.info('Plano gratuito ativado! Você pode começar a usar a plataforma.');
      return;
    }

    setIsProcessingPayment(plan.id);
    
    try {
      // Criar sessão de checkout usando o endpoint correto
      const planCode = (plan.plan_code || plan.name.toLowerCase()).toLowerCase();
      const includeFreeBonus = planCode === 'start' || planCode === 'pro' || planCode === 'elite';
      
      // Validar dados antes de enviar
      if (!planCode) {
        console.error('❌ [Frontend] Nome do plano não encontrado:', plan);
        toast.error('Erro: Nome do plano não encontrado');
        setIsProcessingPayment(null);
        return;
      }
      
      if (!user?.uid) {
        console.error('❌ [Frontend] User ID não encontrado');
        toast.error('Erro: Usuário não autenticado');
        setIsProcessingPayment(null);
        return;
      }
      
      const requestBody = {
        plan: planCode,
        include_free_bonus: includeFreeBonus,
        user_id: user.uid,
      };
      
      // Adicionar timeout de 15 segundos (otimizado)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Timeout na requisição');
        controller.abort();
      }, 15000);
      
      // ✅ CORREÇÃO: Sempre calcular a URL dinamicamente antes de fazer a requisição
      const apiEndpoint = getApiEndpoint();
      console.log('🔍 [Checkout] Usando endpoint:', apiEndpoint);
      
      let response: Response;
      try {
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        console.error('❌ Erro no fetch:', fetchError);
        if (fetchError.name === 'AbortError') {
          toast.error('Tempo de espera esgotado. Verifique sua conexão e tente novamente.');
          setIsProcessingPayment(null);
          return;
        }
        if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('ERR_CONNECTION_REFUSED')) {
          toast.error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
        } else {
          toast.error(`Erro de conexão: ${fetchError.message || 'Erro desconhecido'}`);
        }
        setIsProcessingPayment(null);
        return;
      }

      if (!response.ok) {
        // Mensagens de erro mais específicas
        let errorMessage = `Erro ao criar sessão de pagamento (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Ignorar erro ao parsear JSON
        }
        console.error('❌ Erro ao criar sessão:', response.status, errorMessage);
        
        if (response.status === 400) {
          toast.error(`Erro de validação: ${errorMessage}. Verifique o console para detalhes.`);
        } else if (response.status === 404) {
          toast.error('Servidor de pagamento não encontrado. Verifique se o backend está configurado corretamente.');
        } else if (response.status === 500) {
          toast.error('Erro interno do servidor. Tente novamente em alguns instantes.');
        } else {
          toast.error(errorMessage);
        }
        setIsProcessingPayment(null);
        return;
      }

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ Erro ao parsear resposta:', parseError);
        toast.error('Erro ao processar resposta do servidor.');
        setIsProcessingPayment(null);
        return;
      }

      if (data.url) {
        // Redirecionar para checkout do Stripe
        window.location.href = data.url;
        // Não resetar isProcessingPayment aqui pois vamos redirecionar
      } else if (data.error) {
        toast.error(data.error || 'Erro ao criar sessão de pagamento');
        setIsProcessingPayment(null);
      } else {
        toast.error('Erro ao criar sessão de pagamento. Resposta inesperada do servidor.');
        setIsProcessingPayment(null);
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      const errorMessage = error.message || 'Erro ao processar pagamento. Tente novamente.';
      toast.error(errorMessage);
      setIsProcessingPayment(null);
    }
  }, [user?.uid, getApiEndpoint]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {loadingPlans ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando planos...</p>
          </div>
        </div>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-background to-muted/30 p-6 sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(249,115,22,0.16),transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_10%,rgba(249,115,22,0.22),transparent_55%)]"
            />
            <div className="relative">
              <div className="text-center space-y-3">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Planos e preços
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Escolha o plano ideal para o seu escritório. Todos os planos incluem acesso completo à plataforma e redatores especializados.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10 max-w-7xl mx-auto items-stretch">
                {plans.map((plan) => {
                  const buttonType = getButtonType(plan);
                  const isCurrent = buttonType === 'current';
                  const isRecommended = !!plan.recommended && !isCurrent;
                  const isFree = plan.name === 'Gratuito' || plan.name === 'Free';
                  const isFeatured = isCurrent || isRecommended;

                  return (
                    <Card
                      key={plan.id}
                      className={cn(
                        'relative h-full flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/60 shadow-sm',
                        'backdrop-blur supports-[backdrop-filter]:bg-background/50',
                        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 motion-reduce:transform-none',
                        isFeatured ? 'ring-1 ring-primary/25 shadow-[0_20px_60px_rgba(249,115,22,0.12)]' : '',
                        isCurrent ? 'ring-primary/30' : '',
                        isFree ? 'opacity-[0.98]' : ''
                      )}
                    >
                      {/* Badges */}
                      {isCurrent && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                          <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs px-3 py-1 shadow-sm backdrop-blur">
                            <Star className="h-3 w-3 mr-1" />
                            Plano atual
                          </Badge>
                        </div>
                      )}
                      {isRecommended && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                          <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs px-3 py-1 shadow-sm backdrop-blur">
                            <Star className="h-3 w-3 mr-1" />
                            Mais popular
                          </Badge>
                        </div>
                      )}
                      {isCurrent && subscriptionStatus.is_cancelled && (
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20">
                          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-200 border border-amber-500/25 text-xs px-3 py-1 shadow-sm backdrop-blur">
                            ⚠️ Expira em {subscriptionStatus.days_remaining} {subscriptionStatus.days_remaining === 1 ? 'dia' : 'dias'}
                          </Badge>
                        </div>
                      )}

                      <CardHeader className={cn('text-center relative', isFeatured ? 'pt-12' : 'pt-10')}>
                        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                          {plan.name}
                        </CardTitle>
                        <div className="mt-4 space-y-1">
                          <div className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
                            {isFree ? 'R$ 0' : PlansService.formatPrice(plan.price)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {plan.name === 'Start' || plan.name === 'Pro' || plan.name === 'Elite' ? '/mês' : ''}
                          </div>
                          {isFree && (
                            <div className="text-xs text-primary font-medium">
                              ⚠️ Apenas 1 petição por CPF/CNPJ
                            </div>
                          )}
                        </div>

                        <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2">
                          <div className="text-sm font-semibold text-foreground">
                            {plan.petitions_included} petições incluídas
                          </div>
                          {!isFree && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Valor por petição: {PlansService.formatPrice(plan.additional_credit_price)}
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="flex flex-1 flex-col gap-6 pt-2">
                        <ul className="space-y-2.5 flex-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span className="text-foreground/90">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-1">
                          {isCurrent && subscriptionStatus.is_cancelled ? (
                            <Button
                              onClick={handleReactivateSubscription}
                              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.16)]"
                            >
                              {getButtonText(plan)}
                            </Button>
                          ) : (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant={getButtonVariant(plan)}
                                  disabled={isButtonDisabled(plan)}
                                  className={cn(
                                    'w-full',
                                    buttonType === 'subscribe' && !isFree
                                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.16)]'
                                      : '',
                                    buttonType === 'subscribe' && isFree
                                      ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15'
                                      : ''
                                  )}
                                >
                                  {getButtonText(plan)}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg rounded-2xl border border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                                <DialogHeader>
                                  <DialogTitle className="text-foreground font-semibold">
                                    Assinar plano {plan.name}
                                  </DialogTitle>
                                  <DialogDescription className="text-muted-foreground">
                                    Complete o pagamento para ativar sua assinatura
                                  </DialogDescription>
                                </DialogHeader>

                                {/* Interface de pagamento com cartão */}
                                <div className="space-y-6">
                                  <div className="text-center space-y-2">
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                      <CreditCard className="h-6 w-6 text-primary" />
                                      <h3 className="text-lg font-semibold text-foreground">Pagamento seguro</h3>
                                    </div>
                                    <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                                      <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground mb-1">
                                        {PlansService.formatPrice(plan.price)}
                                      </p>
                                      <p className="text-sm text-muted-foreground">por mês</p>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-foreground">O que está incluído</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm text-foreground/90">
                                          {plan.petitions_included} petições incluídas
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm text-foreground/90">
                                          Entrega em {plan.name === 'Elite' ? '1 dia útil' : plan.name === 'Pro' ? '1-2 dias úteis' : '2-3 dias úteis'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm text-foreground/90">Suporte prioritário</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm text-foreground/90">
                                          Validade: {plan.name === 'Start' ? '30 dias' : plan.name === 'Pro' ? '60 dias' : '90 dias'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="rounded-xl border border-border/60 bg-muted/40 p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                      <span className="text-sm font-medium text-foreground">Pagamento 100% seguro</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                                      <span className="text-sm text-muted-foreground">Processamento instantâneo</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Você será redirecionado para o checkout seguro do Stripe, processado pela Stripe Inc.
                                    </p>
                                  </div>

                                  <Button
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={isButtonDisabled(plan) || isProcessingPayment === plan.id}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(249,115,22,0.16)]"
                                  >
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    {isProcessingPayment === plan.id
                                      ? 'Processando...'
                                      : isButtonDisabled(plan)
                                        ? 'Plano atual'
                                        : 'Assinar agora com cartão'}
                                  </Button>

                                  {isProcessingPayment === plan.id && (
                                    <Button
                                      onClick={() => {
                                        setIsProcessingPayment(null);
                                        toast.info('Processamento cancelado');
                                      }}
                                      variant="outline"
                                      className="w-full"
                                    >
                                      Cancelar
                                    </Button>
                                  )}

                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">
                                      Ao continuar, você concorda com nossos{' '}
                                      <a href="#" className="text-primary hover:underline">Termos de Uso</a>
                                      {' '}e{' '}
                                      <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}