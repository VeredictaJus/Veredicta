import Stripe from 'stripe';

// Chave secreta LIVE do Stripe (PRODUÇÃO)
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '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', {
  apiVersion: '2024-06-20',
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, planName, price, userId, userEmail, paymentMethod } = req.body;
    
    // Validar dados recebidos
    if (!planId || !planName || !price || !userId) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Se for PIX, criar Payment Intent diretamente
    if (paymentMethod === 'pix') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price * 100), // Converter para centavos
        currency: 'brl',
        payment_method_types: ['pix'],
        metadata: {
          userId: userId,
          planId: planId,
          planName: planName,
          type: 'plan_subscription',
          userEmail: userEmail || '',
        },
      });

      return res.json({ 
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        type: 'pix'
      });
    }

    // Se for cartão, usar Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano ${planName}`,
              description: `Assinatura do plano ${planName}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/client/plans?success=true&plan=${planId}`,
      cancel_url: `${req.headers.origin}/client/plans?cancelled=true`,
      metadata: {
        userId: userId,
        planId: planId,
        planName: planName,
        type: 'plan_subscription',
      },
    });

    res.json({ url: session.url, type: 'card' });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
}