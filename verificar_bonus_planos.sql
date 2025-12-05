-- ✅ VERIFICAR CONFIGURAÇÃO DE BÔNUS NOS PLANOS
-- Execute este script para verificar se os bônus estão configurados corretamente

SELECT 
  'Configuração de Bônus de Renovação' as categoria,
  plan_code,
  name,
  petitions_included,
  COALESCE(renewal_bonus, 0) as renewal_bonus,
  (petitions_included + COALESCE(renewal_bonus, 0)) as total_com_bonus,
  CASE 
    WHEN plan_code = 'pro' AND COALESCE(renewal_bonus, 0) = 1 THEN '✅ Configurado corretamente'
    WHEN plan_code = 'elite' AND COALESCE(renewal_bonus, 0) = 3 THEN '✅ Configurado corretamente'
    WHEN plan_code IN ('start', 'free') AND COALESCE(renewal_bonus, 0) = 0 THEN '✅ Configurado corretamente'
    ELSE '⚠️ Verificar configuração'
  END as status
FROM plans
WHERE is_active = true
ORDER BY 
  CASE plan_code
    WHEN 'free' THEN 1
    WHEN 'start' THEN 2
    WHEN 'pro' THEN 3
    WHEN 'elite' THEN 4
    ELSE 5
  END;






















