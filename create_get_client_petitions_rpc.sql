-- Criar função para buscar petições do cliente (bypass RLS)
CREATE OR REPLACE FUNCTION public.get_client_petitions(p_client_id uuid)
RETURNS SETOF public.petitions
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.petitions
  WHERE client_id = p_client_id
  ORDER BY created_at DESC;
$$;

-- Dar permissão para anon e authenticated
GRANT EXECUTE ON FUNCTION public.get_client_petitions(uuid) TO anon, authenticated;
















