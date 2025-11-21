-- TESTE: Verificar se a régua está recebendo informações reais

-- 1. Verificar todas as petições existentes
SELECT 
  id,
  client_id,
  LENGTH(client_id) as client_id_length,
  title,
  status,
  created_at
FROM public.petitions
ORDER BY created_at DESC;

-- 2. Contar petições por client_id específico
SELECT 
  client_id,
  COUNT(*) as total_petitions
FROM public.petitions
GROUP BY client_id;

-- 3. Verificar se há caracteres especiais no client_id
SELECT 
  client_id,
  LENGTH(client_id) as length,
  ASCII(SUBSTRING(client_id, -1, 1)) as last_char_ascii
FROM public.petitions;
















