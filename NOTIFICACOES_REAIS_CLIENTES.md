# 📋 Sistema de Notificações REAIS para Clientes

## ✅ O Que Está Implementado e Funcionando

### 🔔 **Tipos de Notificações Automáticas para Clientes**

---

## 1️⃣ **NOTIFICAÇÕES DE PLANOS**

### 🟠 **Plano Expirando em Breve** (`plan_expiring_soon`)
- **Quando:** 7, 3 ou 1 dia antes do `next_billing_date`
- **Como funciona:**
  - Edge Function `check-plan-expiry` roda diariamente via `pg_cron` (+ backup GitHub Actions)
  - Verifica assinaturas ativas com `plan_code != 'free'`
  - Cria notificação automática
- **Mensagem:** "Seu plano [Nome] (R$ X/mês) expira em [Data]. Renove agora..."
- **Redirecionamento:** `/client/plans`

### 🔴 **Plano Expirado** (`plan_expired`)
- **Quando:** `next_billing_date` passou
- **Como funciona:**
  - Edge Function detecta e atualiza `status` para `expired`
  - Cria notificação automática
- **Mensagem:** "Seu plano [Nome] (R$ X/mês) expirou. Renove agora..."
- **Redirecionamento:** `/client/plans`

### 🔴 **Limite de Petições Atingido** (`limit_reached`)
- **Quando:** Cliente tenta criar petição e atingiu o limite
- **Como funciona:**
  - Verificação em `NewPetition.tsx` antes de submeter
  - Chama `PlanNotificationService.notifyLimitReached()`
- **Mensagem:** "Você atingiu o limite de X petições do plano [Nome] (R$ X/mês)..."
- **Redirecionamento:** `/client/plans`

### 🟡 **Limite Próximo (80%)** (`limit_near`)
- **Quando:** Cliente usa ≥80% do limite de petições
- **Como funciona:**
  - Após criar petição com sucesso em `NewPetition.tsx`
  - Chama `PlanNotificationService.checkAndNotifyNearLimit()`
- **Mensagem:** "Você usou X de Y petições do seu plano [Nome] (Z%). Considere upgrade..."
- **Redirecionamento:** `/client/plans`

---

## 2️⃣ **NOTIFICAÇÕES DE PETIÇÕES**

### 🔵 **Status de Petição** (`petition`)
- **Quando:** Petição é aprovada, rejeitada, revisada, etc.
- **Como funciona:** 
  - Redator/Admin atualiza status no sistema
  - Sistema cria notificação (ainda não implementado automaticamente)
- **Mensagem:** "Sua petição [Título] foi [status]"
- **Redirecionamento:** `/client/petitions/[ID]` ✅ **específico**

---

## 3️⃣ **NOTIFICAÇÕES DE MENSAGENS**

### 🟢 **Nova Mensagem** (`message`)
- **Quando:** Alguém envia mensagem para o cliente
- **Como funciona:**
  - Sistema de chat cria notificação (quando implementado)
- **Mensagem:** "[Nome] enviou uma mensagem"
- **Redirecionamento:** `/client/chat?conversation=[ID]` ✅ **específico**

### 🔘 **Suporte** (`support`)
- **Quando:** Suporte responde ticket
- **Como funciona:**
  - Sistema de suporte cria notificação (quando implementado)
- **Mensagem:** "Suporte respondeu seu ticket"
- **Redirecionamento:** `/client/chat?conversation=[ID]` ✅ **específico**

---

## 4️⃣ **NOTIFICAÇÕES DE PAGAMENTO**

### 🟣 **Pagamento** (`payment`)
- **Quando:** Pagamento aprovado, pendente, etc.
- **Como funciona:**
  - Sistema de pagamento cria notificação (quando implementado)
- **Mensagem:** "Pagamento de R$ X aprovado"
- **Redirecionamento:** `/client/plans`

---

## 🔧 **Como as Notificações São Criadas**

### **Automáticas (Planos)**
1. **Edge Function `check-plan-expiry`**
   - Roda todo dia às 9h (UTC) via `pg_cron`
   - Backup diário via GitHub Actions
   - Busca assinaturas ativas
   - Cria notificações de expiração

2. **PlanNotificationService (Frontend)**
   - Roda ao criar petição (`NewPetition.tsx`)
   - Roda ao fazer login (`NewAuthContext.tsx`)
   - Verifica limites e cria notificações

### **Manuais (Outras)**
```typescript
// Exemplo: Ao aprovar uma petição
await DatabaseService.createNotification({
  user_id: clientId,
  title: '✅ Petição Aprovada',
  message: 'Sua petição "Ação de Cobrança" foi aprovada pelo redator.',
  type: 'petition',
  priority: 'high',
  is_read: false,
  related_entity_type: 'petition',
  related_entity_id: petitionId
});
```

---

## 🎯 **Como Testar com Dados Reais**

### **Teste 1: Limite de Petições**
1. Login como cliente com plano FREE (limite: 1)
2. Tente criar 2 petições
3. ✅ Deve aparecer notificação de limite atingido

### **Teste 2: Plano Expirando**
1. Atualizar `next_billing_date` para daqui a 1 dia:
```sql
UPDATE user_subscriptions 
SET next_billing_date = NOW() + INTERVAL '1 day'
WHERE user_id = 'seu_firebase_uid';
```
2. Invocar Edge Function:
```sql
SELECT net.http_post(
  url := 'https://seu-projeto.supabase.co/functions/v1/check-plan-expiry',
  headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
);
```
3. ✅ Deve criar notificação de plano expirando

### **Teste 3: Verificação ao Login**
1. Faça logout
2. Faça login novamente
3. ✅ `PlanNotificationService.runAllChecks()` roda automaticamente

---

## 📊 **Monitoramento**

### **Verificar Notificações Criadas**
```sql
SELECT 
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_read = false) as nao_lidas
FROM app_2d8133c678_notifications
WHERE user_id = 'seu_firebase_uid'
GROUP BY type;
```

### **Verificar Próximas Expirações**
```sql
SELECT 
  up.email,
  us.plan_code,
  us.next_billing_date,
  EXTRACT(DAY FROM (us.next_billing_date - NOW())) as dias_restantes
FROM user_subscriptions us
LEFT JOIN user_profiles up ON us.user_id = up.firebase_uid
WHERE us.status = 'active'
  AND us.plan_code != 'free'
ORDER BY us.next_billing_date ASC;
```

---

## ✅ **Checklist de Implementação**

### **Completo**
- ✅ Notificações de plano expirando
- ✅ Notificações de plano expirado
- ✅ Notificações de limite atingido
- ✅ Notificações de limite próximo (80%)
- ✅ Redirecionamentos específicos por ID
- ✅ Página completa de notificações
- ✅ Sistema de filtros e ordenação
- ✅ Dark mode
- ✅ Marcar como lida
- ✅ Marcar todas como lidas
- ✅ Edge Function + Cron Job
- ✅ Integração no login
- ✅ Integração na criação de petições

### **Pendente (Futuro)**
- ⏳ Notificações automáticas de status de petição
- ⏳ Notificações automáticas de mensagens/chat
- ⏳ Notificações automáticas de pagamento
- ⏳ Email notifications
- ⏳ Push notifications

---

## 🚀 **Sistema Pronto para Produção!**

Todas as notificações de **planos** estão funcionando automaticamente.
As outras notificações (petições, mensagens, pagamentos) serão criadas quando você implementar essas funcionalidades específicas usando `DatabaseService.createNotification()`.










