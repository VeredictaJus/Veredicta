-- ========================================
-- FORÇAR PETIÇÃO A APARECER COMO DISPONÍVEL
-- ========================================
-- Garante que a petição PET-2025-0007 apareça na lista de disponíveis

-- ========================================
-- 1️⃣ VERIFICAR ESTADO ATUAL
-- ========================================
SELECT 
  id,
  display_id,
  title,
  status,
  assigned_writer_id,
  deadline,
  updated_at
FROM petitions
WHERE display_id = 'PET-2025-0007'
   OR title = 'ggggggg'
   OR id = '8e8b35a3-ea0b-4a75-9968-7069c050a25b';

-- ========================================
-- 2️⃣ GARANTIR QUE ESTÁ DISPONÍVEL
-- ========================================
-- Força status 'available' e garante que não está atribuída
UPDATE petitions
SET 
  status = 'available',  -- Mudar de 'pending' para 'available' para garantir
  assigned_writer_id = NULL,  -- Garantir que está NULL
  updated_at = NOW()  -- Atualizar timestamp para forçar refresh
WHERE (display_id = 'PET-2025-0007' OR title = 'ggggggg')
  AND id = '8e8b35a3-ea0b-4a75-9968-7069c050a25b';

-- ========================================
-- 3️⃣ VERIFICAR RESULTADO
-- ========================================
SELECT 
  id,
  display_id,
  title,
  status,
  assigned_writer_id,
  updated_at,
  CASE 
    WHEN status IN ('pending', 'available') AND assigned_writer_id IS NULL 
    THEN '✅ DISPONÍVEL'
    ELSE '❌ NÃO DISPONÍVEL'
  END as status_disponibilidade
FROM petitions
WHERE display_id = 'PET-2025-0007'
   OR title = 'ggggggg'
   OR id = '8e8b35a3-ea0b-4a75-9968-7069c050a25b';

-- ========================================
-- 4️⃣ TESTAR QUERY DO FRONTEND
-- ========================================
-- Esta query deve retornar a petição
SELECT 
  p.*
FROM petitions p
WHERE p.status IN ('pending', 'available')
  AND p.assigned_writer_id IS NULL
  AND (p.display_id = 'PET-2025-0007' OR p.id = '8e8b35a3-ea0b-4a75-9968-7069c050a25b')
ORDER BY p.created_at DESC;




