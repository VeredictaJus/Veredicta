# 🚨 SISTEMA DE MULTAS E REATRIBUIÇÃO AUTOMÁTICA

## 📋 **RESUMO**

Quando um redator atrasa a entrega de uma petição:

### ✅ **O QUE ACONTECE AUTOMATICAMENTE:**

1. **💰 MULTA DE 50%**
   - 50% do valor da petição é descontado do saldo do redator
   - Exemplo: Petição R$ 100,00 → Multa R$ 50,00
   - Desconto é irreversível e aplicado automaticamente

2. **🔄 REATRIBUIÇÃO DA PETIÇÃO**
   - A petição é **REMOVIDA** do redator atrasado
   - O campo `assigned_writer_id` é limpo (NULL)
   - O status volta para `pending` (disponível)
   - Outro redator pode pegar a petição no dashboard

3. **📊 REGISTRO NO SISTEMA**
   - Multa registrada na tabela `writer_penalties`
   - Saldo atualizado na tabela `writer_balance`
   - Cliente será atendido por outro redator

---

## 🗂️ **ARQUIVOS CRIADOS/ATUALIZADOS**

### 1. **create_penalty_system.sql** (✅ Base do sistema)
   - Tabelas: `writer_balance`, `writer_penalties`
   - Funções: `is_petition_late`, `apply_late_penalty`, `check_and_apply_late_penalties`
   - Executa verificação de multas

### 2. **setup_automatic_penalty_cron.sql** (✅ Job automático)
   - Configura `pg_cron` para executar a cada hora
   - Aplica multas automaticamente
   - Monitoramento de execuções

### 3. **update_penalty_reassign_petition.sql** (✅ Reatribuição)
   - Atualiza função `apply_late_penalty`
   - Adiciona lógica de desatribuição
   - Volta petição para `pending`

### 4. **ManualRedator.tsx** (✅ Documentação)
   - Seção "Prazos e Penalidades" atualizada
   - Explicação sobre multa e reatribuição
   - Alertas e regras importantes

---

## 🚀 **PASSOS PARA ATIVAR**

### **Passo 1: Executar SQL de Reatribuição**

1. Abra o arquivo: `update_penalty_reassign_petition.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Execute (Run)

**✅ Isso vai atualizar a função para incluir a reatribuição**

---

### **Passo 2: Testar Manualmente**

Execute no Supabase:

```sql
-- Ver petições atrasadas
SELECT
  p.id,
  p.display_id,
  p.title,
  p.assigned_writer_id,
  p.status,
  p.deadline,
  NOW() - p.deadline as tempo_atrasado
FROM petitions p
WHERE p.assigned_writer_id IS NOT NULL
  AND p.status IN ('in_progress', 'assigned')
  AND p.deadline < NOW()
ORDER BY p.deadline ASC;
```

Se houver petições atrasadas, execute:

```sql
-- Aplicar multa e reatribuir
SELECT * FROM check_and_apply_late_penalties();
```

---

### **Passo 3: Verificar Resultado**

```sql
-- Ver petições que voltaram para pending
SELECT
  p.id,
  p.display_id,
  p.title,
  p.status,
  p.assigned_writer_id, -- Deve estar NULL
  wp.amount as multa_aplicada,
  wp.applied_at as data_multa
FROM petitions p
LEFT JOIN writer_penalties wp ON p.id = wp.petition_id
WHERE wp.applied_at > NOW() - INTERVAL '1 hour'
ORDER BY wp.applied_at DESC;
```

---

## 🔄 **FLUXO COMPLETO**

```
1. ⏰ Deadline passa (após 18h)
   ↓
2. 🤖 Job automático detecta atraso
   ↓
3. 💰 Multa de 50% aplicada ao redator
   ↓
4. 🔄 Petição desatribuída (assigned_writer_id = NULL)
   ↓
5. 📋 Status volta para 'pending'
   ↓
6. 👥 Outro redator pode pegar no dashboard
   ↓
7. ✅ Cliente recebe petição com novo redator
```

---

## 📊 **QUERIES DE MONITORAMENTO**

### **Ver saldos dos redatores:**
```sql
SELECT 
  writer_id,
  total_earned,
  penalties_total,
  available_balance,
  ROUND((penalties_total / NULLIF(total_earned, 0)) * 100, 2) as percentual_multas
FROM writer_balance
ORDER BY penalties_total DESC;
```

### **Ver multas recentes:**
```sql
SELECT 
  wp.writer_id,
  wp.amount as multa,
  wp.reason,
  wp.applied_at,
  p.title as petition_title,
  p.status as status_atual
FROM writer_penalties wp
LEFT JOIN petitions p ON wp.petition_id = p.id
ORDER BY wp.applied_at DESC
LIMIT 10;
```

### **Ver histórico do job automático:**
```sql
SELECT 
  jobid,
  runid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'apply-late-penalties-hourly')
ORDER BY start_time DESC
LIMIT 10;
```

---

## ⚠️ **IMPORTANTE**

### **Para o Redator:**
- ❌ Não terá mais acesso à petição após atraso
- 💰 Multa é irreversível
- 📧 Deve entrar em contato com suporte ANTES do vencimento em casos excepcionais

### **Para o Cliente:**
- ✅ Será atendido por outro redator automaticamente
- 📋 Petição não ficará parada
- 🎯 Qualidade do serviço mantida

### **Para o Admin:**
- 📊 Pode monitorar multas aplicadas
- 🔍 Pode ver histórico de reatribuições
- ⚙️ Job roda automaticamente a cada hora

---

## 🎯 **PRÓXIMOS PASSOS (OPCIONAL)**

1. **Notificações:**
   - Enviar email ao redator sobre multa
   - Notificar cliente sobre novo redator
   - Alertar redatores sobre petição disponível

2. **Dashboard Admin:**
   - Gráfico de multas aplicadas
   - Estatísticas de reatribuições
   - Ranking de pontualidade dos redatores

3. **Sistema de Reincidência:**
   - Multas progressivas (75%, 100%)
   - Suspensão temporária após X multas
   - Revisão de performance

---

## 📞 **SUPORTE**

Em caso de dúvidas sobre o sistema:
- Consulte o Manual do Redator
- Entre em contato com suporte técnico
- Verifique os logs no Supabase

---

**Data de implementação:** Novembro 2025
**Versão:** 1.0
**Status:** ✅ Pronto para produção







