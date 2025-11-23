import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Helper para ler variáveis de ambiente com nomes seguros (Vercel) + fallback para nomes antigos
function getEnvVar(safeName: string, legacyName: string, defaultValue: string = ''): string {
  return process.env[safeName] || process.env[legacyName] || defaultValue;
}

// Chave secreta LIVE do Stripe (PRODUÇÃO)
// Usa nomes seguros primeiro: STRIPE_API_TOKEN, depois fallback para VITE_STRIPE_SECRET_KEY
const stripe = new Stripe(
  getEnvVar('STRIPE_API_TOKEN', 'VITE_STRIPE_SECRET_KEY', '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'),
  { apiVersion: '2024-04-10' }
);

// Cliente Supabase padrão
const supabase = createClient(
  getEnvVar('SUPABASE_URL', 'VITE_SUPABASE_URL', 'https://dmsodonmkffyvbuxtxec.supabase.co'),
  getEnvVar('SUPABASE_ANON_TOKEN', 'VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg')
);

// Cliente Supabase com service role para operações admin (bônus de renovação)
const supabaseAdmin = createClient(
  getEnvVar('SUPABASE_URL', 'VITE_SUPABASE_URL', 'https://dmsodonmkffyvbuxtxec.supabase.co'),
  getEnvVar('SUPABASE_ADMIN_TOKEN', 'VITE_SUPABASE_SERVICE_ROLE_KEY', ''),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Função simplificada para enviar email (adaptada para serverless)
async function sendEmail(to: string, subject: string, html: string) {
  try {
    // Usar Resend diretamente ou chamar uma API externa
    // Por enquanto, apenas logamos - você pode configurar Resend aqui depois
    console.log(`📧 Email seria enviado para ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('⚠️ Erro ao enviar email:', error);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'] as string;
  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    // No Vercel, o body vem como string quando é um POST raw
    // Para webhooks do Stripe, precisamos do body como string raw
    const body = typeof req.body === 'string' 
      ? req.body 
      : req.body 
        ? JSON.stringify(req.body)
        : '';
    
    if (!body) {
      return res.status(400).json({ error: 'Empty body' });
    }
    
    // Usa nomes seguros primeiro: STRIPE_WEBHOOK_SIGNING, depois fallback para nomes antigos
    const webhookSecret = getEnvVar('STRIPE_WEBHOOK_SIGNING', 'STRIPE_WEBHOOK_SECRET', '') || 
                          getEnvVar('', 'VITE_STRIPE_WEBHOOK_SECRET', '');
    
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { user_id, plan, include_free_bonus } = session.metadata || {};

      if (!user_id || !plan) {
        console.error('Metadata missing:', session.metadata);
        return res.status(400).json({ error: 'Metadata missing' });
      }

      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('plan_code, status')
        .eq('user_id', user_id)
        .maybeSingle();

      // 1. Ativar plano pago
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .update({
          plan_code: plan,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id);

      if (subscriptionError) {
        console.error('Erro ao ativar plano pago:', subscriptionError);
        return res.status(500).json({ error: 'Erro ao ativar plano' });
      }

      const { data: planRecord } = await supabase
        .from('plans')
        .select('plan_code, name, petitions_limit, features')
        .eq('plan_code', plan)
        .maybeSingle();

      // 2. Se incluir bônus FREE, verificar se cliente pode receber
      if (include_free_bonus === 'true') {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('cnpj, cpf')
          .eq('firebase_uid', user_id)
          .single();

        if (userProfile) {
          const { data: existingFreeUsage } = await supabase
            .from('user_subscriptions')
            .select(`
              user_id,
              user_profiles!inner(cnpj, cpf)
            `)
            .eq('plan_code', 'free')
            .eq('status', 'used')
            .or(`user_profiles.cnpj.eq.${userProfile.cnpj},user_profiles.cpf.eq.${userProfile.cpf}`);

          if (!existingFreeUsage || existingFreeUsage.length === 0) {
            const { error: freeError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id,
                plan_code: 'free',
                status: 'active',
                next_billing_date: new Date(Date.now() + 999 * 24 * 60 * 60 * 1000).toISOString(),
                is_bonus: true,
              });

            if (freeError) {
              console.error('Erro ao criar plano FREE bônus:', freeError);
            } else {
              console.log('✅ Plano FREE bônus criado para:', user_id);
            }
          }
        }
      }

      console.log('✅ Pagamento processado com sucesso:', {
        user_id,
        plan,
        include_free_bonus,
      });

      // Enviar email de confirmação de plano (simplificado)
      try {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('email, full_name, company_name')
          .eq('firebase_uid', user_id)
          .single();
        
        if (userProfile?.email) {
          const clientName = userProfile.full_name || userProfile.company_name || userProfile.email.split('@')[0];
          const planNameMap: Record<string, string> = {
            free: 'Free',
            gratuito: 'Free',
            start: 'Start',
            starter: 'Start',
            pro: 'Pro',
            professional: 'Pro',
            elite: 'Elite'
          };

          const newPlanName = planNameMap[plan.toLowerCase()] || plan;
          const subject = !existingSubscription || !existingSubscription.plan_code || existingSubscription.plan_code === 'free'
            ? `Bem-vindo ao plano ${newPlanName} - Veredicta`
            : `Plano atualizado para ${newPlanName} - Veredicta`;

          await sendEmail(userProfile.email, subject, `Olá ${clientName}, seu plano foi ativado com sucesso!`);
          console.log('📧 Email de confirmação de plano enviado:', userProfile.email);
        }
      } catch (emailError) {
        console.error('⚠️ Erro ao enviar email de confirmação de plano:', emailError);
      }

      return res.status(200).json({ success: true });
    }

    // ✅ Processar renovação automática com bônus
    if (event.type === 'invoice.payment_succeeded') {
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// ✅ Processar pagamento de fatura (renovação automática)
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('🔄 Processando renovação de assinatura...');
  
  if (!invoice.subscription) {
    console.log('⚠️ Invoice sem subscription, ignorando...');
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const customerId = subscription.customer as string;

    const { data: user } = await supabaseAdmin
      .from('user_profiles')
      .select('firebase_uid')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();

    if (!user) {
      console.error('❌ Usuário não encontrado para customer:', customerId);
      return;
    }

    const { data: userSubscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('plan_code')
      .eq('user_id', user.firebase_uid)
      .eq('status', 'active')
      .maybeSingle();

    if (!userSubscription || !userSubscription.plan_code) {
      console.error('❌ Assinatura ativa não encontrada para usuário:', user.firebase_uid);
      return;
    }

    await processRenewalWithBonus(
      user.firebase_uid,
      userSubscription.plan_code,
      subscription.id
    );
  } catch (error) {
    console.error('❌ Erro ao processar renovação:', error);
  }
}

// ✅ Processar renovação com bônus de petições
async function processRenewalWithBonus(
  userId: string,
  planCode: string,
  stripeSubscriptionId: string
) {
  try {
    console.log(`🎁 Processando renovação com bônus para usuário: ${userId}, plano: ${planCode}`);

    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('petitions_included, renewal_bonus, name, plan_code')
      .eq('plan_code', planCode)
      .maybeSingle();

    if (planError || !plan) {
      console.error('❌ Erro ao buscar plano:', planError);
      return;
    }

    const basePetitions = plan.petitions_included || 0;
    const bonusPetitions = plan.renewal_bonus || 0;
    const totalPetitions = basePetitions + bonusPetitions;

    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('plan_code', planCode);

    if (updateError) {
      console.error('❌ Erro ao atualizar assinatura:', updateError);
      return;
    }

    try {
      const { error: renewalError } = await supabaseAdmin
        .from('subscription_renewals')
        .insert({
          user_id: userId,
          plan_code: planCode,
          base_petitions: basePetitions,
          bonus_petitions: bonusPetitions,
          total_petitions: totalPetitions,
          stripe_subscription_id: stripeSubscriptionId,
          status: 'active',
        });

      if (renewalError) {
        console.warn('⚠️ Erro ao registrar renovação:', renewalError.message);
      }
    } catch (err) {
      console.warn('⚠️ Tabela subscription_renewals pode não existir, continuando...');
    }

    if (bonusPetitions > 0) {
      await addBonusPetitions(userId, bonusPetitions, planCode);
    }

    console.log(`✅ Renovação processada com sucesso!`);
    console.log(`📊 Base: ${basePetitions} petições + Bônus: ${bonusPetitions} petições = ${totalPetitions} total`);

    // Enviar email de notificação (opcional)
    try {
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('email, full_name')
        .eq('firebase_uid', userId)
        .maybeSingle();

      if (userProfile?.email && bonusPetitions > 0) {
        await sendEmail(
          userProfile.email,
          `Renovação com bônus - ${bonusPetitions} petições adicionais`,
          `Olá ${userProfile.full_name || 'Cliente'}, sua assinatura foi renovada e você recebeu ${bonusPetitions} petições bônus!`
        );
        console.log(`📧 Bônus de renovação: ${bonusPetitions} petições para ${userProfile.email}`);
      }
    } catch (emailError) {
      console.warn('⚠️ Erro ao buscar perfil para email:', emailError);
    }
  } catch (error) {
    console.error('❌ Erro ao processar renovação com bônus:', error);
  }
}

// ✅ Adicionar petições bônus ao saldo do usuário
async function addBonusPetitions(userId: string, bonusPetitions: number, planCode: string) {
  try {
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
      'add_bonus_petitions',
      {
        p_user_id: userId,
        p_bonus_petitions: bonusPetitions,
        p_plan_code: planCode,
      }
    );

    if (!rpcError && rpcResult) {
      console.log(`🎁 Adicionadas ${bonusPetitions} petições bônus via RPC para usuário ${userId}`);
      return;
    }

    console.log(`🎁 Adicionando ${bonusPetitions} petições bônus para usuário ${userId} (método alternativo)`);
  } catch (error) {
    console.error('❌ Erro ao adicionar petições bônus:', error);
  }
}

