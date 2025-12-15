# ✅ O QUE JÁ ESTÁ FEITO

- ✅ Frontend deployado no Vercel
- ✅ Variável `VITE_API_URL` configurada
- ✅ Site no ar: `https://veredicta-certo-bpkv9mi6m-natalias-projects-649eefbe.vercel.app`

---

# 📋 O QUE FALTA FAZER

## 1️⃣ DEPLOY DO BACKEND (Importante!)

O frontend está funcionando, mas o **backend** (servidor que processa pagamentos) precisa estar no ar.

### Opção A: Render.com (Recomendado - Gratuito)

1. **Acesse**: https://render.com
2. **Crie conta** (pode usar GitHub)
3. **Criar novo Web Service**:
   - Clique em **"New +"** → **"Web Service"**
   - Conecte seu repositório GitHub OU faça upload do arquivo `stripe-server-standalone.js`
4. **Configurar**:
   - **Name**: `veredicta-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install` (ou deixe vazio)
   - **Start Command**: `node stripe-server-standalone.js`
5. **Criar `package.json`** (se não tiver no repositório):
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
6. **Adicionar variáveis de ambiente** no Render:
   ```
   PORT=10000
   FRONTEND_URL=https://veredicta-certo-bpkv9mi6m-natalias-projects-649eefbe.vercel.app
   ALLOWED_ORIGINS=https://veredicta-certo-bpkv9mi6m-natalias-projects-649eefbe.vercel.app,https://www.veredictajus.com.br
   STRIPE_SECRET_KEY=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
   ```
7. **Deploy!** Você receberá uma URL tipo: `https://veredicta-api.onrender.com`
8. **Atualizar `VITE_API_URL` no Vercel**:
   - No Vercel: Settings → Environment Variables
   - Atualize `VITE_API_URL` para a URL do Render
   - Faça um novo deploy: `vercel --prod`

### Opção B: Se você já tem o backend rodando em `api.veredictajus.com.br`

Se o backend já está configurado e funcionando em `api.veredictajus.com.br`, então **não precisa fazer nada**! O frontend já está configurado para usar essa URL.

---

## 2️⃣ TESTAR TUDO

Depois que o backend estiver no ar:

1. **Testar o site**: Acesse a URL do Vercel
2. **Testar o backend**: Acesse `https://sua-api.onrender.com/health` (deve retornar `{"status":"ok"}`)
3. **Testar pagamento**: Vá em Planos e teste o fluxo completo

---

## 3️⃣ CONFIGURAR DOMÍNIO PERSONALIZADO (Opcional)

Se você quiser usar `www.veredictajus.com.br`:

1. No Vercel: Settings → Domains
2. Adicione: `www.veredictajus.com.br`
3. Configure o DNS na Hostinger conforme as instruções do Vercel
4. Pronto! SSL automático será configurado

---

## ✅ RESUMO

**O que você precisa fazer AGORA:**

1. **Deploy do backend** (Render.com ou similar) - ⚠️ **IMPORTANTE**
2. **Atualizar `VITE_API_URL`** no Vercel com a URL do backend
3. **Fazer novo deploy** no Vercel: `vercel --prod`
4. **Testar** se tudo está funcionando

---

## 🆘 DÚVIDAS?

- **Não sei fazer deploy no Render.com**: Veja o guia `DEPLOY_VERCEL_COMPLETO.md`
- **Já tenho backend rodando**: Verifique se está acessível em `api.veredictajus.com.br`
- **Preciso de ajuda**: Me avise qual passo você está!



















