# 🧪 **GUIA DE TESTES: SISTEMA DE PRAZOS 18H + TOLERÂNCIA**

## 📋 **RESUMO DO NOVO PADRÃO**

- **Horário oficial de entrega:** 18h (horário de Brasília)
- **Tolerância:** 60 minutos (até 19h)
- **Após 19h:** Petição considerada ATRASADA e multa aplicada
- **Alerta automático:** 17h (1h antes do deadline)

---

## 🧪 **TESTES RECOMENDADOS**

### **1️⃣ TESTE: Criação de Nova Petição**

**Objetivo:** Verificar se o deadline é calculado corretamente para 18h

**Passos:**
1. Faça login como **cliente**
2. Vá em **"Nova Petição"**
3. Preencha os dados e crie uma petição
4. Verifique o **deadline** exibido na petição

**Resultado esperado:**
- Deadline deve mostrar **18h** do dia calculado
- Exemplo: Se criar hoje às 10h (plano START), deadline = 3 dias úteis às 18h

**Verificação no Supabase:**
```sql
-- Verificar deadline de petições recentes
SELECT 
  id,
  title,
  created_at AT TIME ZONE 'America/Sao_Paulo' as criado_em,
  deadline AT TIME ZONE 'America/Sao_Paulo' as prazo_ate,
  EXTRACT(HOUR FROM deadline AT TIME ZONE 'America/Sao_Paulo') as hora_deadline
FROM petitions
ORDER BY created_at DESC
LIMIT 5;
```
**Resultado esperado:** `hora_deadline` deve ser **18**

---

### **2️⃣ TESTE: Entrega Dentro do Prazo (Antes das 18h)**

**Objetivo:** Verificar que entregas antes das 18h são aceitas normalmente

**Passos:**
1. Crie uma petição de teste
2. Aceite como **redator**
3. **Entregue a petição ANTES das 18h** (ex: 17h30)
4. Verifique se não há multa aplicada

**Resultado esperado:**
- Petição aceita normalmente
- Sem multa aplicada
- Status muda para "Em Revisão" ou "Entregue"

**Verificação no Supabase:**
```sql
-- Verificar se não há multa para petição entregue antes das 18h
SELECT 
  p.id,
  p.title,
  p.deadline AT TIME ZONE 'America/Sao_Paulo' as deadline,
  p.updated_at AT TIME ZONE 'America/Sao_Paulo' as entregue_em,
  EXTRACT(HOUR FROM p.updated_at AT TIME ZONE 'America/Sao_Paulo') as hora_entrega,
  CASE 
    WHEN EXISTS (SELECT 1 FROM writer_penalties WHERE petition_id = p.id) THEN '❌ TEM MULTA (ERRO!)'
    ELSE '✅ SEM MULTA (CORRETO)'
  END as status_multa
FROM petitions p
WHERE p.status IN ('delivered', 'completed', 'approved')
  AND p.updated_at < p.deadline + INTERVAL '60 minutes'
ORDER BY p.updated_at DESC
LIMIT 5;
```

---

### **3️⃣ TESTE: Entrega Dentro da Tolerância (18h-19h)**

**Objetivo:** Verificar que entregas entre 18h e 19h são aceitas (tolerância)

**Passos:**
1. Crie uma petição com deadline hoje às 18h
2. Aceite como **redator**
3. **Entregue a petição ENTRE 18h e 19h** (ex: 18h30)
4. Verifique se não há multa aplicada

**Resultado esperado:**
- Petição aceita normalmente (dentro da tolerância)
- Sem multa aplicada
- Status muda normalmente

