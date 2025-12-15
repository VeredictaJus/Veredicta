-- SOLUÇÃO DEFINITIVA: Forçar busca e correção completa

-- 1. Verificar TODAS as petições (sem filtro)
SELECT 
  id,
  client_id,
  LENGTH(client_id) as length,
  ASCII(SUBSTRING(client_id, -1, 1)) as last_char_ascii,
  title,
  status,
  created_at
FROM public.petitions
ORDER BY created_at DESC;

-- 2. Buscar com LIKE para encontrar a petição
SELECT * FROM public.petitions 
WHERE client_id LIKE '%yNTB2V3606WPxV0z1ZxLQNV1tCm1%';

-- 3. Se encontrar, atualizar o client_id para o valor correto
UPDATE public.petitions 
SET client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1'
WHERE client_id LIKE '%yNTB2V3606WPxV0z1ZxLQNV1tCm1%';

-- 4. Verificar se foi corrigido
SELECT 
  id,
  client_id,
  LENGTH(client_id) as length,
  ASCII(SUBSTRING(client_id, -1, 1)) as last_char_ascii
FROM public.petitions;

-- 5. Testar busca final
SELECT * FROM public.petitions 
WHERE client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';
















