-- Script para testar a contagem de petições na página de configurações

-- 1. Verificar todas as petições existentes
SELECT 
  id,
  title,
  client_id,
  LENGTH(client_id) as client_id_length,
  created_at
FROM public.petitions
ORDER BY created_at DESC;

-- 2. Verificar se há caracteres NULL no client_id
SELECT 
  id,
  title,
  client_id,
  LENGTH(client_id) as client_id_length,
  client_id ~ '[\x00-\x1F\x7F]' as has_control_chars,
  created_at
FROM public.petitions
WHERE client_id ~ '[\x00-\x1F\x7F]'
ORDER BY created_at DESC;

-- 3. Contar petições por client_id (com e sem limpeza)
SELECT 
  client_id,
  LENGTH(client_id) as original_length,
  TRIM(REPLACE(REPLACE(client_id, '\0', ''), '[\x00-\x1F\x7F]', '')) as cleaned_client_id,
  LENGTH(TRIM(REPLACE(REPLACE(client_id, '\0', ''), '[\x00-\x1F\x7F]', ''))) as cleaned_length,
  COUNT(*) as petition_count
FROM public.petitions
GROUP BY client_id, LENGTH(client_id), TRIM(REPLACE(REPLACE(client_id, '\0', ''), '[\x00-\x1F\x7F]', ''))
ORDER BY petition_count DESC;

-- 4. Testar a consulta que será usada na página de configurações
-- (simulando o client_id do usuário atual)
SELECT 
  COUNT(*) as total_petitions
FROM public.petitions
WHERE client_id = 'SEU_USER_ID_AQUI'; -- Substitua pelo ID real do usuário

-- 5. Verificar se há petições com client_id limpo
SELECT 
  COUNT(*) as total_petitions_cleaned
FROM public.petitions
WHERE TRIM(REPLACE(REPLACE(client_id, '\0', ''), '[\x00-\x1F\x7F]', '')) = 'SEU_USER_ID_AQUI'; -- Substitua pelo ID real do usuário
















