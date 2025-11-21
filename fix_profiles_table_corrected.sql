-- 🔧 CORRIGIR TABELA PROFILES: ADICIONAR COLUNA full_name
-- Primeiro, vamos ver a estrutura atual da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 🔧 ADICIONAR COLUNA full_name SE NÃO EXISTIR
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 🔧 ATUALIZAR DADOS EXISTENTES COM NOMES BASEADOS NO EMAIL
UPDATE profiles 
SET full_name = CASE 
  WHEN email LIKE '%client%' THEN 'Cliente'
  WHEN email LIKE '%writer%' THEN 'Redator'
  WHEN email LIKE '%support%' THEN 'Suporte Veredicta'
  WHEN email LIKE '%admin%' THEN 'Admin Veredicta'
  WHEN email LIKE '%lawyer%' THEN 'Advogado'
  ELSE 'Usuário'
END
WHERE full_name IS NULL;

-- 🔧 INSERIR DADOS DE TESTE (AGORA COM full_name)
INSERT INTO profiles (id, email, role, full_name) VALUES
  ('client-123', 'client1@example.com', 'client', 'Cliente Um'),
  ('support-456', 'support@veredicta.com', 'support', 'Suporte Veredicta'),
  ('writer-789', 'writer1@example.com', 'writer', 'Redator Um'),
  ('lawyer-101', 'lawyer1@example.com', 'lawyer', 'Advogado Um'),
  ('admin-202', 'admin@veredicta.com', 'admin', 'Admin Veredicta')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- 🔍 VERIFICAR DADOS FINAIS
SELECT id, email, role, full_name, created_at 
FROM profiles 
ORDER BY role, full_name;























