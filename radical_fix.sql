-- SOLUÇÃO RADICAL: Forçar remoção do caractere NULL

-- 1. Atualizar usando REGEXP_REPLACE para remover TODOS os caracteres não imprimíveis
UPDATE public.petitions 
SET client_id = REGEXP_REPLACE(client_id, '[[:cntrl:]]', '', 'g')
WHERE client_id ~ '[[:cntrl:]]';

-- 2. Verificar se foi corrigido
SELECT 
  client_id,
  LENGTH(client_id) as length,
  ASCII(SUBSTRING(client_id, -1, 1)) as last_char_ascii
FROM public.petitions;

-- 3. Testar busca com o client_id corrigido
SELECT * FROM public.petitions 
WHERE client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';

-- 4. Se ainda não funcionar, deletar e recriar a petição
DELETE FROM public.petitions 
WHERE client_id ~ '[[:cntrl:]]';

-- 5. Verificar se a petição foi removida
SELECT COUNT(*) as total_petitions FROM public.petitions;
















