-- WEBHOOK STRIPE - SISTEMA DE VALIDAÇÃO DE PAGAMENTOS
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela de webhooks do Stripe
CREATE TABLE IF NOT EXISTS public.stripe_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    raw_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela de sessões de checkout
CREATE TABLE IF NOT EXISTS public.stripe_checkout_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    plan_id TEXT,
    price_id TEXT NOT NULL,
    amount_total INTEGER NOT NULL,
    currency TEXT DEFAULT 'brl',
    payment_status TEXT DEFAULT 'pending',
    subscription_id TEXT,
    customer_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela de assinaturas ativas
CREATE TABLE IF NOT EXISTS public.user_subscriptions_active (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    subscription_id TEXT UNIQUE NOT NULL,
    plan_code TEXT NOT NULL,
    status TEXT NOT NULL, -- active, cancelled, expired
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    stripe_customer_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_event_id ON public.stripe_webhooks(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_processed ON public.stripe_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON public.stripe_checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_session_id ON public.stripe_checkout_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.user_subscriptions_active(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON public.user_subscriptions_active(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.user_subscriptions_active(status);

-- 5. Habilitar RLS
ALTER TABLE public.stripe_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions_active ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
-- Webhooks - apenas service role pode acessar
CREATE POLICY "Service role can manage webhooks" ON public.stripe_webhooks
    FOR ALL USING (auth.role() = 'service_role');

-- Checkout sessions - usuários podem ver apenas suas próprias
CREATE POLICY "Users can view own checkout sessions" ON public.stripe_checkout_sessions
    FOR SELECT USING (auth.uid()::text = UPPER(user_id));

CREATE POLICY "Service role can manage checkout sessions" ON public.stripe_checkout_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Assinaturas - usuários podem ver apenas suas próprias
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions_active
    FOR SELECT USING (auth.uid()::text = UPPER(user_id));

CREATE POLICY "Service role can manage subscriptions" ON public.user_subscriptions_active
    FOR ALL USING (auth.role() = 'service_role');

-- 7. Criar função para processar webhooks
CREATE OR REPLACE FUNCTION process_stripe_webhook(
    p_event_id TEXT,
    p_event_type TEXT,
    p_raw_data JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    session_data JSONB;
    subscription_data JSONB;
    user_id TEXT;
    plan_code TEXT;
BEGIN
    -- Inserir webhook
    INSERT INTO public.stripe_webhooks (stripe_event_id, event_type, raw_data)
    VALUES (p_event_id, p_event_type, p_raw_data);
    
    -- Processar baseado no tipo de evento
    CASE p_event_type
        WHEN 'checkout.session.completed' THEN
            -- Extrair dados da sessão
            session_data := p_raw_data->'data'->'object';
            user_id := session_data->>'metadata'->>'user_id';
            
            -- Atualizar sessão de checkout
            INSERT INTO public.stripe_checkout_sessions (
                session_id, user_id, plan_id, price_id, amount_total,
                currency, payment_status, subscription_id, customer_id, metadata
            ) VALUES (
                session_data->>'id',
                user_id,
                session_data->>'metadata'->>'plan_id',
                session_data->>'price_id',
                (session_data->>'amount_total')::INTEGER,
                session_data->>'currency',
                session_data->>'payment_status',
                session_data->>'subscription',
                session_data->>'customer',
                session_data->'metadata'
            ) ON CONFLICT (session_id) DO UPDATE SET
                payment_status = EXCLUDED.payment_status,
                subscription_id = EXCLUDED.subscription_id,
                updated_at = NOW();
                
        WHEN 'customer.subscription.created', 'customer.subscription.updated' THEN
            -- Extrair dados da assinatura
            subscription_data := p_raw_data->'data'->'object';
            
            -- Determinar código do plano baseado no price_id
            SELECT CASE 
                WHEN subscription_data->>'price_id' LIKE '%starter%' THEN 'starter'
                WHEN subscription_data->>'price_id' LIKE '%professional%' THEN 'professional'
                WHEN subscription_data->>'price_id' LIKE '%premium%' THEN 'premium'
                ELSE 'unknown'
            END INTO plan_code;
            
            -- Inserir/atualizar assinatura ativa
            INSERT INTO public.user_subscriptions_active (
                user_id, subscription_id, plan_code, status,
                current_period_start, current_period_end,
                cancel_at_period_end, stripe_customer_id
            ) VALUES (
                subscription_data->>'metadata'->>'user_id',
                subscription_data->>'id',
                plan_code,
                subscription_data->>'status',
                to_timestamp((subscription_data->>'current_period_start')::INTEGER),
                to_timestamp((subscription_data->>'current_period_end')::INTEGER),
                (subscription_data->>'cancel_at_period_end')::BOOLEAN,
                subscription_data->>'customer'
            ) ON CONFLICT (subscription_id) DO UPDATE SET
                status = EXCLUDED.status,
                current_period_start = EXCLUDED.current_period_start,
                current_period_end = EXCLUDED.current_period_end,
                cancel_at_period_end = EXCLUDED.cancel_at_period_end,
                updated_at = NOW();
                
        WHEN 'customer.subscription.deleted' THEN
            -- Marcar assinatura como cancelada
            subscription_data := p_raw_data->'data'->'object';
            
            UPDATE public.user_subscriptions_active
            SET 
                status = 'cancelled',
                cancelled_at = NOW(),
                updated_at = NOW()
            WHERE subscription_id = subscription_data->>'id';
    END CASE;
    
    -- Marcar webhook como processado
    UPDATE public.stripe_webhooks
    SET processed = true, processed_at = NOW()
    WHERE stripe_event_id = p_event_id;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        RAISE LOG 'Erro ao processar webhook %: %', p_event_id, SQLERRM;
        RETURN false;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar função para verificar se usuário tem plano ativo
CREATE OR REPLACE FUNCTION user_has_active_plan(p_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_subscriptions_active
        WHERE UPPER(user_id) = UPPER(p_user_id)
        AND status = 'active'
        AND current_period_end > NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- 9. Criar função para obter plano atual do usuário
CREATE OR REPLACE FUNCTION get_user_current_plan(p_user_id TEXT)
RETURNS TABLE(
    plan_code TEXT,
    status TEXT,
    current_period_end TIMESTAMPTZ,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        usa.plan_code,
        usa.status,
        usa.current_period_end,
        EXTRACT(DAY FROM usa.current_period_end - NOW())::INTEGER as days_remaining
    FROM public.user_subscriptions_active usa
    WHERE UPPER(usa.user_id) = UPPER(p_user_id)
    AND usa.status = 'active'
    AND usa.current_period_end > NOW()
    ORDER BY usa.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 10. Verificar se as tabelas foram criadas
SELECT 
    'Tabelas criadas com sucesso!' as status,
    COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('stripe_webhooks', 'stripe_checkout_sessions', 'user_subscriptions_active');





















