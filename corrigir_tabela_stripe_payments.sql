-- Script para corrigir a tabela stripe_payments
-- Adiciona coluna metadata que está faltando

-- 1. Adicionar coluna metadata se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stripe_payments' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE stripe_payments 
        ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        
        -- Adicionar comentário
        COMMENT ON COLUMN stripe_payments.metadata IS 'Metadados do pagamento (PIX code, expiration, etc.)';
    END IF;
END $$;

-- 2. Adicionar coluna payment_method se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stripe_payments' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE stripe_payments 
        ADD COLUMN payment_method TEXT DEFAULT 'card';
        
        -- Adicionar comentário
        COMMENT ON COLUMN stripe_payments.payment_method IS 'Método de pagamento (card, pix, etc.)';
    END IF;
END $$;

-- 3. Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'stripe_payments' 
ORDER BY ordinal_position;

-- 4. Mostrar dados de exemplo
SELECT 
    id,
    user_id,
    plan_code,
    amount,
    currency,
    status,
    payment_method,
    metadata,
    created_at
FROM stripe_payments 
ORDER BY created_at DESC 
LIMIT 5;




















