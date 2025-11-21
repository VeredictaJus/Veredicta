-- 🔍 DIAGNÓSTICO DO PROBLEMA DE ARQUIVAMENTO DE CONVERSAS
-- Este script verifica as políticas RLS e permissões para arquivamento

-- 1. Verificar políticas RLS atuais para conversas
SELECT 
  '🔍 POLÍTICAS RLS PARA CONVERSAS' as info,
  policyname,
  cmd as operation,
  qual as condition,
  with_check as check_condition
FROM pg_policies 
WHERE tablename = 'conversations'
ORDER BY policyname;

-- 2. Verificar se usuário é participante da conversa
SELECT 
  '🔍 VERIFICAÇÃO DE PARTICIPAÇÃO' as info,
  cp.conversation_id,
  cp.user_id,
  cp.role,
  cp.joined_at,
  c.title,
  c.created_by,
  c.status
FROM conversation_participants cp
JOIN conversations c ON c.id = cp.conversation_id
WHERE cp.conversation_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY cp.joined_at;

-- 3. Verificar conversa específica que está falhando
SELECT 
  '🔍 CONVERSA ESPECÍFICA' as info,
  id,
  title,
  status,
  created_by,
  created_at,
  updated_at
FROM conversations 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 4. Testar UPDATE na conversa (simulação)
-- NOTA: Este teste pode falhar se as políticas RLS estiverem restritivas
SELECT 
  '🧪 TESTE DE ATUALIZAÇÃO' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = '550e8400-e29b-41d4-a716-446655440000'
    ) THEN '✅ Conversa existe'
    ELSE '❌ Conversa não existe'
  END as conversa_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000'
    ) THEN '✅ Tem participantes'
    ELSE '❌ Sem participantes'
  END as participantes_status;

-- 5. Verificar se há políticas que usam auth.uid() (problemático com Firebase)
SELECT 
  '🔍 POLÍTICAS COM AUTH.UID()' as info,
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN '❌ USA auth.uid() - PROBLEMÁTICO'
    ELSE '✅ SEM auth.uid() - OK'
  END as status
FROM pg_policies 
WHERE tablename = 'conversations'
  AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%');























