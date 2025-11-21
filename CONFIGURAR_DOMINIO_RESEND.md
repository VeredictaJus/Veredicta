# 🌐 Configurar Domínio Personalizado no Resend

## ✅ Email Configurado

O sistema agora está configurado para usar:
```
contato@veredictajus.com
```

## ⚠️ Importante: Verificar Domínio

Para que os emails sejam enviados de `contato@veredictajus.com` ao invés de `onboarding@resend.dev`, você precisa **verificar o domínio no Resend**.

---

## 🚀 Passo a Passo para Verificar Domínio

### 1️⃣ **Acessar o Resend**

1. Acesse: [https://resend.com](https://resend.com)
2. Faça login na sua conta
3. No menu lateral, clique em **"Domains"**

### 2️⃣ **Adicionar Domínio**

1. Clique no botão **"+ Add Domain"**
2. Digite: `veredictajus.com` (sem www)
3. Clique em **"Add"**

### 3️⃣ **Obter Registros DNS**

O Resend vai mostrar 3 registros DNS que você precisa adicionar:

#### 📝 Registros Necessários:

1. **SPF (TXT Record)**
   ```
   Tipo: TXT
   Nome: @
   Valor: v=spf1 include:amazonses.com ~all
   ```

2. **DKIM (TXT Record)**
   ```
   Tipo: TXT
   Nome: resend._domainkey
   Valor: [será fornecido pelo Resend]
   ```

3. **DMARC (TXT Record)**
   ```
   Tipo: TXT
   Nome: _dmarc
   Valor: v=DMARC1; p=none
   ```

### 4️⃣ **Adicionar no Provedor de DNS**

Você precisa adicionar esses registros onde seu domínio `veredictajus.com` está registrado:

#### **Se estiver no Registro.br:**

1. Acesse: [https://registro.br](https://registro.br)
2. Faça login
3. Vá em **"Meus Domínios"** → `veredictajus.com`
4. Clique em **"DNS"** ou **"Editar Zona"**
5. Adicione os 3 registros TXT fornecidos pelo Resend
6. Salve as alterações

#### **Se estiver em outro provedor (GoDaddy, Hostinger, etc):**

1. Acesse o painel de controle do provedor
2. Encontre a seção de **DNS Management** ou **Zona DNS**
3. Adicione os 3 registros TXT
4. Salve as alterações

### 5️⃣ **Aguardar Verificação**

- ⏰ **Tempo:** Pode levar de **15 minutos a 48 horas**
- 🔄 **Status:** Volte ao Resend e clique em "Verify" para verificar
- ✅ **Confirmação:** Quando verificado, aparecerá uma badge verde

### 6️⃣ **Testar**

Depois que o domínio estiver verificado:

1. Acesse: `http://localhost:5176/#/test-email`
2. Envie um email de teste
3. Verifique se chegou de: `contato@veredictajus.com` ✅

---

## 📋 Enquanto o Domínio Não For Verificado

**O que acontece:**
- ❌ Emails **NÃO** serão enviados de `contato@veredictajus.com`
- ✅ Emails **serão enviados** de `onboarding@resend.dev`
- ⚠️ Podem cair mais no spam

**O sistema continua funcionando normalmente!** Apenas o remetente será diferente.

---

## 🎯 Benefícios do Domínio Verificado

✅ **Profissionalismo**
- Emails vêm do seu próprio domínio

✅ **Menos Spam**
- SPF/DKIM/DMARC melhoram a deliverability

✅ **Confiança**
- Usuários reconhecem seu domínio

✅ **Branding**
- Reforça a marca Veredicta

---

## 🔍 Verificar Status do Domínio

### No Resend Dashboard:

1. Acesse: [https://resend.com/domains](https://resend.com/domains)
2. Veja o status do domínio:
   - 🟢 **Verified** - Pronto para usar!
   - 🟡 **Pending** - Aguardando DNS propagar
   - 🔴 **Failed** - Registros DNS incorretos

### Testar DNS (Opcional):

Use ferramentas online para verificar os registros:
- [MXToolbox](https://mxtoolbox.com/SuperTool.aspx)
- [DNSChecker](https://dnschecker.org/)

---

## 🐛 Problemas Comuns

### ❌ Domínio não verifica

**Causas:**
1. Registros DNS incorretos
2. DNS ainda não propagou (aguarde 24-48h)
3. TTL muito alto (altere para 300 segundos)

**Solução:**
- Revise os registros DNS
- Aguarde mais tempo
- Use ferramentas de DNS para verificar

### ❌ Email vai para spam

**Causas:**
1. Domínio não verificado
2. DMARC não configurado
3. Novo domínio (baixa reputação)

**Solução:**
- Verifique o domínio completamente
- Configure todos os 3 registros (SPF, DKIM, DMARC)
- Evite enviar muitos emails de uma vez
- Peça aos destinatários para marcarem como "não spam"

---

## 📞 Precisa de Ajuda?

### Suporte Resend:
- Email: support@resend.com
- Docs: [https://resend.com/docs/send-with-vercel](https://resend.com/docs/send-with-vercel)

### Suporte do Provedor de Domínio:
- Entre em contato com o suporte do seu provedor de DNS
- Peça ajuda para adicionar registros TXT

---

## ✅ Checklist Completo

- [ ] Adicionar domínio no Resend
- [ ] Copiar os 3 registros DNS (SPF, DKIM, DMARC)
- [ ] Adicionar registros no provedor de DNS
- [ ] Aguardar propagação (15min - 48h)
- [ ] Verificar status no Resend
- [ ] Testar envio de email
- [ ] Confirmar que chegou de `contato@veredictajus.com`

---

## 🎉 Tudo Pronto!

Quando o domínio estiver verificado, todos os emails do sistema serão enviados automaticamente de:

```
Veredicta <contato@veredictajus.com>
```

Seus usuários verão emails profissionais com o domínio da empresa! 📧✨







