-- Script para corrigir prazos de petições já criadas
-- Este script atualiza petições que têm prazo igual à data de criação

-- 1. Primeiro, vamos ver quais petições precisam ser corrigidas
SELECT
  id,
  title,
  priority,
  created_at,
  deadline,
  CASE
    WHEN deadline = created_at THEN 'PRECISA CORREÇÃO'
    ELSE 'OK'
  END as status_prazo
FROM public.petitions
WHERE deadline = created_at
ORDER BY created_at DESC;

-- 2. Função para calcular feriados brasileiros
CREATE OR REPLACE FUNCTION get_brazilian_holidays(year_param INTEGER)
RETURNS TABLE(holiday_date DATE)
LANGUAGE plpgsql
AS $$
DECLARE
  easter_date DATE;
BEGIN
  -- Calcular Páscoa usando algoritmo de Gauss
  WITH easter_calc AS (
    SELECT 
      CASE 
        WHEN (year_param % 19) + 
             FLOOR(year_param / 100) - 
             FLOOR(FLOOR(year_param / 100) / 4) - 
             FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
             15) % 30 = 0 THEN 30
        ELSE ((year_param % 19) + 
              FLOOR(year_param / 100) - 
              FLOOR(FLOOR(year_param / 100) / 4) - 
              FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
              15) % 30
      END as h,
      FLOOR(year_param % 100 / 4) as i,
      (year_param % 100) % 4 as k,
      (32 + 2 * ((year_param % 100) % 4) + 2 * FLOOR(year_param % 100 / 4) - 
       CASE 
         WHEN (year_param % 19) + 
              FLOOR(year_param / 100) - 
              FLOOR(FLOOR(year_param / 100) / 4) - 
              FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
              15) % 30 = 0 THEN 30
         ELSE ((year_param % 19) + 
               FLOOR(year_param / 100) - 
               FLOOR(FLOOR(year_param / 100) / 4) - 
               FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
               15) % 30
       END - 
       (year_param % 100) % 4) % 7 as l,
      FLOOR(((year_param % 19) + 
             FLOOR(year_param / 100) - 
             FLOOR(FLOOR(year_param / 100) / 4) - 
             FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
             15) % 30 + 
             FLOOR(year_param % 100 / 4) + 
             (32 + 2 * ((year_param % 100) % 4) + 2 * FLOOR(year_param % 100 / 4) - 
              CASE 
                WHEN (year_param % 19) + 
                     FLOOR(year_param / 100) - 
                     FLOOR(FLOOR(year_param / 100) / 4) - 
                     FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                     15) % 30 = 0 THEN 30
                ELSE ((year_param % 19) + 
                      FLOOR(year_param / 100) - 
                      FLOOR(FLOOR(year_param / 100) / 4) - 
                      FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                      15) % 30
              END - 
              (year_param % 100) % 4) % 7 - 
             7 * FLOOR(((year_param % 19) + 
                        FLOOR(year_param / 100) - 
                        FLOOR(FLOOR(year_param / 100) / 4) - 
                        FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                        15) % 30 + 
                        FLOOR(year_param % 100 / 4) + 
                        (32 + 2 * ((year_param % 100) % 4) + 2 * FLOOR(year_param % 100 / 4) - 
                         CASE 
                           WHEN (year_param % 19) + 
                                FLOOR(year_param / 100) - 
                                FLOOR(FLOOR(year_param / 100) / 4) - 
                                FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                                15) % 30 = 0 THEN 30
                           ELSE ((year_param % 19) + 
                                 FLOOR(year_param / 100) - 
                                 FLOOR(FLOOR(year_param / 100) / 4) - 
                                 FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                                 15) % 30
                         END - 
                         (year_param % 100) % 4) % 7) / 451) as m
  )
  SELECT 
    DATE(year_param, 
         FLOOR(((year_param % 19) + 
                FLOOR(year_param / 100) - 
                FLOOR(FLOOR(year_param / 100) / 4) - 
                FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                15) % 30 + 
                FLOOR(year_param % 100 / 4) + 
                (32 + 2 * ((year_param % 100) % 4) + 2 * FLOOR(year_param % 100 / 4) - 
                 CASE 
                   WHEN (year_param % 19) + 
                        FLOOR(year_param / 100) - 
                        FLOOR(FLOOR(year_param / 100) / 4) - 
                        FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                        15) % 30 = 0 THEN 30
                   ELSE ((year_param % 19) + 
                         FLOOR(year_param / 100) - 
                         FLOOR(FLOOR(year_param / 100) / 4) - 
                         FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                         15) % 30
                 END - 
                 (year_param % 100) % 4) % 7 - 
                7 * FLOOR(((year_param % 19) + 
                           FLOOR(year_param / 100) - 
                           FLOOR(FLOOR(year_param / 100) / 4) - 
                           FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                           15) % 30 + 
                           FLOOR(year_param % 100 / 4) + 
                           (32 + 2 * ((year_param % 100) % 4) + 2 * FLOOR(year_param % 100 / 4) - 
                            CASE 
                              WHEN (year_param % 19) + 
                                   FLOOR(year_param / 100) - 
                                   FLOOR(FLOOR(year_param / 100) / 4) - 
                                   FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                                   15) % 30 = 0 THEN 30
                              ELSE ((year_param % 19) + 
                                    FLOOR(year_param / 100) - 
                                    FLOOR(FLOOR(year_param / 100) / 4) - 
                                    FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                                    15) % 30
                            END - 
                            (year_param % 100) % 4) % 7) / 451) + 114) / 31),
         ((year_param % 19) + 
          FLOOR(year_param / 100) - 
          FLOOR(FLOOR(year_param / 100) / 4) - 
          FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
          15) % 30 + 
          FLOOR(year_param % 100 / 4) + 
          (32 + 2 * ((year_param % 100) % 4) + 2 * FLOOR(year_param % 100 / 4) - 
           CASE 
             WHEN (year_param % 19) + 
                  FLOOR(year_param / 100) - 
                  FLOOR(FLOOR(year_param / 100) / 4) - 
                  FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                  15) % 30 = 0 THEN 30
             ELSE ((year_param % 19) + 
                   FLOOR(year_param / 100) - 
                   FLOOR(FLOOR(year_param / 100) / 4) - 
                   FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                   15) % 30
           END - 
           (year_param % 100) % 4) % 7 - 
          7 * FLOOR(((year_param % 19) + 
                     FLOOR(year_param / 100) - 
                     FLOOR(FLOOR(year_param / 100) / 4) - 
                     FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                     15) % 30 + 
                     FLOOR(year_param % 100 / 4) + 
                     (32 + 2 * ((year_param % 100) % 4) + 2 * FLOOR(year_param % 100 / 4) - 
                      CASE 
                        WHEN (year_param % 19) + 
                             FLOOR(year_param / 100) - 
                             FLOOR(FLOOR(year_param / 100) / 4) - 
                             FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                             15) % 30 = 0 THEN 30
                        ELSE ((year_param % 19) + 
                              FLOOR(year_param / 100) - 
                              FLOOR(FLOOR(year_param / 100) / 4) - 
                              FLOOR((FLOOR(year_param / 100) - FLOOR((FLOOR(year_param / 100) + 8) / 25) + 1) / 3) + 
                              15) % 30
                      END - 
                      (year_param % 100) % 4) % 7) / 451) + 114) % 31 + 1
  INTO easter_date;
  
  -- Retornar feriados fixos
  RETURN QUERY VALUES 
    (DATE(year_param, 1, 1)),   -- Confraternização Universal
    (DATE(year_param, 4, 21)),  -- Tiradentes
    (DATE(year_param, 5, 1)),    -- Dia do Trabalhador
    (DATE(year_param, 9, 7)),    -- Independência do Brasil
    (DATE(year_param, 10, 12)),  -- Nossa Senhora Aparecida
    (DATE(year_param, 11, 2)),   -- Finados
    (DATE(year_param, 11, 15)),  -- Proclamação da República
    (DATE(year_param, 12, 25)), -- Natal
    (easter_date - INTERVAL '2 days'), -- Sexta-feira Santa
    (easter_date - INTERVAL '47 days'), -- Carnaval (aproximado)
    (easter_date + INTERVAL '60 days');  -- Corpus Christi (aproximado)
