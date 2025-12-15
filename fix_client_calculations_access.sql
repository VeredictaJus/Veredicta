-- ========================================
-- PERMITIR CLIENTE VER CÁLCULOS DAS SUAS PETIÇÕES
-- ========================================

-- Política: Clientes podem ver cálculos das suas próprias petições
CREATE POLICY "allow_clients_read_their_calculations" ON labor_calculations
FOR SELECT USING (
  id IN (
    SELECT calculation_id FROM petitions 
    WHERE client_id = get_firebase_uid()
    AND calculation_id IS NOT NULL
  )
);

-- Verificar se labor_calculations tem RLS ativado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'labor_calculations';

-- Se não tiver RLS, ativar:
-- ALTER TABLE labor_calculations ENABLE ROW LEVEL SECURITY;

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'labor_calculations'
ORDER BY policyname;







