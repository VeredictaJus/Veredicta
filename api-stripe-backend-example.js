// EXEMPLO DE API BACKEND PARA STRIPE
// Este arquivo mostra como implementar no seu backend (Node.js/Express)

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 1. Criar sessão de checkout
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { priceId, quantity, mode, userId, planId, successUrl, cancelUrl } = req.body;

    console.log('Criando sessão de checkout:', { priceId, quantity, mode, userId, planId });

    // Criar sessão no Stripe
    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
      customer_email: userId ? await getUserEmail(userId) : undefined,
    });

    console.log('Sessão criada:', session.id);

    res.json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Webhook do Stripe
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Webhook recebido:', event.type);

  try {
    // Processar evento no Supabase
    const { data, error } = await supabase
      .rpc('process_stripe_webhook', {
        p_event_id: event.id,
        p_event_type: event.type,
        p_raw_data: event
      });

    if (error) {
      console.error('Erro ao processar webhook:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Webhook processado com sucesso');
    res.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Cancelar assinatura
app.post('/api/stripe/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log('Assinatura cancelada:', subscription.id);

    res.json({ 
      success: true, 
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Reativar assinatura
app.post('/api/stripe/reactivate-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    console.log('Assinatura reativada:', subscription.id);

    res.json({ 
      success: true, 
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('Erro ao reativar assinatura:', error);
    res.status(500).json({ error: error.message });
  }
});

// Função auxiliar para obter email do usuário
async function getUserEmail(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('firebase_uid', userId)
      .single();

    if (error) {
      console.error('Erro ao obter email:', error);
      return null;
    }

    return data?.email;
  } catch (error) {
    console.error('Erro ao obter email:', error);
    return null;
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Stripe rodando na porta ${PORT}`);
});

module.exports = app;





















