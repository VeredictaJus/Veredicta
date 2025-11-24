# 🔗 Como Configurar Webhook do Stripe - Passo a Passo

Este guia mostra como configurar o webhook do Stripe para processar pagamentos e renovações automaticamente.

---

## 📋 Parte 1: Configurar Webhook no Stripe Dashboard

### Passo 1: Acessar o Stripe Dashboard

1. Acesse: **https://dashboard.stripe.com**
2. Faça login na sua conta Stripe
3. Certifique-se de estar no modo **LIVE** (não Test mode)
   - Verifique no canto superior direito se está escrito "LIVE" ou "Test mode"
   - Se estiver em "Test mode", clique para alternar para "LIVE"

### Passo 2: Navegar até Webhooks

1. No menu lateral esquerdo, clique em **"Developers"** (Desenvolvedores)
2. Clique em **"Webhooks"** no submenu

### Passo 3: Adicionar Novo Webhook

1. Clique no botão **"Add endpoint"** ou **"Adicionar endpoint"** (canto superior direito)

### Passo 4: Configurar o Webhook

Preencha os campos:

1. **Endpoint URL:**
   ```
   https://www.veredictajus.com.br/api/stripe/webhook
   ```

2. **Description (opcional):**
   ```
   Webhook Veredicta - Processamento de pagamentos e renovações
   ```

3. **Events to send (Eventos para enviar):**
   - Clique em **"Select events"** ou **"Selecionar eventos"**
   - Marque as seguintes opções:
     - ✅ `checkout.session.completed` (Pagamento concluído)
     - ✅ `invoice.payment_succeeded` (Renovação automática paga)
   - Clique em **"Add events"** ou **"Adicionar eventos"**

4. Clique em **"Add endpoint"** ou **"Adicionar endpoint"**

### Passo 5: Copiar o Signing Secret

Após criar o webhook:

1. Clique no webhook que você acabou de criar (na lista de webhooks)
2. Na página de detalhes, procure por **"Signing secret"** ou **"Segredo de assinatura"**
3. Clique no botão **"Reveal"** ou **"Revelar"** ao lado do Signing secret
4. **Copie o valor** (começa com `whsec_...`)
   - Exemplo: `whsec_1234567890abcdefghijklmnopqrstuvwxyz`
   - ⚠️ **IMPORTANTE:** Copie o valor completo, você precisará dele no próximo passo

---

## 📋 Parte 2: Adicionar Signing Secret no Vercel

### Passo 1: Acessar o Vercel Dashboard

1. Acesse: **https://vercel.com/dashboard**
2. Faça login na sua conta
3. Clique no projeto **"veredicta"** (ou o nome do seu projeto)

### Passo 2: Navegar até Environment Variables

1. Clique na aba **"Settings"** (Configurações) no topo
2. No menu lateral esquerdo, clique em **"Environment Variables"** (Variáveis de Ambiente)

### Passo 3: Adicionar Nova Variável

1. Clique no botão **"Add New"** ou **"Adicionar Nova"**

2. Preencha os campos:
   - **Key (Chave):**
     ```
     STRIPE_WEBHOOK_SIGNING
     ```
   
   - **Value (Valor):**
     ```
     [Cole aqui o Signing secret que você copiou do Stripe]
     ```
     - Exemplo: `whsec_1234567890abcdefghijklmnopqrstuvwxyz`
   
   - **Environment (Ambiente):**
     - Marque todas as opções:
       - ✅ **Production**
       - ✅ **Preview**
       - ✅ **Development**

3. Clique em **"Save"** ou **"Salvar"**

### Passo 4: Fazer Redeploy (Importante!)

Após adicionar a variável:

1. Vá para a aba **"Deployments"** (Deployments)
2. Clique nos **três pontos (...)** do último deployment
3. Clique em **"Redeploy"** ou **"Redeplegar"**
4. Confirme o redeploy

**OU**

1. Vá para a aba **"Deployments"**
2. Clique no botão **"Redeploy"** no último deployment

---

## ✅ Verificação

### Como Verificar se Está Funcionando

1. **No Stripe Dashboard:**
   - Vá em **Developers → Webhooks**
   - Clique no seu webhook
   - Na seção **"Recent events"** (Eventos recentes), você verá os eventos sendo enviados
   - Se aparecer um ✅ verde, significa que o webhook está funcionando

2. **Testar um Pagamento:**
   - Faça um pagamento de teste na plataforma
   - Volte ao Stripe Dashboard → Webhooks → Seu webhook
   - Você deve ver um evento `checkout.session.completed` aparecer na lista

---

## 🔍 Troubleshooting (Solução de Problemas)

### Problema: Webhook retorna erro 400 "Invalid signature"

**Solução:**
- Verifique se o `STRIPE_WEBHOOK_SIGNING` no Vercel está correto
- Certifique-se de que copiou o Signing secret completo (começa com `whsec_`)
- Faça um redeploy após adicionar a variável

### Problema: Webhook não aparece na lista de eventos

**Solução:**
- Verifique se a URL está correta: `https://www.veredictajus.com.br/api/stripe/webhook`
- Certifique-se de que o deploy foi concluído no Vercel
- Verifique se os eventos estão selecionados no Stripe Dashboard

### Problema: Webhook retorna erro 405 "Method not allowed"

**Solução:**
- Isso é normal! Significa que o endpoint existe, mas você está acessando via navegador (GET)
- O Stripe envia requisições POST, então isso não é um problema
- Teste fazendo um pagamento real

---

## 📝 Checklist Final

- [ ] Webhook criado no Stripe Dashboard
- [ ] URL configurada: `https://www.veredictajus.com.br/api/stripe/webhook`
- [ ] Eventos selecionados: `checkout.session.completed` e `invoice.payment_succeeded`
- [ ] Signing secret copiado do Stripe
- [ ] Variável `STRIPE_WEBHOOK_SIGNING` adicionada no Vercel
- [ ] Redeploy feito no Vercel
- [ ] Webhook testado com um pagamento

---

## 🎯 Resultado Esperado

Após configurar tudo:

1. ✅ Quando um cliente faz um pagamento, o webhook processa automaticamente
2. ✅ Quando uma assinatura é renovada, o bônus de petições é aplicado automaticamente
3. ✅ Os eventos aparecem no Stripe Dashboard → Webhooks → Seu webhook → Recent events

---

## 💡 Dica Extra

Você pode testar o webhook manualmente no Stripe Dashboard:

1. Vá em **Developers → Webhooks**
2. Clique no seu webhook
3. Clique em **"Send test webhook"** ou **"Enviar webhook de teste"**
4. Selecione o evento: `checkout.session.completed`
5. Clique em **"Send test webhook"**

Isso ajuda a verificar se o webhook está funcionando antes de fazer um pagamento real.



