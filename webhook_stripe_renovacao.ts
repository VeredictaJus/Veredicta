// WEBHOOK DO STRIPE PARA RENOVAÇÃO AUTOMÁTICA COM BÔNUS
// Este arquivo deve ser criado em: src/api/webhooks/stripe.ts

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

// Processar pagamento de fatura (renovação)
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('🔄 Processando renovação de assinatura...');
  
  if (!invoice.subscription) return;
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const customerId = subscription.customer as string;
  
  // Buscar usuário pelo customer ID do Stripe
  const { data: user } = await supabase
    .from('user_profiles')
    .select('firebase_uid')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (!user) {
    console.error('❌ Usuário não encontrado para customer:', customerId);
    return;
  }
  
  // Buscar plano baseado no price ID
  const priceId = subscription.items.data[0].price.id;
  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('stripe_price_id', priceId)
    .single();
  
  if (!plan) {
    console.error('❌ Plano não encontrado para price ID:', priceId);
    return;
  }
  
  // Processar renovação com bônus
  await processRenewalWithBonus(user.firebase_uid, plan.plan_code, subscription.id);
}

// Processar renovação com bônus de petições
async function processRenewalWithBonus(userId: string, planCode: string, stripeSubscriptionId: string) {
  try {
    console.log(`🎁 Processando renovação com bônus para usuário: ${userId}, plano: ${planCode}`);
    
    // Buscar informações do plano
    const { data: plan } = await supabase
      .from('plans')
      .select('petitions_included, renewal_bonus, name')
      .eq('plan_code', planCode)
      .single();
    
    if (!plan) {
      throw new Error('Plano não encontrado');
    }
    
    const basePetitions = plan.petitions_included;
    const bonusPetitions = plan.renewal_bonus || 0;
    const totalPetitions = basePetitions + bonusPetitions;
    
    // Atualizar assinatura do usuário
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('plan_code', planCode);
    
    if (updateError) {
      throw new Error(`Erro ao atualizar assinatura: ${updateError.message}`);
    }
    
    // Registrar renovação com bônus
    const { error: renewalError } = await supabase
      .from('subscription_renewals')
      .insert({
        user_id: userId,
        plan_code: planCode,
        base_petitions: basePetitions,
        bonus_petitions: bonusPetitions,
        total_petitions: totalPetitions,
        stripe_subscription_id: stripeSubscriptionId,
        status: 'active'
      });
    
    if (renewalError) {
      throw new Error(`Erro ao registrar renovação: ${renewalError.message}`);
    }
    
    // Adicionar petições bônus ao saldo do usuário
    if (bonusPetitions > 0) {
      await addBonusPetitions(userId, bonusPetitions, planCode);
    }
    
    console.log(`✅ Renovação processada com sucesso!`);
    console.log(`📊 Base: ${basePetitions} petições + Bônus: ${bonusPetitions} petições = ${totalPetitions} total`);
    
  } catch (error) {
    console.error('❌ Erro ao processar renovação com bônus:', error);
  }
}

// Adicionar petições bônus ao saldo do usuário
async function addBonusPetitions(userId: string, bonusPetitions: number, planCode: string) {
  try {
    // Buscar perfil do cliente
    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('credits_balance')
      .eq('user_id', userId)
      .single();
    
    if (!clientProfile) {
      // Criar perfil se não existir
      const { error: createError } = await supabase
        .from('client_profiles')
        .insert({
          user_id: userId,
          credits_balance: bonusPetitions,
          plan_id: planCode
        });
      
      if (createError) {
        throw new Error(`Erro ao criar perfil: ${createError.message}`);
      }
    } else {
      // Atualizar saldo existente
      const newBalance = (clientProfile.credits_balance || 0) + bonusPetitions;
      
      const { error: updateError } = await supabase
        .from('client_profiles')
        .update({ credits_balance: newBalance })
        .eq('user_id', userId);
      
      if (updateError) {
        throw new Error(`Erro ao atualizar saldo: ${updateError.message}`);
      }
    }
    
    console.log(`🎁 Adicionadas ${bonusPetitions} petições bônus ao saldo do usuário ${userId}`);
    
  } catch (error) {
    console.error('❌ Erro ao adicionar petições bônus:', error);
  }
}

// Atualizar assinatura
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Assinatura atualizada:', subscription.id);
  // Implementar lógica de atualização se necessário
}

// Cancelar assinatura
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Assinatura cancelada:', subscription.id);
  
  // Buscar usuário pelo customer ID
  const customerId = subscription.customer as string;
  const { data: user } = await supabase
    .from('user_profiles')
    .select('firebase_uid')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (user) {
    // Atualizar status da assinatura para cancelada
    await supabase
      .from('user_subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', user.firebase_uid);
  }
}




















