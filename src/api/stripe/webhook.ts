import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from '../../services/emailService';

// Chave secreta LIVE do Stripe (PRODUÇÃO)
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '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', {
  apiVersion: '2024-04-10',
});

const supabase = createClient(
  'https://dmsodonmkffyvbuxtxec.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg'
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

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500 });
  }
};