END;
$$;

-- 3. Função para verificar se é fim de semana
CREATE OR REPLACE FUNCTION is_weekend(check_date DATE)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXTRACT(DOW FROM check_date) IN (0, 6); -- Domingo = 0, Sábado = 6
END;
$$;

-- 4. Função para verificar se é feriado
CREATE OR REPLACE FUNCTION is_holiday(check_date DATE)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM get_brazilian_holidays(EXTRACT(YEAR FROM check_date)::INTEGER)
    WHERE holiday_date = check_date
  );
END;
$$;

-- 5. Função para calcular prazo considerando feriados e fins de semana
CREATE OR REPLACE FUNCTION calculate_business_deadline(start_date TIMESTAMP WITH TIME ZONE, business_days INTEGER)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
  current_date DATE := start_date::DATE;
  days_added INTEGER := 0;
BEGIN
  WHILE days_added < business_days LOOP
    current_date := current_date + INTERVAL '1 day';
    
    -- Pular fins de semana e feriados
    IF NOT is_weekend(current_date) AND NOT is_holiday(current_date) THEN
      days_added := days_added + 1;
    END IF;
  END LOOP;
  
  RETURN current_date::TIMESTAMP WITH TIME ZONE;
END;
$$;

-- 6. Agora vamos corrigir as petições existentes
UPDATE public.petitions
SET deadline = CASE
  WHEN priority = 'urgent' OR priority = 'high' THEN 
    calculate_business_deadline(created_at, 2)
  ELSE 
    calculate_business_deadline(created_at, 4)
END
WHERE deadline = created_at;

-- 7. Verificar o resultado
SELECT
  id,
  title,
  priority,
  created_at,
  deadline,
  EXTRACT(DAY FROM (deadline - created_at)) as dias_diferenca
FROM public.petitions
ORDER BY created_at DESC;

-- 8. Limpar funções temporárias (opcional)
-- DROP FUNCTION IF EXISTS get_brazilian_holidays(INTEGER);
-- DROP FUNCTION IF EXISTS is_weekend(DATE);
-- DROP FUNCTION IF EXISTS is_holiday(DATE);
-- DROP FUNCTION IF EXISTS calculate_business_deadline(TIMESTAMP WITH TIME ZONE, INTEGER);
















