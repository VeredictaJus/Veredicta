-- SIMULAR USO DO PLANO FREE (para teste do Cenário 2)
-- Execute este script para simular que um cliente já usou o FREE

-- 1. Criar usuário de teste que já usou FREE
INSERT INTO user_profiles (
  firebase_uid,
  email,
  role,
  cnpj,
  cpf,
  company_name,
  contact_person,
  phone
) VALUES (
  'teste-usado-free-123',
  'teste2@exemplo.com',
  'client',
  '12345678000199', -- CPF/CNPJ que será reutilizado
  '12345678901',
  'Empresa Teste 2',
  'João Silva',
  '11999999999'
) ON CONFLICT (firebase_uid) DO NOTHING;

-- 2. Criar plano FREE que foi USADO (status = 'used')
INSERT INTO user_subscriptions (
  user_id,
  plan_code,
  status,
  next_billing_date,
  is_bonus,
  created_at
) VALUES (
  'teste-usado-free-123',
  'free',
  'used', -- Status quando petição foi usada
  NOW() + INTERVAL '999 days',
  false, -- Não é bônus, é o FREE normal
  NOW() - INTERVAL '30 days' -- Criado há 30 dias
) ON CONFLICT (user_id, plan_code, status) DO NOTHING;

-- 3. Verificar se foi criado
SELECT 
  up.email,
  up.cnpj,
  up.cpf,
  us.plan_code,
  us.status,
  us.is_bonus,
  us.created_at
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id
WHERE up.email = 'teste2@exemplo.com';









