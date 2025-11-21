-- ========================================
-- DEBUG: Notificações Não Aparecem no Sino
-- ========================================

-- 1️⃣ VERIFICAR SE A NOTIFICAÇÃO EXISTE NO BANCO
SELECT 
  id,
  user_id,
  title,
  body,
  type,
  priority,
  is_read,
  created_at
FROM app_2d8133c678_notifications
WHERE user_id = 'yNTB2V3606WPxV0zlZxLQNV1tCm1'
ORDER BY created_at DESC
LIMIT 5;

-- 2️⃣ VERIFICAR POLÍTICAS RLS ATIVAS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS "using_clause",
  with_check AS "with_check_clause"
FROM pg_policies
WHERE tablename = 'app_2d8133c678_notifications';

-- 3️⃣ VERIFICAR SE O USER_ID EXISTE EM profiles_v2
SELECT 
  firebase_uid,
  full_name,
  email,
  role,
  LENGTH(firebase_uid) as uid_length
FROM profiles_v2
WHERE firebase_uid ILIKE 'yNTB2V3606WPxV0zlZxLQNV1tCm1'
OR firebase_uid = 'yNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 4️⃣ VERIFICAR CASE SENSITIVITY
-- Comparar os UIDs
SELECT 
  n.user_id as notif_user_id,
  p.firebase_uid as profile_uid,
  n.user_id = p.firebase_uid as "Match Exato?",
  LOWER(n.user_id) = LOWER(p.firebase_uid) as "Match Case-Insensitive?"
FROM app_2d8133c678_notifications n
CROSS JOIN profiles_v2 p
WHERE p.role = 'writer'
AND LOWER(n.user_id) LIKE LOWER('%yNTB2V3606WPxV0z%')
LIMIT 1;

-- 5️⃣ TESTAR RLS COMO SE FOSSE O USUÁRIO
-- IMPORTANTE: Esta query simula o RLS
SET LOCAL role postgres;
SET LOCAL "request.jwt.claim.sub" = 'yNTB2V3606WPxV0zlZxLQNV1tCm1';

SELECT COUNT(*) as "Notificações Visíveis com RLS"
FROM app_2d8133c678_notifications
WHERE user_id = 'yNTB2V3606WPxV0zlZxLQNV1tCm1';

RESET role;

-- 6️⃣ VERIFICAR SE RLS ESTÁ HABILITADO
SELECT 
  tablename,
  rowsecurity as "RLS Habilitado?"
FROM pg_tables
WHERE tablename = 'app_2d8133c678_notifications';

-- 7️⃣ TESTE: CRIAR NOTIFICAÇÃO COM UID EM MINÚSCULAS
-- (Execute se houver problema de case sensitivity)
/*
SELECT create_notification(
  p_user_id := LOWER('yNTB2V3606WPxV0zlZxLQNV1tCm1'),
  p_title := '🧪 Teste Case Sensitivity',
  p_body := 'Notificação criada com UID em minúsculas',
  p_type := 'system',
  p_priority := 'high'
);
*/

-- 8️⃣ VERIFICAR TODAS AS NOTIFICAÇÕES (SEM FILTRO)
SELECT 
  user_id,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_read = FALSE) as nao_lidas
FROM app_2d8133c678_notifications
GROUP BY user_id;

-- ========================================
-- 🔧 CORREÇÕES POSSÍVEIS
-- ========================================

-- CORREÇÃO A: Se houver problema de case sensitivity
-- Atualizar política RLS para usar ILIKE (case-insensitive)
/*
DROP POLICY IF EXISTS "Users can view own notifications" ON app_2d8133c678_notifications;

CREATE POLICY "Users can view own notifications" 
ON app_2d8133c678_notifications
FOR SELECT 
USING (
  LOWER(user_id) = LOWER(auth.uid()::TEXT)
);
*/

-- CORREÇÃO B: Se RLS estiver bloqueando
-- Desabilitar RLS temporariamente para teste
/*
ALTER TABLE app_2d8133c678_notifications DISABLE ROW LEVEL SECURITY;
*/

-- CORREÇÃO C: Reabilitar RLS depois do teste
/*
ALTER TABLE app_2d8133c678_notifications ENABLE ROW LEVEL SECURITY;
*/

-- ========================================
-- 📋 CHECKLIST DE DEBUG
-- ========================================
/*
1. [ ] Notificação existe no banco? (Query 1)
2. [ ] Políticas RLS estão ativas? (Query 2)
3. [ ] UID do redator existe em profiles_v2? (Query 3)
4. [ ] UIDs são case-sensitive? (Query 4)
5. [ ] RLS permite leitura? (Query 5)
6. [ ] RLS está habilitado? (Query 6)
7. [ ] Há erros no console do navegador?
8. [ ] NotificationProvider está carregando?
*/







