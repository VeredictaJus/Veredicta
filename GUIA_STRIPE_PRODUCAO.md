# 🚀 GUIA COMPLETO: CONFIGURAR STRIPE PARA PRODUÇÃO

## ✅ **STATUS ATUAL**

Todos os arquivos foram atualizados para usar chaves **LIVE** do Stripe:

- ✅ `src/lib/stripe.ts` - Chave publishable LIVE
- ✅ `src/api/stripe/create-checkout-session.ts` - Chave secreta LIVE
- ✅ `src/api/stripe/verify-payment.ts` - Chave secreta LIVE
- ✅ `src/api/stripe/webhook.ts` - Chave secreta LIVE
- ✅ `src/api/create-checkout-session.ts` - Chave secreta LIVE
- ✅ `bridge/server.js` - Chave secreta LIVE

---

## 📋 **PASSO A PASSO PARA PRODUÇÃO**

### **1. Obter Chaves LIVE do Stripe**

1. Acesse: https://dashboard.stripe.com
2. Faça login na sua conta Stripe
3. **IMPORTANTE:** Certifique-se de estar no modo **LIVE** (não Test mode)
4. Vá em **Developers** → **API keys**
5. Copie as chaves:
   - **Publishable key:** `pk_live_...`
   - **Secret key:** `sk_live_...`

### **2. Configurar Webhook no Stripe**

1. No Stripe Dashboard, vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL:** `https://seu-dominio.com/api/stripe/webhook`
   - **Description:** "Veredicta Webhook"
   - **Events to send:** Selecione:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
4. Clique em **Add endpoint**
5. Copie o **Signing secret:** `whsec_...`

### **3. Criar Arquivo .env**

Crie um arquivo `.env` na raiz do projeto com:

```env
# ========================================
# STRIPE CONFIGURATION - PRODUÇÃO (LIVE)
# ========================================

# Chaves LIVE do Stripe (OBRIGATÓRIO)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_SUA_CHAVE_PUBLICACAO_AQUI
VITE_STRIPE_SECRET_KEY=sk_live_SUA_CHAVE_SECRETA_AQUI
STRIPE_SECRET_KEY=sk_live_SUA_CHAVE_SECRETA_AQUI
VITE_STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI

# Stripe Price IDs - Planos REAIS (LIVE)
# IMPORTANTE: Verifique se estes Price IDs existem no seu Stripe Dashboard
VITE_STRIPE_PRICE_START=price_1SIx0xLnE1r0oPJFSN2Kt41R
VITE_STRIPE_PRICE_PRO=price_1SIx2XLnE1r0oPJFljNvb1t3
VITE_STRIPE_PRICE_ELITE=price_1SIx3jLnE1r0oPJFw8pvuZnO

# ========================================
# SUPABASE CONFIGURATION
# ========================================
VITE_SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg
VITE_SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY_AQUI

# ========================================
# FIREBASE CONFIGURATION
# ========================================
VITE_FB_API_KEY=AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM
VITE_FB_PROJECT_ID=veredicta-85b8c
VITE_FB_APP_ID=1:123456789:web:xxxxxxxxxxxxxxxx
VITE_FB_AUTH_DOMAIN=veredicta-85b8c.firebaseapp.com

# ========================================
# FRONTEND URL (PRODUÇÃO)
# ========================================
PUBLIC_FRONTEND_URL=https://seu-dominio.com
FRONTEND_URL=https://seu-dominio.com

# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=3001
ALLOWED_ORIGINS=https://seu-dominio.com
```

### **4. Verificar Price IDs no Stripe**

1. No Stripe Dashboard, vá em **Products**
2. Verifique se os produtos/planos existem:
   - **START** - R$ 520,00
   - **PRO** - R$ 1.680,00
   - **ELITE** - R$ 7.000,00
3. Se não existirem, crie os produtos:
   - Clique em **Add product**
   - Configure nome, preço e descrição
   - Copie o **Price ID** gerado
   - Atualize no arquivo `.env`

### **5. Configurar Variáveis de Ambiente no Servidor**

Se você estiver usando um servidor (Vercel, Netlify, etc.):

#### **Vercel:**
1. Vá em **Settings** → **Environment Variables**
2. Adicione todas as variáveis do `.env`
3. Certifique-se de selecionar **Production** para todas

#### **Netlify:**
1. Vá em **Site settings** → **Environment variables**
2. Adicione todas as variáveis do `.env`

#### **Supabase Edge Functions:**
1. Vá em **Project Settings** → **Edge Functions** → **Secrets**
2. Adicione:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`

### **6. Configurar Webhook no Supabase (Opcional)**

Se estiver usando Supabase Edge Functions:

1. Vá em **Edge Functions** → **stripe-webhook**
2. Configure as variáveis de ambiente:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. URL do webhook: `https://seu-projeto.supabase.co/functions/v1/stripe-webhook`

---

