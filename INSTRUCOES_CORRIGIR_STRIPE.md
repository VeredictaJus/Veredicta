# 💳 **Corrigir Integração com Stripe**

## **🔍 Problemas Identificados:**

### ❌ **Faltando:**
- Coluna `stripe_price_id` na tabela `plans`
- Coluna `stripe_product_id` na tabela `plans`
- Chaves Stripe reais (não placeholders)
- Tabela para logs de pagamentos Stripe

### ✅ **Funcionando:**
- Tabela `plans` com 4 planos
- Tabela `user_subscriptions` operacional
- Tabelas de pagamento existentes

## **🚀 Como Corrigir:**

### **1. Execute o Script de Correção:**
- Abra o **Supabase SQL Editor**
- Execute o script `corrigir_integracao_stripe.sql`
- Me envie os resultados

### **2. Configure as Chaves Stripe Reais:**

#### **No arquivo `.env` (crie se não existir):**
```env
# Stripe Configuration - CHAVES REAIS
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_PUBLICACAO_AQUI
VITE_STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_SECRETA_AQUI
VITE_STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI

# Stripe Price IDs - VERIFICAR SE ESTÃO CORRETOS
VITE_STRIPE_PRICE_START=price_1SIx0xLnE1r0oPJFSN2Kt41R
VITE_STRIPE_PRICE_PRO=price_1SIx2XLnE1r0oPJFljNvb1t3
VITE_STRIPE_PRICE_ELITE=price_1SIx3jLnE1r0oPJFw8pvuZnO
```

### **3. Verificar no Stripe Dashboard:**
- Acesse [dashboard.stripe.com](https://dashboard.stripe.com)
- Verifique se os Price IDs existem
- Obtenha as chaves reais
- Configure webhooks se necessário

## **📊 O que o Script Vai Fazer:**

1. **Adicionar colunas Stripe** na tabela `plans`
2. **Configurar Price IDs** para os planos pagos
3. **Criar tabela** `stripe_payments` para logs
4. **Criar índices** para performance
5. **Verificar** se tudo foi criado corretamente

## **🎯 Execute o script e me envie os resultados!**

**Depois vamos configurar as chaves reais do Stripe!** 💳




















