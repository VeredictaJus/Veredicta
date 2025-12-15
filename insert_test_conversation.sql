-- Inserir conversa de teste para o usuário
INSERT INTO conversations (
  id,
  title,
  type,
  status,
  priority,
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Suporte Veredicta - Teste',
  'support',
  'active',
  'normal',
  'yNTB2V3606WPxVOzLZxLQNV1tCm1',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Inserir mensagem de teste para a conversa
INSERT INTO messages (
  id,
  conversation_id,
  sender_id,
  content,
  message_type,
  created_at
) 
SELECT 
  gen_random_uuid(),
  c.id,
  'yNTB2V3606WPxVOzLZxLQNV1tCm1',
  'Olá! Esta é uma mensagem de teste do sistema de chat.',
  'text',
  NOW()
FROM conversations c 
WHERE c.created_by = 'yNTB2V3606WPxVOzLZxLQNV1tCm1' 
  AND c.title = 'Suporte Veredicta - Teste'
LIMIT 1;

-- Verificar se foi inserido
SELECT 
  c.id,
  c.title,
  c.type,
  c.status,
  c.created_by,
  c.created_at,
  COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.created_by = 'yNTB2V3606WPxVOzLZxLQNV1tCm1'
GROUP BY c.id, c.title, c.type, c.status, c.created_by, c.created_at;





















