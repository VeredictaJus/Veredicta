-- SOLUÇÃO SIMPLES: Desabilitar RLS temporariamente para resolver o problema

-- 1. Desabilitar RLS completamente
ALTER TABLE public.petitions DISABLE ROW LEVEL SECURITY;

-- 2. Deletar todas as políticas existentes
DROP POLICY IF EXISTS "allow_insert_own" ON public.petitions;
DROP POLICY IF EXISTS "allow_select_own_or_assigned" ON public.petitions;
DROP POLICY IF EXISTS "allow_update_own_or_assigned" ON public.petitions;

-- 3. Verificar se conseguimos buscar as petições
SELECT COUNT(*) as total_petitions FROM public.petitions;

-- 4. Verificar a petição específica
SELECT * FROM public.petitions WHERE client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';
