## 🔒 **SEGURANÇA**

### **⚠️ IMPORTANTE:**

1. **NUNCA** commite o arquivo `.env` no Git
2. Adicione `.env` ao `.gitignore`
3. Use variáveis de ambiente no servidor
4. Mantenha as chaves secretas seguras
5. Rotacione as chaves periodicamente

### **Chaves que NÃO devem ser expostas:**

- ❌ `STRIPE_SECRET_KEY` / `VITE_STRIPE_SECRET_KEY`
- ❌ `STRIPE_WEBHOOK_SECRET` / `VITE_STRIPE_WEBHOOK_SECRET`
- ❌ `VITE_SUPABASE_SERVICE_ROLE_KEY`

### **Chaves que podem ser públicas:**

- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` (pode estar no código)
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`

---

## 🧪 **TESTAR EM PRODUÇÃO**

### **1. Teste com Cartão de Teste (ainda funciona em LIVE):**

Mesmo em modo LIVE, você pode testar com:
- **Número:** `4242 4242 4242 4242`
- **Data:** Qualquer data futura
- **CVC:** Qualquer 3 dígitos
- **ZIP:** Qualquer 5 dígitos

**⚠️ ATENÇÃO:** Em modo LIVE, mesmo com cartão de teste, o Stripe pode processar a transação. Use com cuidado!

### **2. Teste Real (Recomendado):**

1. Use um cartão real com valor baixo
2. Verifique se o pagamento aparece no Stripe Dashboard
3. Verifique se o plano foi atualizado no banco
4. Verifique se o webhook foi recebido

### **3. Verificar Logs:**

- **Stripe Dashboard:** Ver transações em tempo real
- **Supabase Logs:** Verificar se webhooks estão chegando
- **Server Logs:** Verificar erros no backend

---

## 📊 **MONITORAMENTO**

### **1. Stripe Dashboard:**

- **Payments:** Ver todas as transações
- **Webhooks:** Ver eventos recebidos
- **Logs:** Ver erros e avisos

### **2. Supabase Dashboard:**

- **Database:** Verificar tabela `user_subscriptions`
- **Edge Functions:** Ver logs do webhook
- **Logs:** Verificar erros

### **3. Aplicação:**

- Verificar se planos estão sendo atualizados
- Verificar se notificações estão sendo enviadas
- Verificar se emails estão sendo enviados

---

## 🐛 **TROUBLESHOOTING**

### **Problema: Pagamento não está sendo processado**

**Soluções:**
1. Verifique se as chaves LIVE estão corretas
2. Verifique se o webhook está configurado
3. Verifique os logs do Stripe
4. Verifique os logs do servidor

### **Problema: Webhook não está funcionando**

**Soluções:**
1. Verifique se a URL do webhook está correta
2. Verifique se o webhook secret está correto
3. Verifique se o servidor está acessível
4. Teste o webhook manualmente no Stripe Dashboard

### **Problema: Plano não está sendo atualizado**

**Soluções:**
1. Verifique se o webhook está sendo recebido
2. Verifique os logs do Supabase
3. Verifique se a função RPC está funcionando
4. Verifique se há erros no banco de dados

### **Problema: Erro 401 (Unauthorized)**

**Soluções:**
1. Verifique se a chave secreta está correta
2. Verifique se está usando chave LIVE (não test)
3. Verifique se a chave não expirou
4. Gere uma nova chave se necessário

---

## ✅ **CHECKLIST FINAL**

Antes de ir para produção, verifique:

- [ ] Chaves LIVE obtidas do Stripe Dashboard
- [ ] Arquivo `.env` criado com todas as variáveis
- [ ] Webhook configurado no Stripe
- [ ] Price IDs verificados no Stripe Dashboard
- [ ] Variáveis de ambiente configuradas no servidor
- [ ] `.env` adicionado ao `.gitignore`
- [ ] Teste realizado com cartão de teste
- [ ] Webhook testado e funcionando
- [ ] Logs monitorados
- [ ] Backup das chaves em local seguro

---

## 🎯 **RESUMO**

### **O que foi feito:**

1. ✅ Todos os arquivos atualizados para usar chaves LIVE
2. ✅ Fallbacks configurados com chaves LIVE
3. ✅ Variáveis de ambiente configuradas
4. ✅ Webhook preparado para produção

### **Próximos passos:**

1. Obter chaves LIVE do Stripe
2. Criar arquivo `.env` com chaves reais
3. Configurar webhook no Stripe
4. Testar em ambiente de produção
5. Monitorar transações

---

## 📞 **SUPORTE**

Se tiver problemas:

1. Verifique os logs do Stripe Dashboard
2. Verifique os logs do servidor
3. Verifique a documentação do Stripe: https://stripe.com/docs
4. Entre em contato com suporte técnico

---

**✅ Stripe configurado para PRODUÇÃO!**

**Última atualização:** Janeiro 2025  
**Versão:** 1.0











