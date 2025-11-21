-- Adicionar coluna is_bonus na tabela user_subscriptions
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna is_bonus
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS is_bonus BOOLEAN DEFAULT false;

-- 2. Adicionar comentário na coluna
COMMENT ON COLUMN user_subscriptions.is_bonus IS 'Indica se o plano FREE foi dado como bônus de boas-vindas';

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_bonus 
ON user_subscriptions(is_bonus) 
WHERE is_bonus = true;

-- 4. Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
AND column_name = 'is_bonus';









