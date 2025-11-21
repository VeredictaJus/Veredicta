-- 🔧 CORRIGIR TABELA PROFILES: USAR UUIDs VÁLIDOS
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

-- 🔧 INSERIR DADOS DE TESTE COM UUIDs VÁLIDOS
INSERT INTO profiles (id, email, role, full_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'client1@example.com', 'client', 'Cliente Um'),
  ('22222222-2222-2222-2222-222222222222', 'support@veredicta.com', 'support', 'Suporte Veredicta'),
  ('33333333-3333-3333-3333-333333333333', 'writer1@example.com', 'writer', 'Redator Um'),
  ('44444444-4444-4444-4444-444444444444', 'lawyer1@example.com', 'lawyer', 'Advogado Um'),
  ('55555555-5555-5555-5555-555555555555', 'admin@veredicta.com', 'admin', 'Admin Veredicta')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- 🔍 VERIFICAR DADOS FINAIS
SELECT id, email, role, full_name, created_at 
FROM profiles 
ORDER BY role, full_name;























