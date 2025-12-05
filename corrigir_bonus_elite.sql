-- ✅ CORRIGIR BÔNUS DO PLANO ELITE
-- Execute este script para atualizar o renewal_bonus do plano Elite para 3

UPDATE plans 
SET renewal_bonus = 3 
WHERE plan_code = 'elite' OR name ILIKE '%elite%';

-- Verificar se foi atualizado corretamente
SELECT 
  plan_code,
  name,
  petitions_included,
  renewal_bonus,
  (petitions_included + renewal_bonus) as total_com_bonus,
  CASE 
    WHEN plan_code = 'elite' AND renewal_bonus = 3 THEN '✅ Configurado corretamente'
    ELSE '⚠️ Verificar'
  END as status
FROM plans
WHERE plan_code = 'elite';























