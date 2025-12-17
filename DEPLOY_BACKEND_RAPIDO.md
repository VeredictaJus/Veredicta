# 🚀 Deploy Rápido do Backend para Reset de Senha

## Problema
O Firebase Admin SDK não funciona no Deno (Supabase Edge Functions), então precisamos do backend Node.js rodando.

## Solução: Deploy no Railway (Gratuito e Rápido)

### Passo 1: Criar conta no Railway
1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em "New Project"

### Passo 2: Conectar repositório
1. Selecione seu repositório GitHub (Veredicta)
2. Railway vai detectar automaticamente

### Passo 3: Configurar o serviço
1. Railway vai detectar que é Node.js
2. Configure:
   - **Root Directory**: `bridge`
   - **Start Command**: `npm start` (ou `node server.js`)
   - **Port**: Deixe Railway definir automaticamente (variável `PORT`)

### Passo 4: Adicionar variáveis de ambiente
No Railway Dashboard, vá em "Variables" e adicione:

```
PORT=3001
FRONTEND_URL=https://www.veredictajus.com.br
ALLOWED_ORIGINS=https://www.veredictajus.com.br,https://veredictajus.com.br
SUPABASE_JWT_SECRET=<seu_secret_do_supabase>
FIREBASE_PROJECT_ID=veredicta-85b8c
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@veredicta-85b8c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=<cole_a_chave_completa_do_FIREBASE_PRIVATE_KEY_VALUE.txt>
RESEND_API_KEY=re_83qumqum_4SsXPVhdwmWJXLe3BLnJuD2j
STRIPE_SECRET_KEY=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
```

### Passo 5: Obter URL do backend
1. Após o deploy, Railway vai gerar uma URL tipo: `https://veredicta-api-production.up.railway.app`
2. Copie essa URL

### Passo 6: Atualizar frontend
No Supabase Dashboard ou no arquivo `.env` do frontend, configure:
```
VITE_API_URL=https://sua-url-do-railway.up.railway.app
```

### Passo 7: Testar
Agora o "Esqueci minha senha" vai funcionar e enviar apenas o email bonito!

---

## Alternativa: Render.com (Também Gratuito)

Se preferir Render:

1. Acesse: https://render.com
2. "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Root Directory**: `bridge`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Adicione as mesmas variáveis de ambiente
6. Deploy!

---

## ⚡ Solução Mais Rápida (Se já tiver servidor)

Se você já tem um servidor (Hostinger VPS), pode fazer deploy lá:

1. Acesse o servidor via SSH
2. Clone o repositório ou faça upload dos arquivos da pasta `bridge`
3. Instale dependências: `npm install`
4. Configure o `.env` com as variáveis
5. Use PM2 para rodar: `pm2 start server.js --name veredicta-api`
6. Configure Nginx/Apache como proxy reverso para `api.veredictajus.com.br`

---

## ✅ Após o Deploy

O frontend já está configurado para tentar o backend primeiro. Quando o backend estiver funcionando, ele vai:
1. Gerar o link via Firebase Admin SDK (funciona perfeitamente em Node.js)
2. Retornar o link para o frontend
3. Frontend envia apenas o email bonito customizado

**Resultado:** Apenas 1 email bonito, sem email padrão do Firebase! 🎉




