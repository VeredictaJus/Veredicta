-- ========================================
-- CORREÇÃO: Erro "column is_active does not exist"
-- ========================================
-- Este script corrige as funções que tentam acessar a coluna "is_active"
-- que não existe na tabela profiles_v2
-- ========================================

-- Corrigir função notify_all_admins
CREATE OR REPLACE FUNCTION notify_all_admins(
  p_title TEXT,
  p_body TEXT,
  p_type TEXT DEFAULT 'system',
  p_priority TEXT DEFAULT 'normal',
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
  notifications_count INTEGER := 0;
BEGIN
  -- Buscar todos os admins ativos
  FOR admin_record IN
    SELECT firebase_uid
    FROM profiles_v2
    WHERE role = 'admin'
    -- ✅ CORREÇÃO: Removido is_active pois não existe na tabela profiles_v2
  LOOP
    -- Criar notificação para cada admin
    INSERT INTO app_2d8133c678_notifications (
      user_id,
      title,
      body,
      type,
      priority,
      related_entity_type,
      related_entity_id,
      is_read,
      created_at
    ) VALUES (
      admin_record.firebase_uid,
      p_title,
      p_body,
      p_type,
      p_priority,
      p_related_entity_type,
      p_related_entity_id,
      false,
      NOW()
    );
    
    notifications_count := notifications_count + 1;
  END LOOP;
  
  RETURN notifications_count;
END;
$$;

-- Corrigir função check_pending_invoices_for_payment
CREATE OR REPLACE FUNCTION check_pending_invoices_for_payment()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  writer_record RECORD;
  previous_month INTEGER;
  previous_year INTEGER;
  current_day INTEGER;
  current_month INTEGER;
  current_year INTEGER;
  pending_writers_count INTEGER := 0;
  total_amount DECIMAL(12, 2) := 0;
  writers_list TEXT := '';
BEGIN
  -- Obter data atual
  current_day := EXTRACT(DAY FROM NOW())::INTEGER;
  current_month := EXTRACT(MONTH FROM NOW())::INTEGER;
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Calcular mês anterior
  previous_month := current_month - 1;
  previous_year := current_year;
  
  IF previous_month = 0 THEN
    previous_month := 12;
    previous_year := current_year - 1;
  END IF;
  
  -- Só executar no dia 05 de cada mês
  IF current_day = 5 THEN
    -- Buscar redatores que têm saldo disponível mas não enviaram nota fiscal do mês anterior
    FOR writer_record IN
      SELECT 
        wb.writer_id,
        wb.available_balance,
        -- ✅ CORREÇÃO: Removido p.name pois não existe na tabela profiles_v2
        COALESCE(p.full_name, 'Redator') as writer_name,
        p.email as writer_email
      FROM writer_balance wb
      JOIN profiles_v2 p ON p.firebase_uid = wb.writer_id
      WHERE wb.available_balance > 0
        AND p.role = 'writer'
        -- ✅ CORREÇÃO: Removido p.is_active pois não existe na tabela profiles_v2
        AND NOT EXISTS (
          -- Verificar se enviou nota fiscal do mês anterior
          SELECT 1
          FROM writer_invoices wi
          WHERE wi.writer_id = wb.writer_id
            AND wi.month_ref = previous_month
            AND wi.year_ref = previous_year
            AND wi.status IN ('pending', 'approved')
        )
    LOOP
      pending_writers_count := pending_writers_count + 1;
      total_amount := total_amount + writer_record.available_balance;
      
      -- Adicionar à lista de redatores
      IF writers_list != '' THEN
        writers_list := writers_list || ', ';
      END IF;
      writers_list := writers_list || format('%s (R$ %.2f)', 
        writer_record.writer_name, 
        writer_record.available_balance
      );
    END LOOP;
    
    -- Se houver redatores pendentes, notificar admins
    IF pending_writers_count > 0 THEN
      PERFORM notify_all_admins(
        p_title := '💰 Lembrete: Pagamento de Notas Fiscais',
        p_body := format(
          'Hoje é dia 05! Verifique as notas fiscais dos redatores para processar os pagamentos do mês anterior. ' ||
          'Total de %s redator(es) pendente(s) com saldo total de R$ %.2f. ' ||
          'Redatores: %s',
          pending_writers_count,
          total_amount,
          writers_list
        ),
        p_type := 'system',
        p_priority := 'high',
        p_related_entity_type := 'payment',
        p_related_entity_id := NULL
      );
      
      RAISE NOTICE '✅ Notificações enviadas para admins sobre pagamento de notas fiscais: % redatores pendentes', pending_writers_count;
    END IF;
  END IF;
  
  RETURN pending_writers_count;
END;
$$;

-- ========================================
-- ✅ CONCLUSÃO
-- ========================================
-- Este script corrige as funções que tentavam acessar a coluna "is_active"
-- que não existe na tabela profiles_v2. As referências foram removidas.
-- 
-- Para aplicar:
-- 1. Execute este script no Supabase SQL Editor
-- 2. O erro "column is_active does not exist" não deve mais ocorrer
-- 3. O upload de avatar deve funcionar corretamente


