-- ========================================
-- PERMITIR CLIENTE VER ARQUIVOS DAS SUAS PETIÇÕES
-- ========================================

-- Política: Clientes podem ver arquivos das suas próprias petições
CREATE POLICY "allow_clients_read_their_petition_files" ON petition_files
FOR SELECT USING (
  petition_id IN (
    SELECT id FROM petitions 
    WHERE client_id = get_firebase_uid()
  )
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







