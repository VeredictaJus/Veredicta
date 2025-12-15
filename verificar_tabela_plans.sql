-- Script de verificação da tabela plans
-- Execute este script no Supabase Dashboard para verificar se a tabela existe e tem dados

-- 1. Verificar se a tabela existe
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'plans';

-- 2. Verificar estrutura da tabela (se existir)
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'plans'
ORDER BY ordinal_position;

-- 3. Verificar dados na tabela (se existir)
SELECT 
  id,
  name,
  price,
  petitions_included,
  additional_credit_price,
  is_active,
  recommended,
  created_at
FROM plans 
ORDER BY price;

-- 4. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'plans';

-- 5. Contar registros
SELECT COUNT(*) as total_plans FROM plans;
SELECT COUNT(*) as active_plans FROM plans WHERE is_active = true;
