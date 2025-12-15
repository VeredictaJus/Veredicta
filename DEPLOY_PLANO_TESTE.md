# 🚀 Deploy do Plano de Teste - Guia Rápido

## ✅ O que foi alterado

Os seguintes arquivos foram atualizados para incluir o plano de teste:

1. ✅ `src/api/stripe/create-checkout-session.ts` - Endpoint de produção
2. ✅ `bridge/server.js` - Servidor bridge
3. ✅ `stripe-server-standalone.js` - Servidor standalone
4. ✅ `src/services/plansService.ts` - Ordenação de planos
5. ✅ `src/pages/client/Plans.tsx` - Mapeamento de nomes

## 📋 Passos para Deploy

### Opção 1: Deploy Automático (Vercel com Git)

Se o projeto está conectado ao GitHub/GitLab e o Vercel está configurado com auto-deploy:

1. **Fazer commit das alterações:**
   ```bash
   git add .
   git commit -m "feat: adicionar plano de teste (R$ 1,00)"
   git push origin main
   ```

2. **Aguardar deploy automático:**
   - O Vercel detectará o push automaticamente
   - Você pode acompanhar em: https://vercel.com/dashboard
   - O deploy geralmente leva 2-5 minutos

3. **Verificar se funcionou:**
   - Acesse: https://www.veredictajus.com.br/client/plans
   - O plano de teste deve aparecer
   - Tente assinar e verificar se não há mais erro 400

### Opção 2: Deploy Manual (Vercel CLI)

Se preferir fazer deploy manual:

1. **Instalar Vercel CLI (se ainda não tiver):**
   ```bash
   npm i -g vercel
   ```

2. **Fazer login:**
   ```bash
   vercel login
   ```

3. **Fazer deploy:**
   ```bash
   vercel --prod
   ```

### Opção 3: Deploy via Dashboard Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto "Veredicta"
3. Clique em "Deployments"
4. Clique em "Redeploy" no último deployment
5. Ou faça upload manual dos arquivos alterados

## 🔍 Verificações Pós-Deploy

Após o deploy, verifique:

1. ✅ **Plano aparece na interface:**
   - Acesse: https://www.veredictajus.com.br/client/plans
   - O "Plano Teste" deve aparecer primeiro (antes do Free)

2. ✅ **Preço correto:**
   - Deve mostrar "R$ 1,00" (não R$ 100,00)

3. ✅ **Checkout funciona:**
   - Clique em "Assinar Agora" no plano de teste
   - Não deve aparecer erro "Plano não encontrado"
   - Deve redirecionar para o Stripe Checkout

4. ✅ **Console sem erros:**
   - Abra o DevTools (F12)
   - Vá na aba "Console"
   - Não deve haver erros 400 relacionados ao checkout

## 🐛 Se ainda houver problemas

### Erro 400 "Plano não encontrado"

**Causa:** O arquivo `src/api/stripe/create-checkout-session.ts` não foi atualizado no servidor.

**Solução:**
1. Verifique se o commit foi feito corretamente
2. Verifique se o deploy foi concluído no Vercel
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Tente em modo anônimo/privado

### Plano não aparece

**Causa:** O plano não está ativo no banco de dados.

**Solução:**
1. Execute o script `verificar_plano_teste.sql` no Supabase
2. Se `is_active = false`, execute:
   ```sql
   UPDATE plans SET is_active = true WHERE plan_code = 'test';
   ```

### Preço errado (R$ 100,00)

**Causa:** O preço no banco está como 10000 centavos em vez de 100.

**Solução:**
1. Execute o script `corrigir_preco_plano_teste.sql` no Supabase

## 📝 Arquivos que precisam estar no deploy

Certifique-se de que estes arquivos foram commitados:

- ✅ `src/api/stripe/create-checkout-session.ts`
- ✅ `bridge/server.js`
- ✅ `stripe-server-standalone.js`
- ✅ `src/services/plansService.ts`
- ✅ `src/pages/client/Plans.tsx`
- ✅ `src/lib/stripe.ts`

## 🎯 Resumo

**Status atual:** ✅ Código atualizado localmente
**Próximo passo:** ⏳ Fazer commit e push para Git
**Depois:** 🚀 Vercel fará deploy automático
**Resultado esperado:** ✅ Plano de teste funcionando em produção













