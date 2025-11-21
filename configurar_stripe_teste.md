# 🔧 Configuração do Stripe para Teste

## **Passo 1: Criar Conta Stripe (se não tiver)**
1. Acesse: https://dashboard.stripe.com/register
2. Crie uma conta gratuita
3. Ative o modo de teste

## **Passo 2: Obter Chaves de API**
1. Acesse: https://dashboard.stripe.com/apikeys
2. Copie a **Chave Secreta** (sk_test_...)
3. Copie a **Chave Pública** (pk_test_...)

## **Passo 3: Configurar Webhook**
1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em "Add endpoint"
3. URL: `https://seu-dominio.com/api/stripe/webhook`
4. Eventos: `checkout.session.completed`
5. Copie o **Webhook Secret** (whsec_...)

## **Passo 4: Configurar Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto com:

```env
# STRIPE CONFIGURATION
STRIPE_SECRET_KEY=sk_test_51ABC123...
STRIPE_WEBHOOK_SECRET=whsec_ABC123...

# SUPABASE CONFIGURATION  
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# FRONTEND URL
PUBLIC_FRONTEND_URL=http://localhost:4321
```

## **Passo 5: Testar**
1. Reinicie o servidor: `npm run dev`
2. Teste o fluxo: Landing Page → Cadastro → Pagamento
3. Use cartão de teste: `4242 4242 4242 4242`

## **Cartões de Teste Stripe:**
- **Sucesso:** 4242 4242 4242 4242
- **Falha:** 4000 0000 0000 0002
- **3D Secure:** 4000 0025 0000 3155

## **Status Atual:**
❌ Stripe não configurado
✅ APIs corrigidas para Astro
✅ Webhook configurado
✅ Fluxo de bônus implementado









