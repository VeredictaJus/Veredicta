-- SOLUÇÃO DEFINITIVA: Corrigir client_id com caractere NULL

-- 1. Atualizar removendo o caractere NULL do final
UPDATE public.petitions 
SET client_id = SUBSTRING(client_id, 1, 27)
WHERE LENGTH(client_id) = 28;

-- 2. Verificar se foi corrigido
SELECT 
  client_id,
  LENGTH(client_id) as length,
  ASCII(SUBSTRING(client_id, -1, 1)) as last_char_ascii
FROM public.petitions;

-- 3. Testar busca com o client_id corrigido
SELECT * FROM public.petitions 
WHERE client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';

-- 4. Se ainda não funcionar, usar LIKE para busca flexível
SELECT * FROM public.petitions 
WHERE client_id LIKE 'yNTB2V3606WPxV0z1ZxLQNV1tCm1%';
















