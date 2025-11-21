-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS para testar

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.petitions DISABLE ROW LEVEL SECURITY;

-- 2. Deletar todas as políticas existentes
DROP POLICY IF EXISTS "allow_insert_own" ON public.petitions;
DROP POLICY IF EXISTS "allow_select_own_or_assigned" ON public.petitions;
DROP POLICY IF EXISTS "allow_update_own_or_assigned" ON public.petitions;

-- 3. Testar se conseguimos buscar as petições sem RLS
SELECT COUNT(*) as total_petitions FROM public.petitions;

-- 4. Verificar se a petição específica aparece
SELECT * FROM public.petitions WHERE client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';
















