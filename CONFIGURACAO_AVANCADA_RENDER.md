# ⚙️ Configuração Avançada no Render

## ✅ O QUE ESTÁ CORRETO (Pode deixar assim)

### 1. Health Check Path: `/healthz`

**Status**: ✅ **Pode mudar para `/health`**

O arquivo `stripe-server-standalone.js` tem um endpoint `/health` (não `/healthz`).

**Recomendação**: Mude para `/health`

---

### 2. Pre-Deploy Command: `$`

**Status**: ✅ **Pode deixar vazio**

Você não precisa de comando pré-deploy. Pode apagar o `$` e deixar vazio.

---

### 3. Auto-Deploy: "On Commit"

**Status**: ✅ **Perfeito!**

Isso significa que sempre que você fizer commit no GitHub, o Render vai fazer deploy automaticamente. Deixe assim!

---

### 4. Build Filters

**Status**: ✅ **Pode deixar vazio**

Não precisa configurar filtros. Deixe vazio.

---

## 📋 RESUMO - O QUE MUDAR

### ⚠️ **Mudar:**

1. **Health Check Path**: 
   - De: `/healthz`
   - Para: `/health`

### ✅ **Deixar assim:**

- **Pre-Deploy Command**: Deixe vazio (apague o `$`)
- **Auto-Deploy**: "On Commit" ✅
- **Build Filters**: Deixe vazio
- **Secret Files**: Não precisa
- **Disk**: Não precisa

---

## 🎯 DEPOIS DE CONFIGURAR

1. Role a página para cima
2. Verifique se as **Environment Variables** estão configuradas:
   - `PORT=10000`
   - `FRONTEND_URL=...`
   - `ALLOWED_ORIGINS=...`
   - `STRIPE_SECRET_KEY=...`
3. Clique em **"Deploy Web Service"**

---

## ⚠️ IMPORTANTE

Antes de clicar em "Deploy", certifique-se de que:

1. ✅ **Start Command** está correto: `node stripe-server-standalone.js`
2. ✅ **Health Check Path** está: `/health`
3. ✅ **Environment Variables** estão configuradas
4. ✅ **Pre-Deploy Command** está vazio

Depois disso, pode clicar em **"Deploy Web Service"**! 🚀


