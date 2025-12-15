import { loadStripe, Stripe } from '@stripe/stripe-js';

// Chave publicável LIVE do Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51Ro45gLnE1r0oPJFO3eTA26ztlbri5kwKETZYeMci6kETMGKDi1151vcrlPl0wsguTNlUDeutaHXiTcBX6r72Vnv00s4xPxkSd';

// Função lazy para carregar Stripe apenas quando necessário
let stripePromiseInstance: Promise<Stripe | null> | null = null;

export const stripePromise = () => {
  if (stripePromiseInstance === null) {
    stripePromiseInstance = loadStripe(stripePublishableKey);
  }
  return stripePromiseInstance;
};

// Price IDs from Stripe Dashboard - PRICE IDs REAIS
export const STRIPE_PRICE_IDS = {
  start: import.meta.env.VITE_STRIPE_PRICE_START || 'price_1SIx0xLnE1r0oPJFSN2Kt41R',
  pro: import.meta.env.VITE_STRIPE_PRICE_PRO || 'price_1SIx2XLnE1r0oPJFljNvb1t3', 
  elite: import.meta.env.VITE_STRIPE_PRICE_ELITE || 'price_1SIx3jLnE1r0oPJFw8pvuZnO',
  test: import.meta.env.VITE_STRIPE_PRICE_TEST || 'price_1SYbSbLnE1r0oPJFloCSxOBA'
};

export const PLAN_PRICES = {
  start: 52000, // R$ 520,00 em centavos
  pro: 168000,  // R$ 1.680,00 em centavos
  elite: 700000, // R$ 7.000,00 em centavos
  test: 100     // R$ 1,00 em centavos (plano de teste)
};

export const WRITER_PRICES = {
  inicial: 80,
  recurso: 100,
  contestacao: 60,
  agravo: 80,
  apelacao: 90,
  embargos: 50,
  peticao_simples: 40
};

export const createCheckoutSession = async (
  priceId: string, 
  quantity: number = 1, 
  mode: 'subscription' | 'payment' = 'subscription',
  userId?: string,
  planId?: string
) => {
  try {
    console.log('Creating checkout session:', { priceId, quantity, mode, userId, planId });
    
    // Chamar API do backend para criar sessão real
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        quantity,
        mode,
        userId,
        planId,
        successUrl: `${window.location.origin}/client/plans?success=true`,
        cancelUrl: `${window.location.origin}/client/plans?canceled=true`
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const session = await response.json();
    console.log('Session created:', session);
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const redirectToCheckout = async (
  priceId: string, 
  quantity: number = 1, 
  mode: 'subscription' | 'payment' = 'subscription',
  userId?: string,
  planId?: string
) => {
  try {
    console.log('Redirecting to checkout:', { priceId, quantity, mode, userId, planId });
    
    const session = await createCheckoutSession(priceId, quantity, mode, userId, planId);
    
    console.log('Session created:', session);
    
    // Redirecionar para o Stripe Checkout real
    if (session.url) {
      window.location.href = session.url;
    } else {
      throw new Error('URL de checkout não retornada');
    }
    
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};