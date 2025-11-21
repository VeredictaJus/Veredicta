-- ========================================
-- CORREÇÃO DEFINITIVA DO SALDO
-- ========================================

-- 1️⃣ Ver o que existe atualmente
SELECT * FROM writer_balance;

-- 2️⃣ DELETAR TUDO (limpar)
DELETE FROM writer_balance;

-- 3️⃣ CRIAR registro com o UID correto (exatamente como está no código)
INSERT INTO writer_balance (
  writer_id, 
  total_earned, 
  penalties_total, 
  available_balance, 
  created_at, 
  updated_at
)
VALUES (
  'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2', 
  60.00, 
  0.00, 
  60.00, 
  NOW(), 
  NOW()
);

-- 4️⃣ Verificar (deve mostrar 1 registro)
SELECT 
  writer_id,
  total_earned,
  available_balance,
  penalties_total,
  LENGTH(writer_id) as tamanho_uid
FROM writer_balance;

-- 5️⃣ Testar query EXATA que o código usa
SELECT 
  total_earned, 
  available_balance, 
  penalties_total
FROM writer_balance
WHERE writer_id = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- 6️⃣ Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_writer_balance_writer_id 
ON writer_balance(writer_id);







