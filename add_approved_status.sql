-- Adicionar status 'approved' ao enum de status de petições
-- Este status indica que o cliente confirmou o recebimento e não precisa de correções

-- Nota: PostgreSQL não permite adicionar valores a enums diretamente em produção
-- Esta é a abordagem segura para adicionar o novo status

-- Verificar se o status já existe
DO $$
BEGIN
  -- Tentar adicionar o novo valor ao enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'approved' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'petition_status')
  ) THEN
    ALTER TYPE petition_status ADD VALUE 'approved';
    RAISE NOTICE 'Status "approved" adicionado com sucesso';
  ELSE
    RAISE NOTICE 'Status "approved" já existe';
  END IF;
END
$$;

-- Comentário explicativo
COMMENT ON TYPE petition_status IS 'Status das petições: pending, available, assigned, in_progress, pending_review, revision, delivered, approved, completed, cancelled';

-- Verificar os status disponíveis
SELECT enumlabel as status_disponivel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'petition_status')
ORDER BY enumsortorder;









