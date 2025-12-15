-- SOLUÇÃO FINAL: Forçar remoção completa do caractere NULL

-- 1. Atualizar usando REGEXP_REPLACE para remover TODOS os caracteres não imprimíveis
UPDATE public.petitions 
SET client_id = REGEXP_REPLACE(client_id, '[[:cntrl:]]', '', 'g')
WHERE id = '245921a8-8707-4d55-b559-527bc33edd9b';

-- 2. Verificar se foi corrigido
SELECT 
  id,
  client_id,
  LENGTH(client_id) as length,
  ASCII(SUBSTRING(client_id, -1, 1)) as last_char_ascii,
  title,
  status
FROM public.petitions
WHERE id = '245921a8-8707-4d55-b559-527bc33edd9b';

-- 3. Testar busca com o client_id corrigido
SELECT * FROM public.petitions 
WHERE client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';

-- 4. Se ainda não funcionar, usar LIKE para busca flexível
SELECT * FROM public.petitions 
WHERE client_id LIKE 'yNTB2V3606WPxV0z1ZxLQNV1tCm1%';