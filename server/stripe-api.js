import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar Stripe com chave secreta LIVE
const stripe = new Stripe('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', {
  apiVersion: '2024-04-10',
});

const PLAN_PRICES = {
  'start': 52000,   // R$ 520.00 em centavos
  'pro': 168000,    // R$ 1.680.00 em centavos
  'elite': 700000,  // R$ 7.000.00 em centavos
  'test': 100       // R$ 1.00 em centavos (plano de teste)
};

// Endpoint para criar sessão de checkout
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { plan, include_free_bonus, user_id } = req.body;

    console.log('📦 Criando sessão para:', { plan, include_free_bonus, user_id });

    if (!plan || !user_id) {
      return res.status(400).json({ error: 'Plano e user_id são obrigatórios' });
    }

    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({ error: 'Plano não encontrado' });
    }

    const price = PLAN_PRICES[plan];
    const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

    // Criar sessão no Stripe
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
      success_url: `http://localhost:5175/client?payment=success&free_bonus=${include_free_bonus}&plan=${plan}&user=${user_id}`,
      cancel_url: `http://localhost:5175/client/plans?payment=cancelled`,
      metadata: {
        plan: plan,
        include_free_bonus: include_free_bonus ? 'true' : 'false',
        userId: user_id,
      },
      client_reference_id: user_id,
    });

    console.log('✅ Sessão criada:', session.id);
    res.json({ url: session.url });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    res.status(500).json({ error: 'Erro ao criar sessão de checkout', details: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Stripe rodando em http://localhost:${PORT}`);
  console.log(`✅ Pronto para receber requisições!`);
});















