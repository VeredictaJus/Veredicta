-- ========================================
-- CORRIGIR ACESSO DO ADMIN À TABELA petition_files
-- ========================================

-- Adicionar políticas para admin ver e gerenciar TODOS os arquivos

-- Política: Admins podem ver TODOS os arquivos de petições
CREATE POLICY "allow_admins_read_all_petition_files" ON petition_files
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = get_firebase_uid()
    AND role = 'admin'
  )
);

-- Política: Admins podem inserir arquivos em qualquer petição
CREATE POLICY "allow_admins_insert_petition_files" ON petition_files
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = get_firebase_uid()
    AND role = 'admin'
  )
);

-- Política: Admins podem atualizar qualquer arquivo
CREATE POLICY "allow_admins_update_petition_files" ON petition_files
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = get_firebase_uid()
    AND role = 'admin'
  )
);

-- Política: Admins podem deletar qualquer arquivo
CREATE POLICY "allow_admins_delete_petition_files" ON petition_files
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = get_firebase_uid()
    AND role = 'admin'
  )
);

-- Política: Redatores podem inserir arquivos nas petições atribuídas a eles
CREATE POLICY "allow_writers_insert_petition_files" ON petition_files
FOR INSERT WITH CHECK (
  petition_id IN (
    SELECT id FROM petitions WHERE writer_id = get_firebase_uid()
  )
  AND uploaded_by = get_firebase_uid()
);

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'petition_files'
ORDER BY policyname;