**Verificação no Supabase:**
```sql
-- Verificar petições entregues na tolerância (18h-19h)
SELECT 
  p.id,
  p.title,
  p.deadline AT TIME ZONE 'America/Sao_Paulo' as deadline,
  p.updated_at AT TIME ZONE 'America/Sao_Paulo' as entregue_em,
  EXTRACT(HOUR FROM p.updated_at AT TIME ZONE 'America/Sao_Paulo') as hora_entrega,
  CASE 
    WHEN p.updated_at > p.deadline + INTERVAL '60 minutes' THEN '❌ FORA DA TOLERÂNCIA'
    WHEN p.updated_at > p.deadline THEN '✅ DENTRO DA TOLERÂNCIA (18h-19h)'
    ELSE '✅ ANTES DO DEADLINE'
  END as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM writer_penalties WHERE petition_id = p.id) THEN '❌ TEM MULTA'
    ELSE '✅ SEM MULTA'
  END as multa
FROM petitions p
WHERE p.status IN ('delivered', 'completed', 'approved')
  AND p.updated_at >= p.deadline
  AND p.updated_at <= p.deadline + INTERVAL '60 minutes'
ORDER BY p.updated_at DESC
LIMIT 5;
```

---

### **4️⃣ TESTE: Entrega Após a Tolerância (Após 19h)**

**Objetivo:** Verificar que entregas após 19h aplicam multa automaticamente

**Passos:**
1. Crie uma petição com deadline hoje às 18h
2. Aceite como **redator**
3. **Aguarde até após 19h** (ou simule no banco)
4. Verifique se a multa foi aplicada automaticamente

**Resultado esperado:**
- Multa de 50% do valor da petição aplicada
- Petição reatribuída (removida do redator)
- Status volta para "Pendente"

**Simulação no Supabase (para teste rápido):**
```sql
-- 1. Criar petição de teste com deadline passado (após 19h)
-- ATENÇÃO: Use apenas para testes!

-- Criar petição de teste
INSERT INTO petitions (
  id,
  title,
  description,
  client_id,
  status,
  assigned_writer_id,
  created_at,
  deadline,
  price,
  type,
  priority
)
VALUES (
  gen_random_uuid(),
  'TESTE - Prazo 18h',
  'Petição de teste para validar sistema de prazos',
  'SEU_CLIENT_ID_AQUI', -- Substitua pelo ID de um cliente real
  'in_progress',
  'SEU_WRITER_ID_AQUI', -- Substitua pelo ID de um redator real
  NOW() - INTERVAL '2 days', -- Criada há 2 dias
  (NOW() - INTERVAL '2 hours')::DATE || ' 18:00:00'::TIME AT TIME ZONE 'America/Sao_Paulo', -- Deadline há 2 horas (já passou das 19h)
  100.00,
  'Inicial',
  'normal'
)
RETURNING id, title, deadline;

-- 2. Executar verificação de multas (simula o cron job)
SELECT * FROM check_and_apply_late_penalties();

-- 3. Verificar se multa foi aplicada
SELECT 
  wp.*,
  p.title as petition_title,
  p.deadline
FROM writer_penalties wp
JOIN petitions p ON wp.petition_id = p.id
WHERE p.title LIKE 'TESTE%'
ORDER BY wp.applied_at DESC;

-- 4. Limpar teste (após validar)
-- DELETE FROM writer_penalties WHERE petition_id IN (SELECT id FROM petitions WHERE title LIKE 'TESTE%');
-- DELETE FROM petitions WHERE title LIKE 'TESTE%';
```

---

### **5️⃣ TESTE: Alerta Automático às 17h**

**Objetivo:** Verificar se o alerta é enviado 1h antes do deadline (17h)

**Passos:**
1. Crie uma petição que tenha deadline hoje às 18h
2. Aceite como **redator**
3. **Aguarde até 17h** (ou verifique notificações)
4. Verifique se recebeu notificação de alerta

**Resultado esperado:**
- Notificação criada às 17h
- Mensagem: "⏰ Prazo Próximo! Falta aproximadamente 60 minutos..."

**Verificação no Supabase:**
```sql
-- Verificar notificações de deadline criadas
SELECT 
  n.id,
  n.user_id,
  n.title,
  n.body,
  n.created_at AT TIME ZONE 'America/Sao_Paulo' as criado_em,
  EXTRACT(HOUR FROM n.created_at AT TIME ZONE 'America/Sao_Paulo') as hora_notificacao,
  p.deadline AT TIME ZONE 'America/Sao_Paulo' as deadline_peticao,
  EXTRACT(EPOCH FROM (p.deadline - n.created_at)) / 60 as minutos_antes_deadline
FROM app_2d8133c678_notifications n
JOIN petitions p ON n.related_entity_id = p.id::TEXT
WHERE n.type = 'deadline'
  AND n.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY n.created_at DESC
LIMIT 10;
```

