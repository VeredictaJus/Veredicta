-- Script para corrigir notas fiscais antigas sem writer_name

-- 1. Verificar notas sem writer_name
SELECT 
  id,
  writer_id,
  writer_name,
  file_path,
  status,
  submitted_at
FROM app_2d8133c678_invoices
WHERE writer_name IS NULL OR writer_name = ''
ORDER BY submitted_at DESC;

-- 2. Atualizar writer_name para notas antigas com base no writer_id
UPDATE app_2d8133c678_invoices inv
SET 
  writer_name = COALESCE(up.full_name, up.email, 'Redator'),
  updated_at = NOW()
FROM user_profiles up
WHERE inv.writer_id = up.firebase_uid
  AND (inv.writer_name IS NULL OR inv.writer_name = '');

-- 3. Verificar resultado após atualização
SELECT 
  id,
  writer_id,
  writer_name,
  file_path,
  status,
  submitted_at
FROM app_2d8133c678_invoices
ORDER BY submitted_at DESC;

-- 4. Contar quantas foram atualizadas
SELECT 
  CASE 
    WHEN writer_name IS NOT NULL AND writer_name != '' THEN 'Com nome'
    ELSE 'Sem nome'
  END as situacao,
  COUNT(*) as quantidade
FROM app_2d8133c678_invoices
GROUP BY situacao;










