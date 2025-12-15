-- ========================================
-- PERMITIR REDATORES VISUALIZAR ARQUIVOS
-- ========================================
-- Redatores precisam acessar anexos das petições disponíveis
-- e das petições já atribuídas a eles.
-- Esta política mantém o acesso dos clientes (já existente)
-- e acrescenta a regra para redatores.

CREATE POLICY "allow_writers_read_petition_files" ON petition_files
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM petitions p
    WHERE p.id = petition_files.petition_id
      AND (
        p.status IN ('pending', 'available')
        OR p.assigned_writer_id = get_firebase_uid()
      )
  )
);

-- Conferir políticas existentes para conferência
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