**Resultado esperado:** `minutos_antes_deadline` deve estar entre **55-65 minutos** (1h antes)

---

### **6️⃣ TESTE: Cálculo de Deadline por Plano**

**Objetivo:** Verificar se cada plano calcula o deadline corretamente

**Testes por Plano:**

#### **Plano ELITE (mesmo dia):**
- Pedido às 10h → Deadline: **Hoje às 18h**
- Pedido às 15h → Deadline: **Próximo dia útil às 18h**

#### **Plano PRO (2 dias úteis):**
- Pedido Segunda 10h → Deadline: **Quarta às 18h**

#### **Plano START (3 dias úteis):**
- Pedido Segunda 10h → Deadline: **Quinta às 18h**

**Verificação no Supabase:**
```sql
-- Testar cálculo para cada plano
SELECT 
  'ELITE - Pedido 10h' as teste,
  calculate_deadline_18h('2025-01-15 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 0) AT TIME ZONE 'America/Sao_Paulo' as deadline;

SELECT 
  'PRO - Pedido Segunda 10h' as teste,
  calculate_deadline_18h('2025-01-13 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 2) AT TIME ZONE 'America/Sao_Paulo' as deadline;

SELECT 
  'START - Pedido Segunda 10h' as teste,
  calculate_deadline_18h('2025-01-13 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 3) AT TIME ZONE 'America/Sao_Paulo' as deadline;
```

---

## 🔍 **VERIFICAÇÕES GERAIS**

### **Verificar Funções Ativas:**
```sql
SELECT 
  proname as function_name,
  CASE 
    WHEN proname = 'calculate_deadline_18h' THEN '✅ Ativa'
    WHEN proname = 'is_petition_late' THEN '✅ Ativa'
    WHEN proname = 'check_and_apply_late_penalties' THEN '✅ Ativa'
    ELSE 'Outra função'
  END as status
FROM pg_proc
WHERE proname IN ('calculate_deadline_18h', 'is_petition_late', 'check_and_apply_late_penalties');
```

### **Verificar Trigger Ativo:**
```sql
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE 
    WHEN tgname = 'trigger_auto_calculate_deadline' THEN '✅ Ativo'
    ELSE 'Outro trigger'
  END as status
FROM pg_trigger
WHERE tgname = 'trigger_auto_calculate_deadline';
```

### **Verificar Cron Job (se configurado):**
```sql
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  CASE 
    WHEN active THEN '✅ Ativo'
    ELSE '❌ Inativo'
  END as status
FROM cron.job
WHERE jobname LIKE '%penalty%' OR jobname LIKE '%deadline%';
```

---

## ✅ **CHECKLIST DE VALIDAÇÃO**

- [ ] Novas petições têm deadline às 18h
- [ ] Entregas antes das 18h são aceitas sem multa
- [ ] Entregas entre 18h-19h são aceitas sem multa (tolerância)
- [ ] Entregas após 19h aplicam multa automaticamente
- [ ] Multa é de 50% do valor da petição (não do saldo total)
- [ ] Petições atrasadas são reatribuídas automaticamente
- [ ] Alertas são enviados às 17h (1h antes do deadline)
- [ ] Cálculo de deadline funciona corretamente para cada plano

---

## 🚨 **TROUBLESHOOTING**

### **Problema: Deadline não está sendo calculado**
- Verifique se o trigger está ativo
- Verifique se o cliente tem plano ativo
- Execute manualmente: `SELECT auto_calculate_petition_deadline();`

### **Problema: Multa não está sendo aplicada**
- Verifique se o cron job está ativo
- Execute manualmente: `SELECT * FROM check_and_apply_late_penalties();`
- Verifique se a petição passou das 19h (deadline + 60min)

### **Problema: Alerta não está sendo enviado**
- Verifique se o cron job de notificações está ativo
- Execute manualmente: `SELECT * FROM check_and_notify_deadlines();`
- Verifique se a petição está em andamento e tem deadline próximo

---

**Data de criação:** Janeiro 2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para Testes




