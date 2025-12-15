# 🧪 Cenários de Teste - Bônus FREE

## **Cenário 1: Cliente NOVO (deve receber bônus)**
1. **Ação:** Ir para Landing Page → Clicar "Assinar Plano Pro"
2. **Cadastro:** Usar email `teste1@exemplo.com` + CPF/CNPJ únicos
3. **Pagamento:** Completar checkout Stripe
4. **Resultado Esperado:** 
   - Plano Pro ativo ✅
   - Plano FREE bônus ativo (`is_bonus: true`) ✅
   - Modal de boas-vindas aparece ✅

## **Cenário 2: Cliente que JÁ USOU FREE (não deve receber bônus)**
1. **Preparação:** Criar usuário que já usou FREE
2. **Ação:** Landing Page → "Assinar Plano Pro" 
3. **Cadastro:** Usar email `teste2@exemplo.com` + MESMO CPF/CNPJ do passo 1
4. **Pagamento:** Completar checkout
5. **Resultado Esperado:**
   - Plano Pro ativo ✅
   - Plano FREE bônus NÃO criado ❌
   - Modal NÃO aparece ❌

## **Cenário 3: Cliente com FREE ativo mas não usado (não deve receber bônus)**
1. **Preparação:** Criar usuário com FREE ativo
2. **Ação:** Landing Page → "Assinar Plano Pro"
3. **Cadastro:** Usar email `teste3@exemplo.com` + CPF/CNPJ únicos
4. **Pagamento:** Completar checkout
5. **Resultado Esperado:**
   - Plano Pro ativo ✅
   - Plano FREE bônus NÃO criado ❌
   - Modal NÃO aparece ❌

## **Cenário 4: Cliente que só quer FREE (cadastro normal)**
1. **Ação:** Landing Page → "Assinar Plano Free"
2. **Cadastro:** Usar email `teste4@exemplo.com`
3. **Resultado Esperado:**
   - Plano FREE ativo ✅
   - Modal NÃO aparece ❌
   - Redireciona para dashboard normal ✅









