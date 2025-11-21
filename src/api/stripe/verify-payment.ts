import type { Handler } from 'vite-plugin-api-routes';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Chave secreta LIVE do Stripe (PRODUÇÃO)
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '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', {
  apiVersion: '2024-04-10',
});

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://dmsodonmkffyvbuxtxec.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg'
);

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
    const { session_id, user_id } = await readBody(req);

    console.log('🔍 Verificando pagamento:', { session_id, user_id });

    if (!session_id || !user_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'session_id e user_id são obrigatórios' }));
      return;
    }

    // Buscar sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Sessão não encontrada' }));
      return;
    }

    // Verificar se o pagamento foi concluído
    if (session.payment_status !== 'paid') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Pagamento não concluído',
        payment_status: session.payment_status 
      }));
      return;
    }

    // Extrair dados do metadata
    const { plan, include_free_bonus } = session.metadata || {};

    if (!plan) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Plano não encontrado no metadata' }));
      return;
    }

    console.log('✅ Pagamento confirmado! Atualizando plano...', { plan, user_id });

    // Verificar se já existe assinatura
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('plan_code, status')
      .eq('user_id', user_id)
      .maybeSingle();

    // Atualizar ou criar assinatura
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user_id,
        plan_code: plan.toLowerCase(),
        status: 'active',
        updated_at: new Date().toISOString(),
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      }, {
        onConflict: 'user_id'
      });

    if (subscriptionError) {
      console.error('❌ Erro ao atualizar plano:', subscriptionError);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro ao atualizar plano', details: subscriptionError.message }));
      return;
    }

    // Se incluir bônus FREE, verificar se cliente pode receber
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
            console.error('⚠️ Erro ao criar plano FREE bônus:', freeError);
          } else {
            console.log('✅ Plano FREE bônus criado para:', user_id);
          }
        }
      }
    }

    console.log('✅ Plano atualizado com sucesso!', { plan, user_id });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      plan: plan.toLowerCase(),
      message: 'Plano ativado com sucesso'
    }));

  } catch (error) {
    console.error('❌ Erro ao verificar pagamento:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Erro ao verificar pagamento', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }));
  }
};

// Export default para compatibilidade
export default POST;

