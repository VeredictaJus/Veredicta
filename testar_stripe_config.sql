-- Script para testar configuração do Stripe
-- Execute este script para verificar se as configurações estão corretas

-- 1. Verificar estrutura da tabela plans
SELECT 
  'Estrutura da tabela plans' as categoria,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'plans' 
ORDER BY ordinal_position;

-- 2. Verificar planos configurados no banco
SELECT 
  'Planos configurados no banco' as categoria,
  plan_code,
  name,
  price,
  is_active
FROM plans
WHERE is_active = true
ORDER BY price;

-- 3. Verificar assinaturas existentes e seus status
SELECT 
  'Assinaturas existentes' as categoria,
  us.user_id,
  us.plan_code,
  us.status,
  p.name as plan_name,
  p.price as plan_price,
  us.created_at
FROM user_subscriptions us
JOIN plans p ON us.plan_code = p.plan_code
ORDER BY us.created_at DESC;

-- 4. Verificar se há webhooks do Stripe configurados
SELECT 
  'Configurações de webhook' as categoria,
  'Verificar se webhooks do Stripe estão configurados no dashboard' as info;

-- 5. Verificar estrutura da tabela de pagamentos (se existir)
SELECT 
  'Estrutura de tabelas de pagamento' as categoria,
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name LIKE '%payment%' 
   OR table_name LIKE '%stripe%'
   OR table_name LIKE '%transaction%'
ORDER BY table_name, ordinal_position;
