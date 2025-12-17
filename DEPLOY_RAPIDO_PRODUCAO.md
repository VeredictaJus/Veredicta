# 🚀 Deploy Rápido para Produção

## ✅ O QUE JÁ ESTÁ PRONTO

- ✅ Código do frontend atualizado
- ✅ Backend standalone atualizado (`stripe-server-standalone.js`)
- ✅ Lógica de detecção de produção corrigida
- ✅ Normalização de planos implementada
- ✅ Validação de parâmetros adicionada
- ✅ Logs detalhados para debugging

---

## 📋 O QUE VOCÊ PRECISA FAZER

### 1️⃣ **FRONTEND** (5 minutos)

1. **Criar arquivo `.env`** na raiz do projeto:
   ```bash
   VITE_API_URL=https://api.veredictajus.com.br
   VITE_SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg
   VITE_FB_API_KEY=AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM
   VITE_FB_PROJECT_ID=veredicta-85b8c
   VITE_FB_APP_ID=1:123456789:web:xxxxxxxxxxxxxxxx
   VITE_FB_AUTH_DOMAIN=veredicta-85b8c.firebaseapp.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51Ro45gLnE1r0oPJF03eTA26ztlbri5kwKETZYeMci6kETMGKDi1151vcrlPl0wsguTN1UDeutaHXiTcBX6r72Vnv00s4xPxkSd
   ```

2. **Fazer build:**
   ```bash
   npm run build
   # ou
   pnpm build
   ```

3. **Upload da pasta `dist`** para `public_html` na Hostinger

4. **Criar `.htaccess`** em `public_html`:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

### 2️⃣ **BACKEND** (10 minutos)

1. **Acessar servidor via SSH:**
   ```bash
   ssh seu_usuario@seu_servidor
   ```

2. **Criar pasta e fazer upload:**
   ```bash
   mkdir -p /var/www/api
   cd /var/www/api
   # Upload: stripe-server-standalone.js e package.json
   ```

3. **Criar `package.json`** (se não tiver):
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

4. **Criar `.env`:**
   ```bash
   PORT=3001
   FRONTEND_URL=https://www.veredictajus.com.br
   ALLOWED_ORIGINS=https://www.veredictajus.com.br,https://veredictajus.com.br
   STRIPE_SECRET_KEY=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
   ```

5. **Instalar e iniciar:**
   ```bash
   npm install
   sudo npm install -g pm2
   pm2 start stripe-server-standalone.js --name "veredicta-api"
   pm2 save
   pm2 startup
   ```

6. **Configurar Nginx** (proxy reverso para `api.veredictajus.com.br`)

7. **Instalar SSL:**
   ```bash
   sudo certbot --nginx -d api.veredictajus.com.br
   ```

---

## 🧪 TESTAR

1. **Backend:** `curl https://api.veredictajus.com.br/health`
2. **Frontend:** Acesse `https://www.veredictajus.com.br`
3. **Pagamento:** Teste o fluxo completo de pagamento

---

## 📚 DOCUMENTAÇÃO COMPLETA

Veja `CHECKLIST_DEPLOY_PRODUCAO.md` para instruções detalhadas.

---

## ⚠️ IMPORTANTE

- Use chaves **LIVE** do Stripe em produção
- Certifique-se de que o subdomínio `api.veredictajus.com.br` está configurado
- Monitore os logs: `pm2 logs veredicta-api`





















