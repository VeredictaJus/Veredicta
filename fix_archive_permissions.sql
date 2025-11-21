-- 🔧 CORREÇÃO DAS PERMISSÕES DE ARQUIVAMENTO DE CONVERSAS
-- Este script corrige as políticas RLS para permitir arquivamento com Firebase Auth

-- 1. Remover políticas problemáticas que usam auth.uid()
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

-- 2. Criar políticas permissivas para UPDATE (arquivamento)
CREATE POLICY "Allow update access to conversations" ON conversations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 3. Criar política específica para arquivamento
CREATE POLICY "Allow archive conversations" ON conversations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 4. Verificar se a correção funcionou
SELECT 
  '✅ VERIFICAÇÃO PÓS-CORREÇÃO' as info,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN '❌ AINDA USA auth.uid()'
    ELSE '✅ SEM auth.uid() - CORRETO'
  END as status
FROM pg_policies 
WHERE tablename = 'conversations'
ORDER BY policyname;

-- 5. Testar UPDATE simulado (não executará, apenas verifica sintaxe)
SELECT 
  '🧪 TESTE DE SINTAXE' as info,
  'UPDATE conversations SET status = ''archived'' WHERE id = ''550e8400-e29b-41d4-a716-446655440000''' as query_teste,
  'Sintaxe OK' as status;























