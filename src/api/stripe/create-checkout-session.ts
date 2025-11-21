import type { Handler } from 'vite-plugin-api-routes';
import Stripe from 'stripe';

// Chave secreta LIVE do Stripe
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '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', {
  apiVersion: '2024-04-10',
});

// Usar a URL atual do frontend ou fallback
// Em desenvolvimento, usar localhost:5176 (porta do Vite)
// Em produção, usar veredictajus.com.br
const getDomain = () => {
  if (typeof window !== 'undefined') {
    // Se estiver em produção (veredictajus.com.br), usar HTTPS
    if (window.location.hostname.includes('veredictajus.com.br')) {
      return 'https://veredictajus.com.br';
    }
    return window.location.origin;
  }
  return import.meta.env.PUBLIC_FRONTEND_URL || 
         import.meta.env.VITE_FRONTEND_URL || 
         'https://veredictajus.com.br';
};

const DOMAIN = getDomain();

const PLAN_PRICES: { [key: string]: number } = {
  'start': 52000, // R$ 520.00
  'pro': 168000, // R$ 1.680.00
  'elite': 700000, // R$ 7.000.00
};

// Função auxiliar para ler o body da requisição
async function readBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

// Export POST handler
export const POST: Handler = async (req, res) => {
  try {
    const { plan, include_free_bonus, user_id } = await readBody(req);

    console.log('📦 Criando checkout para:', { plan, include_free_bonus, user_id });

    if (!plan || !user_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Plano e user_id são obrigatórios' }));
      return;
    }

    if (!PLAN_PRICES[plan]) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Plano não encontrado' }));
      return;
    }

    const price = PLAN_PRICES[plan];
    const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

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
      success_url: `${DOMAIN}/client?payment=success&session_id={CHECKOUT_SESSION_ID}&plan=${plan}&free_bonus=${include_free_bonus ? 'true' : 'false'}`,
      cancel_url: `${DOMAIN}/client/plans`,
      metadata: {
        plan: plan,
        include_free_bonus: include_free_bonus ? 'true' : 'false',
        userId: user_id,
      },
      // customer_email será preenchido pelo Stripe no checkout
      // Não precisamos passar aqui, o Stripe pedirá ao usuário
    });

    console.log('✅ Sessão criada:', session.id);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url: session.url }));
  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Erro ao criar sessão de checkout', details: error instanceof Error ? error.message : 'Unknown error' }));
  }
};

// Export default para compatibilidade
export default POST;