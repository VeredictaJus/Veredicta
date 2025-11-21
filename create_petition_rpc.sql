-- Função RPC para criar petições na tabela petitions (mesma tabela que a lista busca)
create or replace function public.create_petition_public(
  p_client_id text,
  p_title text,
  p_description text,
  p_type text,
  p_status text default 'pending',
  p_priority text default 'normal',
  p_price numeric default 0,
  p_deadline timestamp with time zone default now(),
  p_assigned_writer_id text default null,
  p_files text[] default '{}'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  new_petition json;
begin
  -- Inserir na tabela petitions (mesma tabela que a lista busca)
  insert into petitions (
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
  ) values (
    p_client_id::uuid,
    p_title,
    p_description,
    p_type,
    p_status,
    p_priority,
    p_price,
    p_deadline,
    p_assigned_writer_id::uuid,
    p_files
  ) returning to_json(petitions.*) into new_petition;
  
  return new_petition;
end;
$$;

-- Dar permissão para anon e authenticated
grant execute on function public.create_petition_public(text, text, text, text, text, text, numeric, timestamp with time zone, text, text[]) to anon, authenticated;
















