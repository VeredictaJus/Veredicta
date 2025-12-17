# ⚙️ Configuração Correta no Render

## ✅ O QUE ESTÁ CORRETO

- ✅ **Repositório**: `VeredictaJus / Veredicta` ✅
- ✅ **Name**: `Veredicta` ✅
- ✅ **Language**: `Node` ✅
- ✅ **Branch**: `main` ✅
- ✅ **Region**: `Oregon (US West)` ✅

---

## ⚠️ O QUE PRECISA CORRIGIR

### 1. Build Command

**Atual (ERRADO):**
```
$ pnpm install --frozen-lockfile
```

**Correto:**
```
npm install
```

**OU deixe vazio** (se não precisar build)

---

### 2. Start Command ⚠️ **MUITO IMPORTANTE!**

**Atual (ERRADO):**
```
$ node check-admin-user.js
```

**Correto:**
```
node stripe-server-standalone.js
```

Este é o arquivo que processa os pagamentos Stripe!

---

## 📋 CONFIGURAÇÃO COMPLETA

### Campos que você precisa ajustar:

1. **Build Command**: 
   - Apague: `$ pnpm install --frozen-lockfile`
   - Digite: `npm install`
   - OU deixe vazio

2. **Start Command**: 
   - Apague: `$ node check-admin-user.js`
   - Digite: `node stripe-server-standalone.js`

3. **Root Directory**: 
   - Deixe vazio (não precisa)

---

## 🔧 DEPOIS DE CORRIGIR

1. Role a página para baixo
2. Vá em **"Environment Variables"** (Variáveis de Ambiente)
3. Adicione:
   ```
   PORT=10000
   FRONTEND_URL=https://veredicta-certo-bpkv9mi6m-natalias-projects-649eefbe.vercel.app
   ALLOWED_ORIGINS=https://veredicta-certo-bpkv9mi6m-natalias-projects-649eefbe.vercel.app,https://www.veredictajus.com.br
   STRIPE_SECRET_KEY=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
   ```

4. Clique em **"Create Web Service"**

---

## ⚠️ IMPORTANTE

O **Start Command** está apontando para o arquivo errado! Precisa ser `stripe-server-standalone.js` para processar pagamentos!





















