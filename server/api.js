import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Stripe configuration
const stripe = new Stripe('sk_test_51Ro45gLnE1r0oPJFCTzcAl1CDFmtJlQU0oeoEd0meag1Nm95npxOgTk0X1per31PN9gRrPYFvszjd23xyNz75pTo00feXmEMlR', {
  apiVersion: '2024-04-10',
});

const PLAN_PRICES = {
  'start': 52000, // R$ 520.00
  'pro': 168000, // R$ 1.680.00
  'elite': 700000, // R$ 7.000.00
  'test': 100, // R$ 1.00 (plano de teste)
};

// API Routes
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { plan, include_free_bonus, user_id } = req.body;

    if (!plan || !user_id) {
      return res.status(400).json({ error: 'Plano e user_id são obrigatórios' });
    }

    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({ error: 'Plano não encontrado' });
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
      success_url: `http://localhost:5174/client?free_bonus=${include_free_bonus ? 'true' : 'false'}`,
      cancel_url: `http://localhost:5174/client/plans`,
      metadata: {
        plan: plan,
        include_free_bonus: include_free_bonus ? 'true' : 'false',
        userId: user_id,
      },
      customer_email: user_id,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Erro ao criar sessão de checkout' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server rodando na porta ${PORT}`);
});
