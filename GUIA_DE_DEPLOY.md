# 🚀 Guia de Deploy - Veredicta (veredictajus.com.br)

Este guia explica como fazer o deploy da sua plataforma Veredicta para produção na Hostinger.

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Deploy do Frontend](#deploy-do-frontend)
3. [Deploy do Backend](#deploy-do-backend)
4. [Configuração do Stripe](#configuração-do-stripe)
5. [Testando em Produção](#testando-em-produção)

---

## 🔧 Pré-requisitos

- [ ] Acesso à Hostinger com VPS ou Cloud Hosting (necessário para Node.js)
- [ ] Domínio configurado: `veredictajus.com.br`
- [ ] Subdomínio configurado: `api.veredictajus.com.br` (para a API)
- [ ] Certificado SSL instalado (HTTPS)
- [ ] Acesso SSH ao servidor (para VPS)

---

## 🎨 Deploy do Frontend (React/Vite)

### Passo 1: Criar arquivo .env para produção

No seu computador, crie um arquivo `.env` na raiz do projeto com:

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

> 💡 **Dica**: Você pode copiar do arquivo `env.production.example`

### Passo 2: Fazer build do projeto

No terminal, execute:

```bash
npm run build
```

Isso vai criar uma pasta `dist` com os arquivos otimizados.

### Passo 3: Fazer upload para Hostinger

**Via FTP/SFTP:**
1. Conecte no FTP da Hostinger (use FileZilla ou WinSCP)
2. Navegue até a pasta `public_html` ou `www`
3. Faça upload de **todo o conteúdo** da pasta `dist`

**Via cPanel File Manager:**
1. Acesse o cPanel da Hostinger
2. Abra o "Gerenciador de Arquivos"
3. Navegue até `public_html`
4. Faça upload do conteúdo da pasta `dist`

### Passo 4: Configurar .htaccess (importante!)

Crie um arquivo `.htaccess` na pasta `public_html` com:

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

Isso é necessário para o React Router funcionar corretamente.

---

## ⚙️ Deploy do Backend (Node.js)

### Opção A: Deploy na Hostinger VPS/Cloud

#### Passo 1: Acessar servidor via SSH

```bash
ssh seu_usuario@seu_servidor_hostinger
```

#### Passo 2: Instalar Node.js (se ainda não tiver)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # Verificar instalação
```

#### Passo 3: Criar pasta para o backend

```bash
mkdir -p /var/www/api
cd /var/www/api
```

#### Passo 4: Fazer upload dos arquivos

**Arquivos necessários:**
- `stripe-server-standalone.js`
- `package.json`

Você pode usar SCP ou SFTP para enviar:

```bash
scp stripe-server-standalone.js seu_usuario@servidor:/var/www/api/
scp package.json seu_usuario@servidor:/var/www/api/
```

#### Passo 5: Criar arquivo .env no servidor

```bash
nano .env
```

Cole o conteúdo:

```bash
PORT=3001
FRONTEND_URL=https://www.veredictajus.com.br
ALLOWED_ORIGINS=https://www.veredictajus.com.br,https://veredictajus.com.br
STRIPE_SECRET_KEY=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
```

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`

#### Passo 6: Instalar dependências

```bash
npm install
```

#### Passo 7: Instalar PM2 (para manter o servidor rodando)

```bash
sudo npm install -g pm2
pm2 start stripe-server-standalone.js --name "veredicta-api"
pm2 save
pm2 startup  # Seguir as instruções que aparecerem
```

#### Passo 8: Configurar subdomínio e proxy reverso

**No painel da Hostinger:**
1. Vá em "Domínios" → "Subdomínios"
2. Crie: `api.veredictajus.com.br`
3. Aponte para a mesma pasta do servidor

**Configure Nginx ou Apache como proxy reverso:**

Para Nginx (`/etc/nginx/sites-available/api.veredictajus.com.br`):

```nginx
server {
    listen 80;
    server_name api.veredictajus.com.br;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative e reinicie:

```bash
sudo ln -s /etc/nginx/sites-available/api.veredictajus.com.br /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Passo 9: Instalar certificado SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.veredictajus.com.br
```

### Opção B: Deploy em serviço externo (se não tiver VPS)

Se sua Hostinger não suporta Node.js, use **Render.com** (gratuito):

1. Crie conta em https://render.com
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub ou faça upload manual
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node stripe-server-standalone.js`
5. Adicione as variáveis de ambiente:
   ```
   PORT=3001
   FRONTEND_URL=https://www.veredictajus.com.br
   ALLOWED_ORIGINS=https://www.veredictajus.com.br,https://veredictajus.com.br
   STRIPE_SECRET_KEY=sk_live_51Ro45gLnE1r0oPJF...
   ```
6. Deploy! Você receberá uma URL tipo `https://veredicta-api.onrender.com`
7. Use essa URL no `.env` do frontend como `VITE_API_URL`

---

## 💳 Configuração do Stripe

### Passo 1: Configurar Webhooks

1. Acesse o painel do Stripe: https://dashboard.stripe.com
2. Vá em "Developers" → "Webhooks"
3. Clique em "Add endpoint"
4. Configure:
   - **URL**: `https://api.veredictajus.com.br/webhook`
   - **Eventos**: Selecione `checkout.session.completed`
5. Copie o "Signing secret" (começa com `whsec_...`)
6. Adicione ao `.env` do backend:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Passo 2: Testar com cartão de teste (opcional)

Antes de aceitar pagamentos reais, teste com cartões de teste do Stripe:

- **Cartão de sucesso**: `4242 4242 4242 4242`
- **CVC**: Qualquer 3 dígitos
- **Data**: Qualquer data futura

---

## ✅ Testando em Produção

### Checklist de testes:

- [ ] Frontend carrega em `https://www.veredictajus.com.br`
- [ ] Login funciona corretamente
- [ ] Navegação entre páginas funciona
- [ ] API responde em `https://api.veredictajus.com.br/health`
- [ ] Botão "Pagar com Stripe" abre o checkout
- [ ] Após pagamento, redireciona para página de sucesso
- [ ] Webhooks do Stripe estão sendo recebidos

### Verificar logs do backend:

```bash
pm2 logs veredicta-api
```

---

## 🐛 Troubleshooting

### Erro CORS

**Sintoma**: `Access to fetch... has been blocked by CORS policy`

**Solução**: Verifique se o `ALLOWED_ORIGINS` no `.env` do backend está correto:
```
ALLOWED_ORIGINS=https://www.veredictajus.com.br,https://veredictajus.com.br
```

### Erro 404 ao recarregar página

**Sintoma**: Ao recarregar página, aparece "404 Not Found"

**Solução**: Verifique se o arquivo `.htaccess` está configurado corretamente no frontend.

### Backend não responde

**Sintoma**: `Failed to fetch` ou timeout

**Solução**: 
1. Verifique se o PM2 está rodando: `pm2 status`
2. Reinicie: `pm2 restart veredicta-api`
3. Verifique os logs: `pm2 logs veredicta-api`

### Pagamentos não funcionam

**Sintoma**: Erro ao criar sessão do Stripe

**Solução**:
1. Verifique se a `STRIPE_SECRET_KEY` está correta
2. Verifique se está usando chave LIVE (começa com `sk_live_`)
3. Verifique os logs do backend

---

## 📞 Suporte

Se tiver problemas durante o deploy:

1. Verifique os logs do backend: `pm2 logs`
2. Teste a API manualmente: `curl https://api.veredictajus.com.br/health`
3. Verifique o console do navegador (F12) para erros no frontend

---

## 🎉 Deploy Concluído!

Sua plataforma está no ar! 🚀

**URLs finais:**
- Frontend: https://www.veredictajus.com.br
- API: https://api.veredictajus.com.br
- Painel Stripe: https://dashboard.stripe.com

Não esqueça de:
- [ ] Monitorar os primeiros pagamentos
- [ ] Configurar backups regulares
- [ ] Monitorar logs de erro
- [ ] Testar em diferentes dispositivos e navegadores














