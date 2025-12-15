import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Iniciando verificação de vencimentos de planos...')

    const now = new Date()
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Buscar assinaturas ativas com vencimento próximo (próximos 7 dias)
    // IMPORTANTE: Ignorar planos FREE - eles não têm vencimento mensal
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select(`
        user_id,
        plan_code,
        next_billing_date,
        status
      `)
      .eq('status', 'active')
      .neq('plan_code', 'free')  // Excluir planos FREE - notificação apenas por limite de petições
      .not('next_billing_date', 'is', null)
      .lte('next_billing_date', in7Days.toISOString())

    if (subError) {
      console.error('❌ Erro ao buscar assinaturas:', subError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions', details: subError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📋 Encontradas ${subscriptions?.length || 0} assinaturas próximas de vencer`)

    let notificationsCreated = 0
    let subscriptionsExpired = 0

    // Processar cada assinatura
    for (const sub of subscriptions || []) {
      const expiryDate = new Date(sub.next_billing_date!)
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      )

      // Buscar nome e preço do plano
      const { data: plan } = await supabaseAdmin
        .from('plans')
        .select('name, price')
        .eq('plan_code', sub.plan_code)
        .single()

      const planName = plan?.name || sub.plan_code.toUpperCase()
      const priceText = plan?.price && plan.price > 0 ? ` (R$ ${plan.price.toFixed(2)}/mês)` : ''

      // Se o plano já venceu
      if (daysUntilExpiry <= 0) {
        // Verificar se já não foi notificado hoje
        const { data: existingNotification } = await supabaseAdmin
          .from('app_2d8133c678_notifications')
          .select('id')
          .eq('user_id', sub.user_id)
          .eq('type', 'plan_expired')
          .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1)

        if (!existingNotification || existingNotification.length === 0) {
          // Criar notificação de plano expirado
          await supabaseAdmin
            .from('app_2d8133c678_notifications')
            .insert({
              user_id: sub.user_id,
              title: '❌ Plano Expirado',
              message: `Seu plano ${planName}${priceText} expirou. Renove agora para continuar usando a plataforma e criando petições.`,
              type: 'plan_expired',
              priority: 'urgent',
              is_read: false,
              related_entity_type: 'plan',
              related_entity_id: 'plan_expired'
            })

          notificationsCreated++
        }

        // Atualizar status da assinatura para 'expired'
        await supabaseAdmin
          .from('user_subscriptions')
          .update({ status: 'expired' })
          .eq('user_id', sub.user_id)
          .eq('status', 'active')

        subscriptionsExpired++
      }
      // Se vai vencer em 1, 3 ou 7 dias
      else if ([1, 3, 7].includes(daysUntilExpiry)) {
        const notificationType = `plan_expiring_${daysUntilExpiry}d`
        
        // Verificar se já não foi notificado hoje
        const { data: existingNotification } = await supabaseAdmin
          .from('app_2d8133c678_notifications')
          .select('id')
          .eq('user_id', sub.user_id)
          .eq('type', notificationType)
          .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1)

        if (!existingNotification || existingNotification.length === 0) {
          const priority = daysUntilExpiry <= 3 ? 'urgent' : 'high'
          const formattedDate = expiryDate.toLocaleDateString('pt-BR')

          const { error: insertError } = await supabaseAdmin
            .from('app_2d8133c678_notifications')
            .insert({
              user_id: sub.user_id,
              title: `⏰ Plano Expira em ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'Dia' : 'Dias'}`,
              message: `Seu plano ${planName}${priceText} expira em ${formattedDate}. Renove agora para não perder o acesso aos seus benefícios.`,
              type: 'plan_expiring_soon',
              priority: priority,
              is_read: false,
              related_entity_type: 'plan',
              related_entity_id: 'plan_expiry'
            })

          if (!insertError) {
            notificationsCreated++
          }
        }
      }
    }

    const result = {
      success: true,
      message: 'Verificação de vencimentos concluída',
      stats: {
        subscriptions_checked: subscriptions?.length || 0,
        notifications_created: notificationsCreated,
        subscriptions_expired: subscriptionsExpired
      }
    }

    console.log('✅ Verificação concluída:', result)

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

