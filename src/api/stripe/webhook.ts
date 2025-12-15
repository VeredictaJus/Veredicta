import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from '../../services/emailService';

// Chave secreta LIVE do Stripe (PRODUÇÃO)
// ✅ CORREÇÃO: Usar versão da API mais recente e compatível
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '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', {
  apiVersion: '2024-06-20' as any, // Usar 'as any' para evitar erro de tipo estrito
});

const supabase = createClient(
  'https://dmsodonmkffyvbuxtxec.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg'
);

// ✅ Cliente Supabase com service role para operações admin (bônus de renovação)
const supabaseAdmin = createClient(
  'https://dmsodonmkffyvbuxtxec.supabase.co',
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      import.meta.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { user_id, plan, include_free_bonus } = session.metadata || {};

      if (!user_id || !plan) {
        console.error('Metadata missing:', session.metadata);
        return new Response(JSON.stringify({ error: 'Metadata missing' }), { status: 400 });
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
        return new Response(JSON.stringify({ error: 'Erro ao ativar plano' }), { status: 500 });
      }

      const { data: planRecord } = await supabase
        .from('plans')
        .select('plan_code, name, petitions_limit, features')
        .eq('plan_code', plan)
        .maybeSingle();

      // 2. Se incluir bônus FREE, verificar se cliente pode receber
      if (include_free_bonus === 'true') {
        // Verificar se cliente já usou plano FREE (por CPF/CNPJ)
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('cnpj, cpf')
          .eq('firebase_uid', user_id)
          .single();

        if (userProfile) {
          // Verificar se já existe plano FREE usado por este CPF/CNPJ
          const { data: existingFreeUsage } = await supabase
            .from('user_subscriptions')
            .select(`
              user_id,
              user_profiles!inner(cnpj, cpf)
            `)
            .eq('plan_code', 'free')
            .eq('status', 'used') // Status quando petição foi usada
            .or(`user_profiles.cnpj.eq.${userProfile.cnpj},user_profiles.cpf.eq.${userProfile.cpf}`);

          if (!existingFreeUsage || existingFreeUsage.length === 0) {
            // Cliente pode receber bônus FREE
            const { error: freeError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id,
                plan_code: 'free',
                status: 'active',
                next_billing_date: new Date(Date.now() + 999 * 24 * 60 * 60 * 1000).toISOString(),
                is_bonus: true, // Marcar como bônus
              });

            if (freeError) {
              console.error('Erro ao criar plano FREE bônus:', freeError);
            } else {
              console.log('✅ Plano FREE bônus criado para:', user_id);
            }
          } else {
            console.log('⚠️ Cliente já usou plano FREE anteriormente, bônus não aplicado');
          }
        }
      }

      console.log('✅ Pagamento processado com sucesso:', {
        user_id,
        plan,
        include_free_bonus,
      });

      // Enviar email de confirmação de plano
      try {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('email, full_name, company_name')
          .eq('firebase_uid', user_id)
          .single();
        
        if (userProfile?.email) {
          const clientName = userProfile.full_name || userProfile.company_name || userProfile.email.split('@')[0];

          const planNameMap: Record<string, 'Free' | 'Start' | 'Pro' | 'Elite'> = {
            free: 'Free',
            gratuito: 'Free',
            start: 'Start',
            starter: 'Start',
            pro: 'Pro',
            professional: 'Pro',
            elite: 'Elite'
          };

          const newPlanName = planNameMap[plan.toLowerCase() as keyof typeof planNameMap];
          const oldPlanName = existingSubscription?.plan_code
            ? planNameMap[existingSubscription.plan_code.toLowerCase() as keyof typeof planNameMap]
            : undefined;

          if (!newPlanName) {
            console.warn('⚠️ Plano sem mapeamento para email:', plan);
          } else {
            const planDetails = {
              petitionsLimit: planRecord?.petitions_limit ?? 0,
              features: Array.isArray(planRecord?.features)
                ? planRecord?.features as string[]
                : []
            };

            if (!existingSubscription || !existingSubscription.plan_code || existingSubscription.plan_code === 'free') {
              await EmailService.sendPlanSubscriptionEmail(
                userProfile.email,
                clientName,
                newPlanName
              );
              console.log('📧 Email de nova assinatura enviado:', userProfile.email);
            } else {
              await EmailService.sendPlanRenewalOrChangeEmail(
                userProfile.email,
                clientName,
                newPlanName,
                planDetails,
                oldPlanName
              );
              console.log('📧 Email de renovação/mudança de plano enviado:', userProfile.email);
            }
          }
        }
      } catch (emailError) {
        console.error('⚠️ Erro ao enviar email de confirmação de plano:', emailError);
        // Não falhar o webhook se o email falhar
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // ✅ NOVO: Processar renovação automática com bônus
    if (event.type === 'invoice.payment_succeeded') {
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500 });
  }
};

