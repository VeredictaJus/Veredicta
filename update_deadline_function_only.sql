-- ========================================
-- ATUALIZAR FUNÇÃO PARA 18H (Tolerância)
-- ========================================

-- Remover função antiga
DROP FUNCTION IF EXISTS calculate_deadline_17h(TIMESTAMP WITH TIME ZONE, INTEGER);

-- Criar função com 18h (17h + 60min tolerância)
CREATE OR REPLACE FUNCTION calculate_deadline_17h(
  start_timestamp TIMESTAMP WITH TIME ZONE,
  business_days INTEGER
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
  target_date DATE;
  days_added INTEGER := 0;
  start_hour INTEGER;
  final_datetime TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Extrair hora do pedido (em horário local Brasil)
  start_hour := EXTRACT(HOUR FROM start_timestamp AT TIME ZONE 'America/Sao_Paulo');
  
  -- Começar do dia do pedido
  target_date := (start_timestamp AT TIME ZONE 'America/Sao_Paulo')::DATE;
  
  -- Se business_days = 0 (Elite - mesmo dia)
  IF business_days = 0 THEN
    -- Verificar se tem 3h disponíveis hoje (pedido até 14h) e é dia útil
    IF start_hour <= 14 AND EXTRACT(DOW FROM target_date) NOT IN (0, 6) THEN
      -- Mesmo dia às 18h (17h + 60min tolerância)
      final_datetime := (target_date::TEXT || ' 18:00:00')::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo';
      RETURN final_datetime;
    ELSE
      -- Vai para o próximo dia útil
      business_days := 1;
    END IF;
  END IF;
  
  -- Calcular dias úteis
  WHILE days_added < business_days LOOP
    target_date := target_date + INTERVAL '1 day';
    
    -- Pular fins de semana (0 = domingo, 6 = sábado)
    IF EXTRACT(DOW FROM target_date) NOT IN (0, 6) THEN
      days_added := days_added + 1;
    END IF;
  END LOOP;
  
  -- Definir horário 18h no último dia (17h + 60min tolerância)
  final_datetime := (target_date::TEXT || ' 18:00:00')::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo';
  
  RETURN final_datetime;
END;
$$;

-- Testar
SELECT calculate_deadline_17h('2025-11-03 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 0) as elite_teste;
-- Deve retornar: 2025-11-03 18:00:00-03 (ou 21:00:00 UTC)







