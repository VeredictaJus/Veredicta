# 🔑 **Configurar Chaves Reais do Stripe**

## **✅ Banco de Dados Configurado!**
- Colunas `stripe_price_id` e `stripe_product_id` adicionadas
- Tabela `stripe_payments` criada
- Planos configurados com Price IDs

## **🔧 Próximo Passo: Chaves Reais**

### **1. Acesse o Stripe Dashboard:**
- Vá para [dashboard.stripe.com](https://dashboard.stripe.com)
- Faça login na sua conta

### **2. Obtenha as Chaves:**
- **Publishable Key:** `pk_test_...` (chave pública)
- **Secret Key:** `sk_test_...` (chave secreta)
- **Webhook Secret:** `whsec_...` (para webhooks)

### **3. Crie o arquivo `.env` na raiz do projeto:**
```env
# Firebase Configuration
VITE_FB_API_KEY=AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM
VITE_FB_PROJECT_ID=veredicta-85b8c
VITE_FB_APP_ID=1:123456789:web:xxxxxxxxxxxxxxxx
VITE_FB_AUTH_DOMAIN=veredicta-85b8c.firebaseapp.com

# Supabase Configuration
VITE_SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg

# Stripe Configuration - SUBSTITUA PELAS CHAVES REAIS
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_PUBLICACAO_AQUI
VITE_STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_SECRETA_AQUI
VITE_STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI

# Stripe Price IDs - JÁ CONFIGURADOS NO BANCO
VITE_STRIPE_PRICE_START=price_1SIx0xLnE1r0oPJFSN2Kt41R
VITE_STRIPE_PRICE_PRO=price_1SIx2XLnE1r0oPJFljNvb1t3
VITE_STRIPE_PRICE_ELITE=price_1SIx3jLnE1r0oPJFw8pvuZnO
```

### **4. Verificar Price IDs no Stripe:**
- Confirme se os Price IDs existem no seu Stripe Dashboard
- Se não existirem, crie os produtos/planos no Stripe
- Atualize os Price IDs no banco se necessário

### **5. Testar Pagamento:**
- Use cartão de teste: `4242 4242 4242 4242`
- Data: qualquer data futura
- CVC: qualquer 3 dígitos

## **🎯 Status Atual:**
- ✅ **Banco configurado** - Estrutura Stripe pronta
- ✅ **Planos configurados** - Price IDs definidos
- ⏳ **Chaves Stripe** - Precisam ser reais
- ⏳ **Teste de pagamento** - Após configurar chaves

**Configure as chaves reais e teste o pagamento!** 💳




















