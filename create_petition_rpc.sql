-- Função RPC para criar petições na tabela `public.petitions`
-- Canonical signature: IDs em TEXT (Firebase UID) + flag is_pilot

CREATE OR REPLACE FUNCTION public.create_petition_public(
  p_client_id text,
  p_title text,
  p_description text,
  p_type text,
  p_status text default 'pending',
  p_priority text default 'normal',
  p_price numeric default 0,
  p_deadline timestamp with time zone default now(),
  p_assigned_writer_id text default null,
  p_files text[] default '{}',
  p_is_pilot boolean default false
)
RETURNS public.petitions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_petition public.petitions;
BEGIN
  INSERT INTO public.petitions (
    client_id,
    title,
    description,
    type,
    status,
    priority,
    price,
    deadline,
    assigned_writer_id,
    files,
    is_pilot
  ) VALUES (
    p_client_id,
    p_title,
    p_description,
    p_type,
    lower(coalesce(p_status, 'pending')),
    lower(coalesce(p_priority, 'normal')),
    p_price,
    p_deadline,
    p_assigned_writer_id,
    p_files,
    p_is_pilot
  )
  RETURNING * INTO new_petition;

  RETURN new_petition;
END;
$$;

-- Dar permissão para anon e authenticated
GRANT EXECUTE ON FUNCTION public.create_petition_public(text, text, text, text, text, text, numeric, timestamp with time zone, text, text[], boolean) TO anon, authenticated;
















