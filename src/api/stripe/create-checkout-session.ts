import type { Handler } from 'vite-plugin-api-routes';
import Stripe from 'stripe';

// Chave secreta do Stripe - usa variável de ambiente ou chave de teste como fallback
// Em desenvolvimento, usar chave de teste (sk_test_...)
// Em produção, usar chave live (sk_live_...) via variável de ambiente
const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY || 
  // Chave de teste para desenvolvimento
  'sk_test_51Ro45gLnE1r0oPJFCTzcAl1CDFmtJlQU0oeoEd0meag1Nm95npxOgTk0X1per31PN9gRrPYFvszjd23xyNz75pTo00feXmEMlR';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-04-10',
});

// Usar a URL atual do frontend ou fallback
// Em desenvolvimento, usar localhost:5176 (porta do Vite)
// Em produção, usar veredictajus.com.br
const getDomain = (req?: any) => {
  // Tentar obter do header da requisição (se disponível)
  if (req?.headers?.origin) {
    return req.headers.origin;
  }
  if (req?.headers?.referer) {
    try {
      const url = new URL(req.headers.referer);
      return url.origin;
    } catch (e) {
      // Ignorar erro
    }
  }
  // Fallback para variáveis de ambiente ou localhost
  return import.meta.env.PUBLIC_FRONTEND_URL || 
         import.meta.env.VITE_FRONTEND_URL || 
         import.meta.env.VITE_APP_URL ||
         'http://localhost:5176';
};

const PLAN_PRICES: { [key: string]: number } = {
  'start': 52000, // R$ 520.00
  'pro': 168000, // R$ 1.680.00
  'elite': 700000, // R$ 7.000.00
  'test': 100, // R$ 1.00 (plano de teste)
};

// Export POST handler
export const POST: Handler = async (req, res) => {
  try {
    // O vite-plugin-api-routes já faz o parsing do JSON automaticamente
    const body = req.body || {};
    const { plan, include_free_bonus, user_id } = body;

    console.log('📦 [API] Body recebido:', JSON.stringify(body));
    console.log('📦 [API] Criando checkout para:', { plan, include_free_bonus, user_id });
    console.log('📦 [API] Planos disponíveis:', Object.keys(PLAN_PRICES));

    if (!plan || !user_id) {
      console.error('❌ [API] Parâmetros faltando:', { 
        hasPlan: !!plan, 
        hasUserId: !!user_id,
        planValue: plan,
        userIdValue: user_id,
        fullBody: body
      });
      return res.status(400).json({ 
        error: 'Plano e user_id são obrigatórios',
        received: { plan, user_id, include_free_bonus }
      });
    }

    // Normalizar o nome do plano para lowercase
    const normalizedPlan = plan.toLowerCase();
    
    if (!PLAN_PRICES[normalizedPlan]) {
      console.error('❌ [API] Plano não encontrado:', {
        receivedPlan: plan,
        normalizedPlan,
        availablePlans: Object.keys(PLAN_PRICES)
      });
      return res.status(400).json({ 
        error: 'Plano não encontrado',
        received: plan,
        available: Object.keys(PLAN_PRICES)
      });
    }

    const price = PLAN_PRICES[normalizedPlan];
    const planName = normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1);
    
    // Obter domínio baseado na requisição
    const domain = getDomain(req);
    
    // Incluir user_id na URL de sucesso para garantir que o sistema saiba qual usuário fez o pagamento
    const successUrl = `${domain}/client?payment=success&session_id={CHECKOUT_SESSION_ID}&plan=${plan}&free_bonus=${include_free_bonus ? 'true' : 'false'}&user_id=${user_id}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano ${planName}`,
              description: `Assinatura do plano ${planName} para Veredicta`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: `${domain}/client/plans`,
      metadata: {
        plan: plan,
        include_free_bonus: include_free_bonus ? 'true' : 'false',
        user_id: user_id,
      },
      // customer_email será preenchido pelo Stripe no checkout
      // Não precisamos passar aqui, o Stripe pedirá ao usuário
    });

    console.log('✅ Sessão criada:', session.id);
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    return res.status(500).json({ 
      error: 'Erro ao criar sessão de checkout', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Export default para compatibilidade
export default POST;