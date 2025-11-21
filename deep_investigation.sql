-- Investigação completa: Por que a petição não aparece?

-- 1. Ver TODAS as petições (sem filtro algum)
SELECT 
  id,
  client_id,
  title,
  status,
  created_at,
  LENGTH(client_id) as client_id_length
FROM public.petitions;

-- 2. Verificar se há caracteres invisíveis no client_id
SELECT 
  client_id,
  ASCII(SUBSTRING(client_id, 1, 1)) as first_char_ascii,
  ASCII(SUBSTRING(client_id, -1, 1)) as last_char_ascii
FROM public.petitions;

-- 3. Buscar com LIKE (mais flexível)
SELECT * FROM public.petitions 
WHERE client_id LIKE '%yNTB2V3606WPxV0z1ZxLQNV1tCm1%';
