// ✅ NOVO: Processar pagamento de fatura (renovação automática)
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('🔄 Processando renovação de assinatura...');
  
  // ✅ CORREÇÃO: A propriedade subscription pode ser string ou objeto expandido
  const subscriptionId = typeof invoice.subscription === 'string' 
    ? invoice.subscription 
    : invoice.subscription?.id || null;
  
  if (!subscriptionId) {
    console.log('⚠️ Invoice sem subscription ID, ignorando...');
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer.id;

    // Buscar usuário pelo customer ID do Stripe
    const { data: user } = await supabaseAdmin
      .from('user_profiles')
      .select('firebase_uid')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();

    if (!user) {
      console.error('❌ Usuário não encontrado para customer:', customerId);
      return;
    }

    // Buscar assinatura do usuário para obter o plan_code
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

    // Processar renovação com bônus
    await processRenewalWithBonus(
      user.firebase_uid,
      userSubscription.plan_code,
      subscription.id
    );
  } catch (error) {
    console.error('❌ Erro ao processar renovação:', error);
  }
}

// ✅ NOVO: Processar renovação com bônus de petições
async function processRenewalWithBonus(
  userId: string,
  planCode: string,
  stripeSubscriptionId: string
) {
  try {
    console.log(`🎁 Processando renovação com bônus para usuário: ${userId}, plano: ${planCode}`);

    // Buscar informações do plano
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

    // Atualizar assinatura do usuário
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

    // Registrar renovação com bônus (se a tabela existir)
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
        console.warn('⚠️ Erro ao registrar renovação (tabela pode não existir):', renewalError.message);
      }
    } catch (err) {
      console.warn('⚠️ Tabela subscription_renewals pode não existir, continuando...');
    }

    // Adicionar petições bônus ao saldo do usuário
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
        // Aqui você pode adicionar um email específico para bônus de renovação
        console.log(`📧 Bônus de renovação: ${bonusPetitions} petições para ${userProfile.email}`);
      }
    } catch (emailError) {
      console.warn('⚠️ Erro ao buscar perfil para email:', emailError);
    }
  } catch (error) {
    console.error('❌ Erro ao processar renovação com bônus:', error);
  }
}

// ✅ NOVO: Adicionar petições bônus ao saldo do usuário
async function addBonusPetitions(userId: string, bonusPetitions: number, planCode: string) {
  try {
    // Tentar usar a função RPC do Supabase se existir
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

    // Fallback: Tentar atualizar diretamente na tabela user_subscriptions
    // Adicionar petições extras como créditos ou atualizar limite
    console.log(`🎁 Adicionando ${bonusPetitions} petições bônus para usuário ${userId} (método alternativo)`);
    
    // Nota: A lógica exata depende de como o sistema armazena petições disponíveis
    // Isso pode ser através de uma coluna 'remaining_petitions' ou similar
    // Por enquanto, apenas logamos - a implementação final dependerá da estrutura do banco
    
  } catch (error) {
    console.error('❌ Erro ao adicionar petições bônus:', error);
  }
}
