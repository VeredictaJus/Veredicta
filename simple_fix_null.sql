-- SOLUÇÃO SIMPLES: Corrigir client_id com caractere NULL

-- 1. Atualizar diretamente removendo caracteres NULL
UPDATE public.petitions 
SET client_id = TRIM(TRAILING FROM client_id)
WHERE LENGTH(client_id) > 27;

-- 2. Verificar se foi corrigido
SELECT 
  client_id,
  LENGTH(client_id) as length,
  ASCII(SUBSTRING(client_id, -1, 1)) as last_char_ascii
FROM public.petitions;

-- 3. Testar busca com o client_id limpo
SELECT * FROM public.petitions 
WHERE client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';

-- 4. Se ainda não funcionar, tentar com TRIM mais agressivo
UPDATE public.petitions 
SET client_id = REGEXP_REPLACE(client_id, '[^a-zA-Z0-9]', '', 'g')
WHERE client_id != REGEXP_REPLACE(client_id, '[^a-zA-Z0-9]', '', 'g');

-- 5. Testar novamente
SELECT * FROM public.petitions 
WHERE client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';
















