# 🚀 Deploy no Vercel - Guia Simples

## ✅ O QUE JÁ ESTÁ PRONTO

- ✅ Código atualizado
- ✅ Arquivo `.env` configurado
- ✅ Tudo pronto!

---

## 📋 O QUE VOCÊ PRECISA FAZER

### 1️⃣ FAZER BUILD (2 minutos)

No terminal, execute:

```bash
npm run build
```

Isso vai criar a pasta `dist` com os arquivos prontos.

---

### 2️⃣ DEPLOY NO VERCEL (5 minutos)

#### Opção A: Arrastar e Soltar (Mais Fácil)

1. Acesse: **https://vercel.com**
2. Faça login (ou crie conta)
3. Clique em **"Add New..."** → **"Project"**
4. Procure por **"Deploy"** ou **"Upload"**
5. **Arraste a pasta `dist` inteira** para o Vercel
6. Aguarde 1-2 minutos
7. **Pronto!** Você receberá uma URL tipo: `https://veredicta-xxxxx.vercel.app`

#### Opção B: Conectar GitHub (Recomendado)

1. No Vercel, clique em **"Add New..."** → **"Project"**
2. Conecte seu repositório GitHub
3. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Vá em **"Environment Variables"** e adicione todas as variáveis do seu `.env`
5. Clique em **"Deploy"**
6. Toda vez que você fizer `git push`, o site será atualizado automaticamente! 🎉

---

### 3️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE (Importante!)

**Se você usou a Opção A (arrastar e soltar):**

1. No projeto no Vercel, vá em **"Settings"** → **"Environment Variables"**
2. Adicione cada variável do seu `.env`:
   - `VITE_API_URL` = `https://api.veredictajus.com.br` (ou URL do seu backend)
   - `VITE_SUPABASE_URL` = `https://dmsodonmkffyvbuxtxec.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (cole a chave do seu `.env`)
   - `VITE_FB_API_KEY` = (cole do seu `.env`)
   - `VITE_FB_PROJECT_ID` = `veredicta-85b8c`
   - `VITE_FB_APP_ID` = `1:123456789:web:xxxxxxxxxxxxxxxx`
   - `VITE_FB_AUTH_DOMAIN` = `veredicta-85b8c.firebaseapp.com`
   - `VITE_STRIPE_PUBLISHABLE_KEY` = (cole do seu `.env`)
3. **IMPORTANTE**: Depois de adicionar, faça um **novo deploy**!

---

### 4️⃣ CONFIGURAR DOMÍNIO (Opcional)

Se você quiser usar `www.veredictajus.com.br`:

1. No Vercel, vá em **"Settings"** → **"Domains"**
2. Adicione: `www.veredictajus.com.br`
3. Configure o DNS na Hostinger conforme as instruções do Vercel
4. Pronto! SSL automático será configurado ✅

---

## ⚠️ IMPORTANTE: BACKEND

O Vercel não suporta servidores Node.js persistentes. Você precisa hospedar o backend em outro lugar:

### Opção 1: Render.com (Gratuito)

1. Acesse: **https://render.com**
2. Crie um **"Web Service"**
3. Faça upload do arquivo `stripe-server-standalone.js`
4. Configure:
   - **Start Command**: `node stripe-server-standalone.js`
5. Adicione variáveis de ambiente:
   - `PORT=10000`
   - `FRONTEND_URL=https://sua-url-vercel.vercel.app`
   - `ALLOWED_ORIGINS=https://sua-url-vercel.vercel.app`
   - `STRIPE_SECRET_KEY=sk_live_...`
6. Você receberá uma URL tipo: `https://veredicta-api.onrender.com`
7. **Atualize `VITE_API_URL` no Vercel** para essa URL

### Opção 2: Railway (Alternativa)

Similar ao Render.com, mas com interface diferente.

---

## ✅ CHECKLIST

- [ ] Build feito (`npm run build`)
- [ ] Deploy no Vercel feito
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Backend deployado (Render.com ou similar)
- [ ] `VITE_API_URL` apontando para o backend
- [ ] Teste funcionando

---

## 🎉 PRONTO!

Agora seu site está no ar com HTTPS automático! 🚀

---

## 📚 DOCUMENTAÇÃO COMPLETA

Veja `DEPLOY_VERCEL_COMPLETO.md` para instruções detalhadas.



















