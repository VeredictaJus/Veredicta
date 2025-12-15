import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import StripeCheckout from '@/components/Payment/StripeCheckout';
import { PixPayment } from '@/components/payment/PixPayment';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { ClientProfile } from '@/types';
import { PlansService, Plan } from '@/services/plansService';
import { UserSettingsService, UserPlan } from '@/services/userSettingsService';
import { PixService } from '@/services/pixService';

export default function Plans() {
  const { user, loading } = useNewAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [currentUserPlan, setCurrentUserPlan] = useState<UserPlan | null>(null);
  const [hasUsedFreePlan, setHasUsedFreePlan] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    is_cancelled?: boolean;
    expires_at?: string;
    days_remaining?: number;
    can_reactivate?: boolean;
  }>({});
  const clientProfile = user as unknown as ClientProfile;

  // Estados para PIX
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'pix'>('card');
  const [pixData, setPixData] = useState<{
    pixCode: string;
    qrCodeImage: string;
    amount: number;
    expiresAt: number;
  } | null>(null);

  // Planos de fallback caso a tabela não exista ainda
  const fallbackPlans: Plan[] = [
    {
      id: 'fallback-0',
      name: 'Free',
      price: 0,
      petitions_included: 1,
      additional_credit_price: 150,
      features: [
        '1 petição gratuita',
        'Entrega em 3-5 dias úteis',
        '1 revisão gratuita',
        'Consulta com redator e chat incluso',
        'Validade: 7 dias',
        'Confidencialidade garantida (NDA)'
      ],
      is_active: true,
      recommended: false,
      description: 'Perfeito para testar nossa plataforma'
    },
    {
      id: 'fallback-1',
      name: 'Start',
      price: 520,
      petitions_included: 4,
      additional_credit_price: 130,
      features: [
        '4 petições incluídas',
        'Até 3 dias úteis por entrega',
        '1 revisão gratuita no pacote',
        'Consulta com redator e chat incluso',
        'Validade: 30 dias',
        'Confidencialidade garantida (NDA)'
      ],
      is_active: true,
      recommended: false,
      description: 'Ideal para testar ou resolver demandas pontuais'
    },
    {
      id: 'fallback-2',
      name: 'Professional',
      price: 1980,
      petitions_included: 15,
      additional_credit_price: 120,
      features: [
        '15 petições incluídas',
        'Até 2 dias úteis por entrega',
        '2 revisões gratuitas no pacote',
        'Consulta com redator e chat incluso',
        'Validade: 90 dias',
        'Confidencialidade garantida (NDA)',
        'Suporte prioritário'
      ],
      is_active: true,
      recommended: true,
      description: 'Ideal para escritórios em crescimento'
    },
    {
      id: 'fallback-3',
      name: 'Enterprise',
      price: 3960,
      petitions_included: 30,
      additional_credit_price: 110,
      features: [
        '30 petições incluídas',
        'Até 1 dia útil por entrega',
        '3 revisões gratuitas no pacote',
        'Consulta com redator e chat incluso',
        'Validade: 180 dias',
        'Confidencialidade garantida (NDA)',
        'Suporte prioritário',
        'Redator dedicado'
      ],
      is_active: true,
      recommended: false,
      description: 'Para escritórios com alta demanda'
    }
  ];
  
  // Carregar planos e plano atual do usuário de forma assíncrona
  useEffect(() => {
    const loadPlansAndUserData = async () => {
      if (!user?.uid) return;
      
      try {
        setLoadingPlans(true);
        console.log('🔄 Carregando planos e dados do usuário...');
        
        // Carregar planos, plano atual, uso, status da assinatura e verificação do plano Free em paralelo
        const [activePlans, userPlan, userUsage, subStatus, freePlanCheck] = await Promise.all([
          PlansService.getActivePlans(),
          UserSettingsService.getUserCurrentPlan(user.uid),
          UserSettingsService.getUserUsage(user.uid),
          UserSettingsService.getSubscriptionStatus(user.uid),
          UserSettingsService.checkFreePlanUsage(user.uid)
        ]);
        
        console.log('📋 Planos carregados:', activePlans);
        console.log('👤 Plano atual do usuário:', userPlan);
        console.log('📊 Uso atual do usuário:', userUsage);
        console.log('🎯 Status da assinatura:', subStatus);
        console.log('🆓 Verificação do plano Free:', freePlanCheck);
        
        // Definir planos
        if (activePlans.length === 0) {
          console.warn('⚠️ Nenhum plano ativo encontrado, usando fallback');
          setPlans(fallbackPlans);
        } else {
          console.log(`✅ ${activePlans.length} planos carregados com sucesso!`);
          setPlans(activePlans);
        }
        
        // Definir plano atual do usuário
        setCurrentUserPlan(userPlan);
        
        // Definir status da assinatura (cancelamento, dias restantes, etc.)
        setSubscriptionStatus({
          is_cancelled: subStatus.is_cancelled,
          expires_at: subStatus.expires_at,
          days_remaining: subStatus.days_remaining,
          can_reactivate: subStatus.can_reactivate
        });
        
        // Verificar se já usou o plano gratuito (baseado na nova função SQL)
        setHasUsedFreePlan(!freePlanCheck.can_use_free);
        
        console.log('🆓 Usuário pode usar plano Free:', freePlanCheck.can_use_free);
        console.log('🆓 Motivo:', freePlanCheck.reason);
        
      } catch (error) {
        console.error('❌ Error loading plans and user data:', error);
        console.log('🔄 Usando planos de fallback devido ao erro');
        setPlans(fallbackPlans);
        
        // Em caso de erro, assumir que não tem plano ativo (plano gratuito)
        setCurrentUserPlan(null);
        setHasUsedFreePlan(false);
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlansAndUserData();
  }, [user?.uid]);
  
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Funções auxiliares para determinar o tipo de botão
  const getPlanHierarchy = (planName: string): number => {
    const hierarchy = {
      'Free': 0,
      'Start': 1,
      'Pro': 2,
      'Professional': 2,
      'Enterprise': 3,
      'Elite': 3
    };
    return hierarchy[planName as keyof typeof hierarchy] ?? -1;
  };

  const getCurrentPlanName = (): string => {
    if (!currentUserPlan) return 'Free';
    return currentUserPlan.name;
  };

  const getButtonType = (plan: Plan): 'current' | 'upgrade' | 'downgrade' | 'select' => {
    const currentPlanName = getCurrentPlanName();
    const currentHierarchy = getPlanHierarchy(currentPlanName);
    const planHierarchy = getPlanHierarchy(plan.name);
    
    // Se é o plano atual
    if (plan.name === currentPlanName) {
      return 'current';
    }
    
    // Se é um plano maior (upgrade)
    if (planHierarchy > currentHierarchy) {
      return 'upgrade';
    }
    
    // Se é um plano menor (downgrade)
    if (planHierarchy < currentHierarchy) {
      return 'downgrade';
    }
    
    // Se é o mesmo nível (selecionar)
    return 'select';
  };

  const getButtonText = (plan: Plan): string => {
    const buttonType = getButtonType(plan);
    
    // Se é o plano atual e está cancelado, mostrar "Reativar Plano"
    if (buttonType === 'current' && subscriptionStatus.is_cancelled && subscriptionStatus.can_reactivate) {
      return 'Reativar Plano';
    }
    
    switch (buttonType) {
      case 'current':
        // Se é plano pago, mostrar "Cancelar Plano"
        if (plan.price > 0) {
          return 'Cancelar Plano';
        }
        // Se é plano Free, mostrar "Plano Atual"
        return 'Plano Atual';
      case 'upgrade':
        return 'Fazer Upgrade';
      case 'downgrade':
        return 'Fazer Downgrade';
      case 'select':
        return 'Escolher Plano';
      default:
        return 'Escolher Plano';
    }
  };

  const getButtonVariant = (plan: Plan): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const buttonType = getButtonType(plan);
    
    switch (buttonType) {
      case 'current':
        // Se é plano pago, usar variante destructive para "Cancelar Plano"
        if (plan.price > 0) {
          return 'destructive';
        }
        // Se é plano Free, usar secondary para "Plano Atual"
        return 'secondary';
      case 'upgrade':
        return 'default';
      case 'downgrade':
        return 'outline';
      case 'select':
        return 'default';
      default:
        return 'default';
    }
  };

  const isButtonDisabled = (plan: Plan): boolean => {
    const buttonType = getButtonType(plan);
    
    // Se é o plano atual, verificar se é pago ou gratuito
    if (buttonType === 'current') {
      // Se é plano pago, permitir cancelamento (não desabilitar)
      if (plan.price > 0) {
        return false;
      }
      // Se é plano Free, desabilitar
      return true;
    }
    
    // Se é o plano Free e já foi usado, desabilitar
    if (plan.name === 'Free' && hasUsedFreePlan) {
      return true;
    }
    
    return false;
  };

  // Função para cancelar plano com período de carência
  const handleCancelPlan = async (plan: Plan) => {
    if (!user?.uid) return;
    
    try {
      console.log('🔄 Cancelando plano:', plan.name);
      
      const result = await UserSettingsService.cancelPlanWithGracePeriod(user.uid, plan.name);
      
      if (result.success) {
        const daysRemaining = result.days_remaining || 0;
        toast.success(
          `Plano ${plan.name} cancelado! Você ainda pode usá-lo por mais ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}.`,
          { duration: 6000 }
        );
        
        // Recarregar dados do usuário
        const userPlan = await UserSettingsService.getUserCurrentPlan(user.uid);
        setCurrentUserPlan(userPlan);
      } else {
        toast.error(result.message || 'Erro ao cancelar plano. Tente novamente ou entre em contato com o suporte.');
      }
    } catch (error) {
      console.error('❌ Erro ao cancelar plano:', error);
      toast.error('Erro ao cancelar plano. Tente novamente ou entre em contato com o suporte.');
    }
  };

  // Função para reativar plano cancelado
  const handleReactivatePlan = async (plan: Plan) => {
    if (!user?.uid) return;
    
    try {
      console.log('🔄 Reativando plano:', plan.name);
      
      const result = await UserSettingsService.reactivateCancelledPlan(user.uid, plan.name);
      
      if (result.success) {
        toast.success(`Plano ${plan.name} reativado com sucesso! Sua assinatura continuará normalmente.`);
        
        // Recarregar dados do usuário
        const userPlan = await UserSettingsService.getUserCurrentPlan(user.uid);
        setCurrentUserPlan(userPlan);
      } else {
        toast.error(result.message || 'Erro ao reativar plano. Tente novamente ou entre em contato com o suporte.');
      }
    } catch (error) {
      console.error('❌ Erro ao reativar plano:', error);
      toast.error('Erro ao reativar plano. Tente novamente ou entre em contato com o suporte.');
    }
  };

  // Função para lidar com cliques nos botões
  const handlePlanButtonClick = (plan: Plan) => {
    const buttonType = getButtonType(plan);
    
    // Se é o plano atual e está cancelado, reativar
    if (buttonType === 'current' && subscriptionStatus.is_cancelled && subscriptionStatus.can_reactivate) {
      if (confirm(`Deseja reativar o plano ${plan.name}? Sua assinatura continuará normalmente.`)) {
        handleReactivatePlan(plan);
      }
      return;
    }
    
    if (buttonType === 'current' && plan.price > 0) {
      // Se é um plano pago atual, mostrar confirmação de cancelamento
      if (confirm(`Tem certeza que deseja cancelar o plano ${plan.name}? Você ainda poderá usá-lo até o final do período pago.`)) {
        handleCancelPlan(plan);
      }
    } else if (plan.name === 'Free') {
      // Lógica para plano Free
      if (hasUsedFreePlan) {
        toast.error('Você já utilizou sua petição gratuita com este CPF/CNPJ. Escolha um plano pago para continuar.');
      } else {
        toast.success('Plano Free ativado! Você pode criar sua primeira petição gratuita (válida por 7 dias).');
      }
    }
    // Para outros tipos de botão (upgrade, downgrade, select), a lógica já existe nos dialogs
  };

  // Removido loading bloqueante - planos carregam em background

  if (plans.length === 0) {
    return (
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Planos e Preços</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para o seu escritório. Todos os planos incluem acesso completo à plataforma e redatores especializados.
          </p>
        </div>
        
        {/* Mostrar planos de fallback */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative pt-10 ${plan.recommended ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${plan.name === 'Free' ? 'ring-2 ring-green-500 shadow-lg' : ''} ${getButtonType(plan) === 'current' ? 'ring-2 ring-orange-500 shadow-lg' : ''}`}>
              {getButtonType(plan) === 'current' && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-orange-500 text-white text-xs px-3 py-1 shadow-lg">
                    <Star className="h-3 w-3 mr-1" />
                    Plano Atual
                  </Badge>
                </div>
              )}
              {plan.recommended && getButtonType(plan) !== 'current' && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-blue-500 text-white text-xs px-3 py-1 shadow-lg">
                    <Star className="h-3 w-3 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              {plan.name === 'Free' && getButtonType(plan) !== 'current' && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-green-500 text-white text-xs px-3 py-1 shadow-lg">
                    <Star className="h-3 w-3 mr-1" />
                    Gratuito
                  </Badge>
                </div>
              )}
              
              {/* Badge de cancelamento pendente */}
              {getButtonType(plan) === 'current' && subscriptionStatus.is_cancelled && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-yellow-500 text-white text-xs px-3 py-1 shadow-lg">
                    ⚠️ Expira em {subscriptionStatus.days_remaining} {subscriptionStatus.days_remaining === 1 ? 'dia' : 'dias'}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-1 text-center">
                  <div className="text-3xl font-bold">
                    {plan.name === 'Free' ? 'Gratuito' : PlansService.formatPrice(plan.price)}
                  </div>
                  <div className="text-sm text-foreground/80">
                    {plan.name === 'Start' ? '/mês' : ''}
                  </div>
                  {plan.name === 'Free' && (
                    <div className="text-sm text-orange-600 font-medium">
                      ⚠️ Apenas 1 petição por CPF/CNPJ
                    </div>
                  )}
                </div>
                {plan.name !== 'Free' && (
                  <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                    <p className="text-xs text-orange-700 font-medium">
                      Valor por petição: R$ {plan.additional_credit_price},00
                    </p>
                    {plan.name === 'Elite' && (
                      <p className="text-xs text-green-600 font-medium">
                        💰 Melhor custo-benefício: R$ 100,00 por petição
                      </p>
                    )}
                    {plan.name === 'Pro' && (
                      <p className="text-xs text-green-600 font-medium">
                        💰 Economia de R$ 10,00 por petição
                      </p>
                    )}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.name === 'Free' ? (
                  <Button
                    className="w-full"
                    variant={getButtonVariant(plan)}
                    disabled={isButtonDisabled(plan)}
                    onClick={() => handlePlanButtonClick(plan)}
                  >
                    {getButtonText(plan)}
                  </Button>
                ) : (
                  getButtonType(plan) === 'current' ? (
                    <Button 
                      className="w-full"
                      variant={getButtonVariant(plan)}
                      disabled={isButtonDisabled(plan)}
                      onClick={() => handlePlanButtonClick(plan)}
                    >
                      {getButtonText(plan)}
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                          className="w-full"
                          variant={getButtonVariant(plan)}
                          disabled={isButtonDisabled(plan)}
                      >
                          {getButtonText(plan)}
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="!text-gray-900 dark:!text-white font-semibold">Assinar Plano {plan.name}</DialogTitle>
                      <DialogDescription className="!text-gray-700 dark:!text-gray-300">
                        Complete o pagamento para ativar sua assinatura
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center">
                      <StripeCheckout
                        planId={plan.name.toLowerCase() as any}
                        planName={plan.name}
                        price={plan.price}
                        type="plan"
                        features={plan.features}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                  )
                )}
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    );
  }

  const handleSelectPlan = (plan: Plan) => {
    if (plan.name === 'Enterprise' || plan.price === 0) {
      toast.info('Entre em contato conosco para um orçamento personalizado');
    } else {
      toast.success('Plano selecionado! Você será redirecionado para o pagamento.');
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {loadingPlans ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando planos...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Planos e Preços</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o seu escritório. Todos os planos incluem acesso completo à plataforma e redatores especializados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative pt-10 ${plan.recommended ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${plan.name === 'Free' ? 'ring-2 ring-green-500 shadow-lg' : ''} ${getButtonType(plan) === 'current' ? 'ring-2 ring-orange-500 shadow-lg' : ''}`}>
            {getButtonType(plan) === 'current' && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                <Badge className="bg-orange-500 text-white text-xs px-3 py-1 shadow-lg">
                  <Star className="h-3 w-3 mr-1" />
                  Plano Atual
                </Badge>
              </div>
            )}
            {plan.recommended && getButtonType(plan) !== 'current' && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                <Badge className="bg-blue-500 text-white text-xs px-3 py-1 shadow-lg">
                  <Star className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}
            {plan.name === 'Free' && getButtonType(plan) !== 'current' && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                <Badge className="bg-green-500 text-white text-xs px-3 py-1 shadow-lg">
                  <Star className="h-3 w-3 mr-1" />
                  Gratuito
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="space-y-1">
                <div className="text-3xl font-bold">
                  {plan.name === 'Free' ? 'Gratuito' : plan.price > 0 ? PlansService.formatPrice(plan.price) : 'Sob consulta'}
                </div>
                <div className="text-sm text-foreground/80">
                  {plan.name === 'Start' ? '/mês' : ''}
                </div>
              </div>
              {plan.name === 'Free' && (
                <div className="text-sm text-orange-600 font-medium text-center">
                  ⚠️ Uma vez por CPF ou CNPJ
                </div>
              )}
              {plan.name !== 'Free' && (
                <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-700 font-medium">
                    Valor por petição: R$ {plan.additional_credit_price || 220},00
                  </p>
                  {plan.name === 'Elite' && (
                    <p className="text-xs text-green-600 font-medium">
                      💰 Melhor custo-benefício: R$ 100,00 por petição
                    </p>
                  )}
                  {plan.name === 'Pro' && (
                    <p className="text-xs text-green-600 font-medium">
                      💰 Economia de R$ 10,00 por petição
                    </p>
                  )}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.name === 'Free' ? (
                <Button
                  className="w-full"
                  variant={getButtonVariant(plan)}
                  disabled={isButtonDisabled(plan)}
                  onClick={() => handlePlanButtonClick(plan)}
                >
                  {getButtonText(plan)}
                </Button>
              ) : plan.price > 0 ? (
                getButtonType(plan) === 'current' ? (
                  <Button 
                    className="w-full"
                    variant={getButtonVariant(plan)}
                    disabled={isButtonDisabled(plan)}
                    onClick={() => handlePlanButtonClick(plan)}
                  >
                    {getButtonText(plan)}
                  </Button>
                ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                        className="w-full"
                        variant={getButtonVariant(plan)}
                        disabled={isButtonDisabled(plan)}
                    >
                        {getButtonText(plan)}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="!text-gray-900 dark:!text-white font-semibold">Assinar Plano {plan.name}</DialogTitle>
                      <DialogDescription className="!text-gray-700 dark:!text-gray-300">
                        Complete o pagamento para ativar sua assinatura
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center">
                      <StripeCheckout
                        planId={plan.name.toLowerCase() as any}
                        planName={plan.name}
                        price={plan.price}
                        type="plan"
                        features={plan.features}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                )
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full"
                >
                  Solicitar Orçamento
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
          </div>
        </>
      )}
    </div>
  );
}