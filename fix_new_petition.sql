-- CORREÇÃO DEFINITIVA: Remover caractere NULL da nova petição

-- 1. Atualizar o client_id removendo o caractere NULL
UPDATE public.petitions 
SET client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1'
WHERE id = 'cfele2ea-78e9-47d6-9e96-23afe0a844c9';

-- 2. Verificar se foi corrigido
SELECT 
  id,
  client_id,
  LENGTH(client_id) as length,
  ASCII(SUBSTRING(client_id, -1, 1)) as last_char_ascii,
  title,
  status
FROM public.petitions
WHERE id = 'cfele2ea-78e9-47d6-9e96-23afe0a844c9';

-- 3. Testar busca com o client_id corrigido
SELECT * FROM public.petitions 
WHERE client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';
















