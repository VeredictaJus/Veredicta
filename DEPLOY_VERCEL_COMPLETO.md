# 🚀 Deploy Completo no Vercel - Guia Atualizado

## ✅ O QUE JÁ ESTÁ PRONTO

- ✅ Código do frontend atualizado
- ✅ Arquivo `.env` configurado com `VITE_API_URL`
- ✅ Backend standalone atualizado
- ✅ Tudo pronto para produção!

---

## 📋 PARTE 1: DEPLOY DO FRONTEND NO VERCEL

### Passo 1: Criar Conta no Vercel

1. Acesse: **https://vercel.com**
2. Clique em **"Sign Up"** (canto superior direito)
3. Escolha uma forma de criar conta:
   - **GitHub** (recomendado - mais rápido e permite deploy automático)
   - **Google**
   - **Email**

### Passo 2: Fazer Build Local (Importante!)

**Antes de fazer deploy, você precisa fazer o build:**

```bash
npm run build
# ou
pnpm build
```

Isso vai criar a pasta `dist` com os arquivos prontos.

### Passo 3: Deploy no Vercel

#### Opção A: Arrastar e Soltar (Mais Fácil)

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Procure por **"Deploy"** ou **"Upload"** ou uma área para arrastar arquivos
3. **Arraste a pasta `dist` inteira** para essa área
   - ⚠️ **Importante**: Arraste a pasta `dist` completa (não só o conteúdo)
4. Aguarde 1-2 minutos
5. **Pronto!** Você receberá uma URL tipo: `https://veredicta-xxxxx.vercel.app`

#### Opção B: Conectar GitHub (Recomendado - Deploy Automático)

1. No Vercel, clique em **"Add New..."** → **"Project"**
2. Conecte seu repositório GitHub
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raiz do projeto)
   - **Build Command**: `npm run build` ou `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install` ou `pnpm install`
4. **IMPORTANTE**: Vá em **"Environment Variables"** e adicione todas as variáveis do seu `.env`:
   - `VITE_API_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_FB_API_KEY`
   - `VITE_FB_PROJECT_ID`
   - `VITE_FB_APP_ID`
   - `VITE_FB_AUTH_DOMAIN`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
5. Clique em **"Deploy"**
6. Toda vez que você fizer `git push`, o site será atualizado automaticamente! 🎉

### Passo 4: Configurar Variáveis de Ambiente no Vercel

**Se você usou a Opção A (arrastar e soltar):**

1. No projeto no Vercel, vá em **"Settings"** → **"Environment Variables"**
2. Adicione cada variável do seu `.env`:
   - Clique em **"Add New"**
   - Nome: `VITE_API_URL`
   - Valor: `https://api.veredictajus.com.br` (ou a URL do seu backend)
   - Ambiente: **Production**, **Preview**, **Development** (marque todos)
   - Repita para todas as outras variáveis

**Variáveis necessárias:**
```
VITE_API_URL=https://api.veredictajus.com.br
VITE_SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg
VITE_FB_API_KEY=AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM
VITE_FB_PROJECT_ID=veredicta-85b8c
VITE_FB_APP_ID=1:123456789:web:xxxxxxxxxxxxxxxx
VITE_FB_AUTH_DOMAIN=veredicta-85b8c.firebaseapp.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51Ro45gLnE1r0oPJF03eTA26ztlbri5kwKETZYeMci6kETMGKDi1151vcrlPl0wsguTN1UDeutaHXiTcBX6r72Vnv00s4xPxkSd
```

3. **IMPORTANTE**: Depois de adicionar as variáveis, você precisa fazer um **novo deploy** para que elas sejam aplicadas!

### Passo 5: Configurar Domínio Personalizado (Opcional)

Se você quiser usar `www.veredictajus.com.br`:

1. No projeto no Vercel, vá em **"Settings"** → **"Domains"**
2. Clique em **"Add"** ou **"Add Domain"**
3. Digite: `www.veredictajus.com.br`
4. O Vercel vai mostrar instruções de DNS:
   - Tipo: **CNAME**
   - Nome: `www`
   - Valor: `cname.vercel-dns.com`
5. Configure isso no painel da Hostinger (em "Domínios" → "DNS")
6. Aguarde alguns minutos
7. Pronto! SSL automático será configurado ✅

