-- CORREÇÃO: Remover caracteres NULL do client_id

-- 1. Ver o client_id com caracteres especiais visíveis
SELECT 
  client_id,
  LENGTH(client_id) as length,
  REPLACE(client_id, CHR(0), '[NULL]') as client_id_with_null_marked
FROM public.petitions;

-- 2. Atualizar o client_id removendo caracteres NULL
UPDATE public.petitions 
SET client_id = TRIM(TRAILING CHR(0) FROM client_id)
WHERE client_id LIKE '%' || CHR(0) || '%';

-- 3. Verificar se foi corrigido
SELECT 
  client_id,
  LENGTH(client_id) as new_length,
  ASCII(SUBSTRING(client_id, -1, 1)) as last_char_ascii
FROM public.petitions;

-- 4. Testar busca com o client_id limpo
SELECT * FROM public.petitions 
WHERE client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';
















