-- Script para ver notas fiscais com a estrutura correta

-- 1. Ver todas as notas fiscais ordenadas por data de envio
SELECT 
  id,
  submitted_by,
  client_id,
  period_year,
  period_month,
  amount,
  file_path,
  status,
  submitted_at,
  reviewed_by,
  reviewed_at,
  notes
FROM app_2d8133c678_invoices
ORDER BY submitted_at DESC;

-- 2. Ver notas com nomes dos usuários (JOIN com user_profiles)
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
LEFT JOIN user_profiles up ON i.submitted_by = up.firebase_uid
ORDER BY i.submitted_at DESC;

-- 3. Contar por status
SELECT 
  status,
  COUNT(*) as quantidade
FROM app_2d8133c678_invoices
GROUP BY status
ORDER BY status;










