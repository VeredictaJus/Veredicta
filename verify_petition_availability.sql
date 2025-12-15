-- ========================================
-- VERIFICAR SE PETIÇÃO ESTÁ ACESSÍVEL
-- ========================================
-- Verifica se a petição PET-2025-0007 está realmente disponível

-- ========================================
-- 1️⃣ VERIFICAR STATUS E ATRIBUIÇÃO
-- ========================================
SELECT 
  p.id,
  p.display_id,
  p.title,
  p.status,
  p.assigned_writer_id,
  p.deadline,
  p.price,
  -- Verificar se atende aos critérios de "disponível"
  CASE 
    WHEN p.status IN ('pending', 'available') AND p.assigned_writer_id IS NULL 
    THEN '✅ DEVE APARECER COMO DISPONÍVEL'
    ELSE '❌ NÃO DEVE APARECER'
  END as disponibilidade,
  -- Verificar outros campos que podem afetar
  p.client_id,
  p.created_at,
  p.updated_at
FROM petitions p
WHERE p.display_id = 'PET-2025-0007'
   OR p.title = 'ggggggg'
   OR p.id = '8e8b35a3-ea0b-4a75-9968-7069c050a25b';

-- ========================================
-- 2️⃣ TESTAR QUERY EXATA QUE O FRONTEND USA
-- ========================================
-- Esta é a query que o DatabaseService.getAvailablePetitions() executa
SELECT 
  p.*
FROM petitions p
WHERE p.status IN ('pending', 'available')
  AND p.assigned_writer_id IS NULL
  AND (p.display_id = 'PET-2025-0007' OR p.title = 'ggggggg')
ORDER BY p.created_at DESC;

-- ========================================
-- 3️⃣ VERIFICAR SE HÁ FILTROS DE ESPECIALIDADE
-- ========================================
-- Se a petição tem campo 'area' e o redator tem filtro de especialidade ativo
SELECT 
  p.id,
  p.display_id,
  p.title,
  p.area,
  p.status,
  p.assigned_writer_id
FROM petitions p
WHERE p.display_id = 'PET-2025-0007'
   OR p.title = 'ggggggg';

-- ========================================
-- 4️⃣ FORÇAR STATUS 'available' SE NECESSÁRIO
-- ========================================
-- Alguns sistemas podem preferir 'available' ao invés de 'pending'
-- Execute apenas se a petição não estiver aparecendo:

UPDATE petitions
SET 
  status = 'available',
  updated_at = NOW()
WHERE (display_id = 'PET-2025-0007' OR title = 'ggggggg')
  AND status = 'pending'
  AND assigned_writer_id IS NULL;

-- Verificar resultado
SELECT 
  id,
  display_id,
  title,
  status,
  assigned_writer_id,
  updated_at
FROM petitions
WHERE display_id = 'PET-2025-0007' OR title = 'ggggggg';

-- ========================================
-- 5️⃣ VERIFICAR RLS (Row Level Security)
-- ========================================
-- Verificar se há políticas RLS que podem estar bloqueando
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'petitions'
  AND schemaname = 'public';




