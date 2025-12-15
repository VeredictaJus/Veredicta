# 🔧 **CORRIGIR PRICE IDs DO STRIPE**

## 🚨 **Problema Identificado:**
- ❌ **Price IDs atuais:** Modo LIVE (production)
- ❌ **Chaves Stripe:** Modo TEST (desenvolvimento)
- ❌ **Erro:** `No such price: 'price_1SIx0xLnE1r0oPJFSN2Kt41R'`

## 🎯 **Solução: Criar Price IDs de Teste**

### **1. Acesse o Stripe Dashboard:**
- 🔗 **URL:** https://dashboard.stripe.com/test/products
- 🔑 **Modo:** TEST (não LIVE)

### **2. Crie os Produtos e Price IDs:**

#### **Plano START (R$ 520,00):**
1. **Criar Produto:**
   - Nome: `Veredicta Start`
   - Descrição: `Plano Start - 10 petições por mês`

2. **Criar Price:**
   - Valor: `R$ 520,00`
   - Moeda: `BRL`
   - Tipo: `Recurring` (mensal)
   - **Copie o Price ID gerado**

#### **Plano PRO (R$ 1.680,00):**
1. **Criar Produto:**
   - Nome: `Veredicta Pro`
   - Descrição: `Plano Pro - 30 petições por mês`

2. **Criar Price:**
   - Valor: `R$ 1.680,00`
   - Moeda: `BRL`
   - Tipo: `Recurring` (mensal)
   - **Copie o Price ID gerado**

#### **Plano ELITE (R$ 7.000,00):**
1. **Criar Produto:**
   - Nome: `Veredicta Elite`
   - Descrição: `Plano Elite - 100 petições por mês`

2. **Criar Price:**
   - Valor: `R$ 7.000,00`
   - Moeda: `BRL`
   - Tipo: `Recurring` (mensal)
   - **Copie o Price ID gerado**

### **3. Atualizar Código:**
Após criar os Price IDs, me envie os novos IDs para atualizar o código.

## 📋 **Formato dos Price IDs:**
- ✅ **Teste:** `price_xxxxxxxxxxxxxxxxxxxxx` (começa com `price_`)
- ❌ **Live:** `price_1SIx0xLnE1r0oPJFSN2Kt41R` (não funciona com chaves de teste)

## 🚀 **Próximos Passos:**
1. Criar produtos no Stripe Dashboard (modo TEST)
2. Copiar os novos Price IDs
3. Atualizar o código com os novos IDs
4. Testar pagamento

**Crie os produtos e me envie os Price IDs!** 🎯




















