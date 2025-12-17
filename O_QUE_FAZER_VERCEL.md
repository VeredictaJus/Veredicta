# ✅ O QUE VOCÊ PRECISA FAZER - VERCEL

## 🎯 RESUMO ULTRA SIMPLES

1. **Fazer build**: `npm run build`
2. **Deploy no Vercel**: Arrastar pasta `dist` OU conectar GitHub
3. **Configurar variáveis**: Adicionar todas as variáveis do `.env` no Vercel
4. **Backend**: Hospedar em Render.com (gratuito)

---

## 📋 PASSO A PASSO

### 1. FAZER BUILD (2 minutos)

```bash
npm run build
```

Isso cria a pasta `dist` com tudo pronto.

---

### 2. DEPLOY NO VERCEL (5 minutos)

**Opção A - Arrastar e Soltar:**
1. Acesse: https://vercel.com
2. Faça login
3. Clique em **"Add New..."** → **"Project"**
4. Procure **"Deploy"** ou **"Upload"**
5. **Arraste a pasta `dist`** para o Vercel
6. Aguarde 1-2 minutos
7. Pronto! Você receberá uma URL

**Opção B - GitHub (Recomendado):**
1. No Vercel, conecte seu repositório GitHub
2. O Vercel detecta automaticamente (já tem `vercel.json` configurado!)
3. Configure as variáveis de ambiente (veja passo 3)
4. Deploy automático! 🎉

---

### 3. CONFIGURAR VARIÁVEIS NO VERCEL (Importante!)

1. No projeto no Vercel: **"Settings"** → **"Environment Variables"**
2. Adicione cada variável do seu `.env`:

```
VITE_API_URL=https://api.veredictajus.com.br
VITE_SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_FB_API_KEY=AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM
VITE_FB_PROJECT_ID=veredicta-85b8c
VITE_FB_APP_ID=1:123456789:web:xxxxxxxxxxxxxxxx
VITE_FB_AUTH_DOMAIN=veredicta-85b8c.firebaseapp.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51Ro45gLnE1r0oPJF...
```

3. **IMPORTANTE**: Marque todas as opções (Production, Preview, Development)
4. **Depois de adicionar, faça um novo deploy!**

---

### 4. BACKEND (Render.com)

O Vercel não suporta servidores Node.js. Use Render.com:

1. Acesse: https://render.com
2. Crie **"Web Service"**
3. Faça upload de `stripe-server-standalone.js`
4. Configure:
   - **Start Command**: `node stripe-server-standalone.js`
5. Adicione variáveis:
   - `PORT=10000`
   - `FRONTEND_URL=https://sua-url-vercel.vercel.app`
   - `ALLOWED_ORIGINS=https://sua-url-vercel.vercel.app`
   - `STRIPE_SECRET_KEY=sk_live_...`
6. Você receberá uma URL tipo: `https://veredicta-api.onrender.com`
7. **Atualize `VITE_API_URL` no Vercel** para essa URL

---

## ✅ PRONTO!

Agora é só testar! 🎉

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **Guia Simples**: `DEPLOY_VERCEL_SIMPLES.md`
- **Guia Completo**: `DEPLOY_VERCEL_COMPLETO.md`





















