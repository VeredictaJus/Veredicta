-- Função RPC para buscar petições do cliente (mesma tabela que a criação usa)
create or replace function public.get_client_petitions(p_client_id text)
returns json
language sql
security definer
set search_path = public
as $$
  select json_agg(to_json(petitions.*))
  from petitions
  where client_id::text = p_client_id::text
  order by created_at desc;
$$;

-- Dar permissão para anon e authenticated
grant execute on function public.get_client_petitions(text) to anon, authenticated;
















