# 🎁 **CONFIGURAR SISTEMA DE BÔNUS DE RENOVAÇÃO**

## ✅ **O que foi Criado:**

1. **SQL:** `implementar_bonus_renovacao.sql` - Estrutura do banco
2. **Webhook:** `src/api/webhooks/stripe.ts` - Processamento automático
3. **Env:** Variáveis necessárias adicionadas

## 🚀 **PASSOS PARA ATIVAR:**

### **1. Execute o SQL no Supabase:**
- **Acesse:** https://supabase.com/dashboard
- **Vá em:** SQL Editor
- **Cole e execute:** Todo o conteúdo de `implementar_bonus_renovacao.sql`

### **2. Configure Webhook no Stripe:**
- **Acesse:** https://dashboard.stripe.com/webhooks
- **Clique:** "Add endpoint"
- **URL:** `https://seudominio.com/api/webhooks/stripe`
- **Eventos:** Selecione `invoice.payment_succeeded`
- **Copie:** O webhook secret gerado

### **3. Atualize o .env:**
```bash
# Adicione estas linhas ao seu .env:
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **4. Obtenha a Service Role Key:**
- **Acesse:** https://supabase.com/dashboard
- **Vá em:** Settings > API
- **Copie:** "service_role" key (não a anon key)

## 🎯 **COMO FUNCIONARÁ:**

### **Renovação Automática:**
1. **Stripe cobra** mensalidade do cliente
2. **Webhook dispara** `invoice.payment_succeeded`
3. **Sistema processa** renovação com bônus
4. **Petições extras** são adicionadas ao saldo

### **Bônus por Plano:**
- **Pro:** +1 petição bônus na renovação
- **Elite:** +3 petições bônus na renovação
- **Start:** Sem bônus (0 petições extras)

## 🧪 **TESTE DO SISTEMA:**

### **1. Teste Manual (SQL):**
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

## 🎉 **APÓS CONFIGURAR:**
- **Bônus funcionarão** automaticamente
- **Clientes receberão** petições extras prometidas
- **Sistema registrará** todas as renovações com bônus
- **Auditoria completa** no banco de dados

**Execute os passos e me avise quando estiver pronto!** 🚀




















