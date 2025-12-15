# 🎁 **IMPLEMENTAR SISTEMA DE BÔNUS DE RENOVAÇÃO**

## 🚨 **PROBLEMA IDENTIFICADO:**
- **Interface:** Mostra "+1 petição bônus" (Pro) e "+3 petições bônus" (Elite)
- **Realidade:** Bônus NÃO são adicionados automaticamente na renovação
- **Resultado:** Clientes não recebem as petições prometidas

## ✅ **SOLUÇÃO COMPLETA:**

### **1. Execute o SQL no Supabase:**
```sql
-- Execute o arquivo: implementar_bonus_renovacao.sql
-- Isso criará:
-- - Coluna renewal_bonus na tabela plans
// - Tabela subscription_renewals
// - Funções para processar bônus
```

### **2. Configure o Webhook do Stripe:**
1. **Acesse:** https://dashboard.stripe.com/webhooks
2. **Crie webhook** para: `invoice.payment_succeeded`
3. **URL:** `https://seudominio.com/api/webhooks/stripe`
4. **Copie o webhook secret** para o .env

### **3. Crie o arquivo de webhook:**
- **Local:** `src/api/webhooks/stripe.ts`
- **Conteúdo:** Copie de `webhook_stripe_renovacao.ts`

### **4. Atualize o .env:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 **COMO FUNCIONARÁ:**

### **Renovação Automática:**
1. **Stripe cobra** a mensalidade
2. **Webhook dispara** `invoice.payment_succeeded`
3. **Sistema processa** renovação com bônus
4. **Petições extras** são adicionadas ao saldo

### **Bônus por Plano:**
- **Pro:** +1 petição bônus na renovação
- **Elite:** +3 petições bônus na renovação
- **Start:** Sem bônus (0 petições extras)

### **Controle no Banco:**
- **Tabela:** `subscription_renewals`
- **Registro:** Cada renovação com bônus
- **Auditoria:** Histórico completo de bônus

## 🚀 **TESTE DO SISTEMA:**

### **1. Teste Manual:**
```sql
-- Simular renovação com bônus
SELECT process_subscription_renewal(
  'user_id_aqui',
  'pro',
  'sub_stripe_id_aqui'
);
```

### **2. Verificar Bônus:**
```sql
-- Ver informações de bônus do usuário
SELECT get_renewal_bonus_info('user_id_aqui');
```

### **3. Histórico de Renovações:**
```sql
-- Ver todas as renovações com bônus
SELECT * FROM subscription_renewals 
WHERE user_id = 'user_id_aqui'
ORDER BY renewal_date DESC;
```

## 📊 **RESULTADO ESPERADO:**

### **Para Cliente Pro:**
- **Renovação:** 14 petições base + 1 bônus = 15 petições
- **Saldo:** +1 petição adicionada automaticamente
- **Notificação:** "Renovação processada! Você recebeu 1 petição bônus!"

### **Para Cliente Elite:**
- **Renovação:** 70 petições base + 3 bônus = 73 petições
- **Saldo:** +3 petições adicionadas automaticamente
- **Notificação:** "Renovação processada! Você recebeu 3 petições bônus!"

## ⚠️ **IMPORTANTE:**
- **Webhook:** Deve estar configurado no Stripe
- **SSL:** URL do webhook deve ser HTTPS
- **Teste:** Use cartões de teste primeiro
- **Monitoramento:** Acompanhe logs do webhook

**Após implementar, os bônus funcionarão automaticamente!** 🎁✨




















