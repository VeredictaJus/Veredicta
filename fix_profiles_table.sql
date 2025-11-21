-- 🔧 CRIAR TABELA PROFILES SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT CHECK (role IN ('client', 'writer', 'admin', 'support', 'lawyer')),
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔧 CRIAR DADOS DE TESTE PARA PROFILES
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

-- 🔍 VERIFICAR DADOS INSERIDOS
SELECT id, email, role, full_name FROM profiles ORDER BY role;























