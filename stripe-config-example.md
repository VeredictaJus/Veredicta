# Configuração do Stripe - Guia Completo

## 1. Variáveis de Ambiente Necessárias

Adicione estas variáveis ao seu arquivo `.env`:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef...
VITE_STRIPE_SECRET_KEY=sk_test_51234567890abcdef...
VITE_STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...

# Stripe Price IDs (criar no Stripe Dashboard)
VITE_STRIPE_PRICE_STARTER=price_1234567890abcdef
VITE_STRIPE_PRICE_PROFESSIONAL=price_1234567890abcdef
VITE_STRIPE_PRICE_PREMIUM=price_1234567890abcdef

# Stripe Credit Price IDs
VITE_STRIPE_CREDIT_STARTER=price_1234567890abcdef
VITE_STRIPE_CREDIT_PROFESSIONAL=price_1234567890abcdef
VITE_STRIPE_CREDIT_PREMIUM=price_1234567890abcdef
```

## 2. Passos para Configurar no Stripe Dashboard

### A. Criar Produtos e Preços
1. Acesse https://dashboard.stripe.com/
2. Vá em "Produtos" → "Adicionar produto"
3. Crie os seguintes produtos:

**Planos Mensais:**
- Starter: R$ 20,00/mês
- Professional: R$ 50,00/mês  
- Premium: R$ 100,00/mês

**Créditos:**
- Starter: R$ 2,20 por crédito
- Professional: R$ 2,10 por crédito
- Premium: R$ 2,00 por crédito

### B. Configurar Webhooks
1. Vá em "Desenvolvedores" → "Webhooks"
2. Adicione endpoint: `https://seu-dominio.com/api/stripe/webhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### C. Obter Chaves
1. Vá em "Desenvolvedores" → "Chaves da API"
2. Copie a "Chave publicável" (pk_test_...)
3. Copie a "Chave secreta" (sk_test_...)
4. Copie o "Segredo do webhook" (whsec_...)





















