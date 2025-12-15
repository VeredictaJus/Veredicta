-- SOLUÇÃO ROBUSTA: Testar diferentes formatos de auth.uid()

-- 1. Primeiro, vamos verificar o que auth.uid() retorna
SELECT 
  auth.uid() as auth_uid_raw,
  auth.uid()::text as auth_uid_text,
  auth.uid()::uuid as auth_uid_uuid;

-- 2. Deletar todas as políticas existentes
DROP POLICY IF EXISTS "allow_insert_own" ON public.petitions;
DROP POLICY IF EXISTS "allow_select_own_or_assigned" ON public.petitions;
DROP POLICY IF EXISTS "allow_update_own_or_assigned" ON public.petitions;

-- 3. Criar políticas mais flexíveis (testando diferentes conversões)
CREATE POLICY "allow_insert_own" ON public.petitions
  FOR INSERT TO public
  WITH CHECK (
    client_id::text = auth.uid()::text OR 
    client_id = auth.uid()::uuid OR
    client_id::text = auth.uid()
  );

CREATE POLICY "allow_select_own_or_assigned" ON public.petitions
  FOR SELECT TO public
  USING (
    (client_id::text = auth.uid()::text OR client_id = auth.uid()::uuid OR client_id::text = auth.uid()) OR
    (assigned_writer_id::text = auth.uid()::text OR assigned_writer_id = auth.uid()::uuid OR assigned_writer_id::text = auth.uid())
  );

CREATE POLICY "allow_update_own_or_assigned" ON public.petitions
  FOR UPDATE TO public
  USING (
    (client_id::text = auth.uid()::text OR client_id = auth.uid()::uuid OR client_id::text = auth.uid()) OR
    (assigned_writer_id::text = auth.uid()::text OR assigned_writer_id = auth.uid()::uuid OR assigned_writer_id::text = auth.uid())
  )
  WITH CHECK (
    (client_id::text = auth.uid()::text OR client_id = auth.uid()::uuid OR client_id::text = auth.uid()) OR
    (assigned_writer_id::text = auth.uid()::text OR assigned_writer_id = auth.uid()::uuid OR assigned_writer_id::text = auth.uid())
  );

-- 4. Garantir que RLS está habilitado
ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;

-- 5. Testar se conseguimos buscar as petições
SELECT COUNT(*) as total_petitions FROM public.petitions;
















