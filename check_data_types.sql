-- Script para verificar tipos de dados e fazer o JOIN correto

-- 1. Ver tipo de submitted_by na tabela invoices
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'app_2d8133c678_invoices' 
  AND column_name = 'submitted_by';

-- 2. Ver tipo de firebase_uid na tabela user_profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
  AND column_name = 'firebase_uid';

-- 3. Query corrigida com CAST para fazer o JOIN funcionar
SELECT 
  i.id,
  i.submitted_by,
  up.full_name as writer_name,
  up.email as writer_email,
  i.period_year,
  i.period_month,
  i.amount,
  i.file_path,
  i.status,
  i.submitted_at
FROM app_2d8133c678_invoices i
LEFT JOIN user_profiles up ON i.submitted_by::text = up.firebase_uid
ORDER BY i.submitted_at DESC;

-- 4. Contar usuários que são redatores
SELECT 
  firebase_uid,
  full_name,
  email,
  role
FROM user_profiles
WHERE role = 'writer'
ORDER BY full_name;










