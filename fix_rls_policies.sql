-- CORREÇÃO: Ajustar políticas RLS para trabalhar com UUID em vez de TEXT

-- 1. Deletar políticas existentes
DROP POLICY IF EXISTS "allow_insert_own" ON public.petitions;
DROP POLICY IF EXISTS "allow_select_own_or_assigned" ON public.petitions;
DROP POLICY IF EXISTS "allow_update_own_or_assigned" ON public.petitions;

-- 2. Criar novas políticas com conversão correta de tipos
CREATE POLICY "allow_insert_own" ON public.petitions
  FOR INSERT TO public
  WITH CHECK (client_id::text = auth.uid());

CREATE POLICY "allow_select_own_or_assigned" ON public.petitions
  FOR SELECT TO public
  USING (client_id::text = auth.uid() OR assigned_writer_id::text = auth.uid());

CREATE POLICY "allow_update_own_or_assigned" ON public.petitions
  FOR UPDATE TO public
  USING (client_id::text = auth.uid() OR assigned_writer_id::text = auth.uid())
  WITH CHECK (client_id::text = auth.uid() OR assigned_writer_id::text = auth.uid());

-- 3. Verificar se RLS está habilitado
ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;