-- ============================================
-- CORREÇÃO: Adicionar coluna credits_balance
-- ============================================
-- Este script adiciona a coluna credits_balance na tabela user_profiles

-- 1. Adicionar coluna credits_balance se não existir
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0;

-- 2. Adicionar comentário na coluna
COMMENT ON COLUMN user_profiles.credits_balance IS 'Saldo de créditos do usuário para petições extras';

-- 3. Atualizar coluna para usuários existentes (se necessário)
UPDATE user_profiles 
SET credits_balance = 0 
WHERE credits_balance IS NULL;

-- 4. Tornar coluna NOT NULL após atualizar valores
ALTER TABLE user_profiles 
ALTER COLUMN credits_balance SET NOT NULL;

-- 5. Verificar se a coluna foi criada corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name = 'credits_balance';

-- ============================================
-- TESTE: Verificar se a função agora funciona
-- ============================================
-- Execute este teste após executar o script acima:
-- SELECT get_user_petition_stats('yNTB2V36O6WPxV0z1ZxLQNV1tCm1');
-- ============================================




















