import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, CheckCircle, Star } from 'lucide-react';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import Logo from '@/components/ui/Logo';

// Mapeamento dos planos
const PLAN_DETAILS = {
  start: {
    name: 'Start',
    price: 'R$ 520',
    period: 'a cada 30 dias',
    petitions: 4,
    features: [
      '4 petições incluídas',
      'Até 3 dias úteis por entrega',
      '1 revisão gratuita no pacote',
      'Consulta com redator e chat incluso',
      'Validade: 30 dias',
      'Confidencialidade garantida (NDA)'
    ]
  },
  pro: {
    name: 'Pro',
    price: 'R$ 1.680',
    period: 'a cada 60 dias',
    petitions: 14,
    features: [
      '14 petições incluídas',
      'Entregas em até 2 dias úteis',
      '1 revisão gratuita por petição',
      'Consulta com redator e chat incluso',
      '+1 petição bônus na renovação',
      'Validade: 60 dias',
      'Confidencialidade garantida (NDA)'
    ]
  },
  elite: {
    name: 'Elite',
    price: 'R$ 7.000',
    period: 'a cada 90 dias',
    petitions: 70,
    features: [
      '70 petições incluídas',
      'Entrega em até 1 dia útil (prioridade máxima)',
      '1 revisão gratuita por petição',
      'Revisão extra por advogado sênior (opcional)',
      'Consulta direta com redator via plataforma',
      '+3 petições bônus na renovação',
      'Acesso antecipado a novos recursos',
      'Validade: 90 dias',
      'Confidencialidade garantida (NDA)'
    ]
  }
};

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useNewAuth();
  const { disableSidebar, enableSidebar } = useSidebar();
  const [isLoading, setIsLoading] = useState(false);
  
  const planId = searchParams.get('plan');
  const isNewUser = searchParams.get('new_user') === 'true';
  const planDetails = planId ? PLAN_DETAILS[planId as keyof typeof PLAN_DETAILS] : null;

  useEffect(() => {
    // Desabilitar sidebar quando entrar na página de checkout
    disableSidebar('Finalizando pagamento...');

    // Verificar se veio da landing page
    const fromLanding = searchParams.get('from_landing') === 'true';
    const isNewUser = searchParams.get('new_user') === 'true';
    
    if (!fromLanding && !isNewUser) {
      // Se não veio da landing page, redirecionar para planos normais
      enableSidebar();
      navigate('/client/plans');
      return;
    }

    if (!planId || !planDetails) {
      toast.error('Plano não encontrado');
      enableSidebar();
      navigate('/client/plans');
      return;
    }

    if (!user) {
      toast.error('Você precisa estar logado para continuar');
      enableSidebar();
      navigate('/auth/login');
      return;
    }

    // NÃO iniciar checkout automaticamente - deixar usuário clicar no botão
    // handleStripeCheckout();

    // Cleanup: habilitar sidebar quando sair da página
    return () => {
      enableSidebar();
    };
  }, [planId, planDetails, user, searchParams, disableSidebar, enableSidebar, navigate]);

  const handleStripeCheckout = async () => {
    if (!planId) return;

    setIsLoading(true);
    try {
      
      // ✅ CORREÇÃO: URL da API com detecção automática de ambiente
      const getApiUrl = () => {
        const API_URL = import.meta.env.VITE_API_URL;
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
        const isVeredictaDomain = hostname.includes('veredictajus.com.br');
        
        if (API_URL) {
          return API_URL;
        } else if (isVeredictaDomain) {
          return 'https://api.veredictajus.com.br';
        } else if (isLocalhost) {
          return 'http://localhost:3001';
        } else {
          return `${window.location.protocol}//${hostname}:3001`;
        }
      };
      
      const API_URL = getApiUrl();
      console.log('✅ [Checkout] URL da API:', `${API_URL}/api/stripe/create-checkout-session`);
      
      // Fazer requisição ao backend
      const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          plan: planId,
          include_free_bonus: isNewUser,
          user_id: user.uid
        })
      });
      
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar sessão de pagamento');
      }
      
      const { url } = await response.json();
      
      // Redirecionar para o Stripe
      window.location.href = url;
      
    } catch (error) {
      console.error('💥 Erro no checkout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar pagamento. Tente novamente.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    enableSidebar();
    navigate('/client/plans');
  };

  if (!planDetails) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Plano não encontrado</h1>
          <Button onClick={handleBack}>Voltar aos Planos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4 min-w-0">
          <Button variant="ghost" onClick={handleBack} className="p-2 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground">Finalizar Assinatura</h1>
            <p className="text-muted-foreground">Complete seu pagamento para ativar o plano</p>
          </div>
        </div>
        <Logo className="h-8 shrink-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-w-0">
        {/* Resumo do Plano */}
        <Card className="relative overflow-visible">
          {isNewUser && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium whitespace-nowrap">
                <Star className="h-3 w-3 mr-1" />
                Novo Cliente
              </Badge>
            </div>
          )}

          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl text-foreground">{planDetails.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold text-primary">{planDetails.price}</span>
              <div className="text-muted-foreground text-sm mt-1">{planDetails.period}</div>
            </div>
          </CardHeader>

          <CardContent>
            <ul className="space-y-3 mb-6">
              {planDetails.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {isNewUser && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  🎁 Bônus de Boas-vindas
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Você ganhará <strong>1 petição gratuita extra</strong> além do seu plano!
                  <br />
                  Use quando quiser, sem prazo de validade.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações de Pagamento */}
        <Card className="min-w-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="h-5 w-5 mr-2 flex-shrink-0" />
              Pagamento Seguro
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Seu pagamento será processado de forma segura pelo Stripe
            </p>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  🔒 Segurança Garantida
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Pagamento processado pelo Stripe</li>
                  <li>• Dados criptografados e seguros</li>
                  <li>• Cancele quando quiser</li>
                  <li>• Suporte 24/7</li>
                </ul>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Resumo do Pedido</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plano {planDetails.name}</span>
                    <span className="font-semibold text-foreground">{planDetails.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Período</span>
                    <span className="text-foreground">{planDetails.period}</span>
                  </div>
                  {isNewUser && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Bônus FREE</span>
                      <span>Grátis</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">{planDetails.price}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStripeCheckout}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pagar com Stripe
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Ao continuar, você concorda com nossos termos de serviço
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
