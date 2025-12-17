# 🎯 Guia: Criar Plano de Teste (R$ 1,00) no Stripe

## 📋 Passo a Passo

### 1. Acesse o Stripe Dashboard

- **URL:** https://dashboard.stripe.com/
- **Modo:** Escolha entre **TEST** (para testes) ou **LIVE** (para produção)
- ⚠️ **Recomendação:** Use **TEST** primeiro para testar

### 2. Criar o Produto

1. No menu lateral, clique em **"Products"** (Produtos)
2. Clique no botão **"+ Add product"** (Adicionar produto)
3. Preencha os campos:

   **Nome do Produto:**
   ```
   Veredicta - Plano Teste
   ```

   **Descrição:**
   ```
   Plano de teste com valor simbólico de R$ 1,00. Inclui 1 petição para testes.
   ```

   **Imagem:** (Opcional - pode deixar em branco)

### 3. Criar o Preço (Price)

Na mesma tela de criação do produto, role para baixo até a seção **"Pricing"**:

1. **Preço:**
   - Digite: `1.00`
   - Moeda: `BRL` (Real brasileiro)

2. **Tipo de cobrança:**
   - Selecione: **"One time"** (Pagamento único)
   - ⚠️ **NÃO** selecione "Recurring" (Recorrente), pois é um plano de teste único

3. Clique em **"Save product"** (Salvar produto)

### 4. Copiar os IDs

Após criar o produto, você verá:

- **Product ID:** Começa com `prod_` (exemplo: `prod_XXXXXXXXXXXXX`)
- **Price ID:** Começa com `price_` (exemplo: `price_XXXXXXXXXXXXX`)

**⚠️ IMPORTANTE:** Copie ambos os IDs! Você precisará deles.

### 5. Atualizar no Banco de Dados

Execute este SQL no Supabase SQL Editor:

```sql
-- Atualizar o plano de teste com os IDs do Stripe
UPDATE plans 
SET 
    stripe_price_id = 'price_XXXXXXXXXXXXX',  -- Cole o Price ID aqui
    stripe_product_id = 'prod_XXXXXXXXXXXXX'   -- Cole o Product ID aqui
WHERE plan_code = 'test';

-- Verificar se foi atualizado corretamente
SELECT 
    plan_code,
    name,
    price / 100.0 as price_in_reais,
    stripe_price_id,
    stripe_product_id
FROM plans 
WHERE plan_code = 'test';
```

### 6. Atualizar Variáveis de Ambiente (Opcional)

Se você usar variáveis de ambiente para os Price IDs, adicione:

```env
VITE_STRIPE_PRICE_TEST=price_XXXXXXXXXXXXX
```

E atualize o arquivo `src/lib/stripe.ts`:

```typescript
export const STRIPE_PRICE_IDS = {
  // ... outros planos
  test: import.meta.env.VITE_STRIPE_PRICE_TEST || 'price_XXXXXXXXXXXXX'
};
```

## ✅ Verificação Final

Após seguir todos os passos:

1. ✅ Produto criado no Stripe Dashboard
2. ✅ Price ID e Product ID copiados
3. ✅ IDs atualizados no banco de dados (tabela `plans`)
4. ✅ Código atualizado para incluir o plano 'test'
5. ✅ Teste de pagamento funcionando

## 🧪 Testar o Pagamento

1. Acesse a página de planos no sistema
2. Selecione o "Plano Teste"
3. Clique em "Assinar" ou "Comprar"
4. Será redirecionado para o Stripe Checkout
5. Use um cartão de teste do Stripe:
   - **Número:** `4242 4242 4242 4242`
   - **Data:** Qualquer data futura
   - **CVC:** Qualquer 3 dígitos
   - **CEP:** Qualquer CEP válido

## 📝 Notas Importantes

- ⚠️ O plano de teste usa **pagamento único** (não recorrente)
- ⚠️ Certifique-se de usar o modo **TEST** do Stripe para testes
- ⚠️ Os IDs do Stripe são diferentes entre TEST e LIVE
- ⚠️ Após criar no Stripe, sempre atualize o banco de dados

## 🆘 Problemas Comuns

**Erro: "Plano não encontrado"**
- Verifique se o código do plano está como `'test'` no código

**Erro: "Price ID inválido"**
- Verifique se copiou o Price ID correto do Stripe
- Certifique-se de estar usando o modo correto (TEST ou LIVE)

**Pagamento não processa**
- Verifique se os IDs estão atualizados no banco de dados
- Confirme que está usando a chave API correta do Stripe















