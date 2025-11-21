# 🚀 INSTRUÇÕES PARA CRIAR ARQUIVO .env

## 📋 **PASSOS PARA RESOLVER OS ERROS DO STRIPE:**

### **1. Criar arquivo .env na raiz do projeto:**
- Na pasta raiz do projeto (mesmo nível do package.json)
- Crie um arquivo chamado `.env` (sem extensão)

### **2. Copie e cole este conteúdo no arquivo .env:**

```bash
# CONFIGURAÇÕES COMPLETAS - DESENVOLVIMENTO

# Firebase Configuration
VITE_FB_API_KEY=AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM
VITE_FB_PROJECT_ID=veredicta-85b8c
VITE_FB_APP_ID=1:123456789:web:xxxxxxxxxxxxxxxx
VITE_FB_AUTH_DOMAIN=veredicta-85b8c.firebaseapp.com

# Supabase Configuration
VITE_SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg

# Stripe Configuration - CHAVES DE TESTE (DESENVOLVIMENTO)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Ro45gLnE1r0oPJFtt9CfREzmJ3vMN2ins9GvBQPrmXYnkNRUku0f3QDniGuMJWeRdwoKZTEDOHFq4Ziuolq3hPn00FRgchwlQ
VITE_STRIPE_SECRET_KEY=sk_test_51Ro45gLnE1r0oPJFCTzcAl1CDFmtJlQU0oeoEd0meag1Nm95npxOgTk0X1per31PN9gRrPYFvszjd23xyNz75pTo00feXmEMlR
VITE_STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI

# Stripe Price IDs - JÁ CONFIGURADOS NO BANCO
VITE_STRIPE_PRICE_START=price_1SIx0xLnE1r0oPJFSN2Kt41R
VITE_STRIPE_PRICE_PRO=price_1SIx2XLnE1r0oPJFljNvb1t3
VITE_STRIPE_PRICE_ELITE=price_1SIx3jLnE1r0oPJFw8pvuZnO
```

### **3. Reiniciar o servidor:**
```bash
npm run dev
# ou
yarn dev
```

## ✅ **RESULTADO ESPERADO:**
- ❌ Erros do Stripe desaparecerão
- ✅ Checkout funcionará corretamente
- ✅ Pagamentos de teste funcionarão

## 🧪 **TESTE COM CARTÃO DE TESTE:**
- **Número:** 4242 4242 4242 4242
- **Data:** Qualquer data futura
- **CVC:** Qualquer 3 dígitos

## ⚠️ **IMPORTANTE:**
- ✅ Usando chaves de **TESTE** (desenvolvimento)
- ✅ Não haverá cobranças reais
- ✅ Seguro para desenvolvimento

## 🔒 **PARA PRODUÇÃO:**
Quando for fazer deploy, substitua pelas suas chaves LIVE:
- `pk_live_...` (chave pública)
- `sk_live_...` (chave secreta)











