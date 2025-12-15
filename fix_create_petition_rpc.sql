-- Primeiro, deletar a função existente se ela existir
DROP FUNCTION IF EXISTS public.create_petition_public(text, text, text, text, text, text, numeric, timestamp with time zone, text, text[]);

-- Agora criar a nova função com os tipos corretos
CREATE OR REPLACE FUNCTION public.create_petition_public(
    p_client_id uuid,
    p_title text,
    p_description text,
    p_type text,
    p_status text,
    p_priority text,
    p_price numeric,
    p_deadline timestamp with time zone,
    p_assigned_writer_id uuid default null,
    p_files text[] default '{}'
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
        files
    )
    VALUES (
        p_client_id,
        p_title,
        p_description,
        p_type,
        p_status,
        p_priority,
        p_price,
        p_deadline,
        p_assigned_writer_id,
        p_files
    )
    RETURNING * INTO new_petition;

    RETURN new_petition;
END;
$$;

-- Dar permissão para anon e authenticated
GRANT EXECUTE ON FUNCTION public.create_petition_public(uuid, text, text, text, text, text, numeric, timestamp with time zone, uuid, text[]) TO anon, authenticated;
















