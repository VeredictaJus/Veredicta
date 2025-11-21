-- Criar usuário de teste para desenvolvimento
-- Execute este comando no SQL Editor do Supabase

INSERT INTO public.profiles (
  firebase_uid,
  email,
  role,
  created_at,
  updated_at
) VALUES (
  'yNTB2V36O6WPxVOzlZxLQNV1tCm1',
  'teste@veredicta.com',
  'client',
  NOW(),
  NOW()
) ON CONFLICT (firebase_uid) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verificar se foi criado
SELECT * FROM public.profiles WHERE firebase_uid = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1';