---

## 📋 PARTE 2: DEPLOY DO BACKEND (Render.com ou Railway)

**⚠️ IMPORTANTE**: O Vercel não suporta servidores Node.js persistentes da mesma forma. Você precisa hospedar o backend em outro lugar.

### Opção A: Render.com (Recomendado - Gratuito)

1. **Criar conta**: https://render.com
2. **Criar novo Web Service**:
   - Clique em **"New +"** → **"Web Service"**
   - Conecte seu repositório GitHub OU faça upload do arquivo `stripe-server-standalone.js`
3. **Configurar**:
   - **Name**: `veredicta-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install` (ou deixe vazio se fizer upload manual)
   - **Start Command**: `node stripe-server-standalone.js`
4. **Criar `package.json`** (se não tiver no repositório):
   ```json
   {
     "name": "veredicta-api",
     "type": "module",
     "scripts": {
       "start": "node stripe-server-standalone.js"
     },
     "dependencies": {
       "express": "^4.18.2",
       "cors": "^2.8.5",
       "stripe": "^14.0.0",
       "dotenv": "^16.3.1"
     }
   }
   ```
5. **Adicionar variáveis de ambiente**:
   - No Render, vá em **"Environment"**
   - Adicione:
     ```
     PORT=10000
     FRONTEND_URL=https://www.veredictajus.com.br
     ALLOWED_ORIGINS=https://www.veredictajus.com.br,https://veredictajus.com.br
     STRIPE_SECRET_KEY=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
     ```
6. **Deploy!** Você receberá uma URL tipo: `https://veredicta-api.onrender.com`
7. **Atualizar `VITE_API_URL` no Vercel**:
   - No Vercel, vá em **"Settings"** → **"Environment Variables"**
   - Atualize `VITE_API_URL` para a URL do Render (ex: `https://veredicta-api.onrender.com`)
   - Faça um novo deploy

### Opção B: Railway (Alternativa)

1. **Criar conta**: https://railway.app
2. **Criar novo projeto** → **"Deploy from GitHub repo"**
3. Configure similar ao Render.com
4. Você receberá uma URL automática

### Opção C: Vercel Serverless Functions (Avançado)

Se você quiser usar o próprio Vercel para o backend, precisa converter o código para Serverless Functions. Isso é mais complexo e não está coberto neste guia.

---

## 🧪 TESTAR TUDO

1. **Frontend**: Acesse a URL do Vercel (ex: `https://veredicta-xxxxx.vercel.app`)
2. **Backend**: Teste `https://sua-api.onrender.com/health` (deve retornar `{"status":"ok"}`)
3. **Pagamento**: Vá em Planos e teste o fluxo completo de pagamento

---

## ✅ CHECKLIST FINAL

- [ ] Frontend deployado no Vercel
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Backend deployado no Render.com (ou similar)
- [ ] `VITE_API_URL` apontando para o backend
- [ ] Domínio personalizado configurado (opcional)
- [ ] Teste de pagamento funcionando

---

## 🎉 PRONTO!

Agora seu site está:
- ✅ No ar com HTTPS automático
- ✅ Rápido (CDN global do Vercel)
- ✅ Com deploy automático (se conectou GitHub)
- ✅ Funcionando perfeitamente!

---

## 🆘 TROUBLESHOOTING

### Problema: Variáveis de ambiente não funcionam

**Solução**: 
- Certifique-se de que adicionou as variáveis no Vercel
- Faça um novo deploy depois de adicionar as variáveis
- Verifique se os nomes começam com `VITE_` (necessário para Vite)

### Problema: Backend não responde

**Solução**:
- Verifique os logs no Render.com
- Certifique-se de que o `PORT` está correto (Render usa porta 10000)
- Verifique se as variáveis de ambiente estão configuradas

### Problema: Erro CORS

**Solução**:
- No backend (Render), adicione a URL do Vercel em `ALLOWED_ORIGINS`
- Exemplo: `ALLOWED_ORIGINS=https://veredicta-xxxxx.vercel.app,https://www.veredictajus.com.br`

---

## 📚 DOCUMENTAÇÃO ÚTIL

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app


















