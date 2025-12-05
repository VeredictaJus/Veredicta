# ✅ Checklist de Deploy para Produção - Veredicta

## 📋 Pré-requisitos

- [ ] Acesso ao servidor de produção (Hostinger VPS/Cloud)
- [ ] Domínio configurado: `www.veredictajus.com.br`
- [ ] Subdomínio configurado: `api.veredictajus.com.br`
- [ ] Certificado SSL instalado (HTTPS)
- [ ] Acesso SSH ao servidor

---

## 🎨 1. DEPLOY DO FRONTEND (React/Vite)

### Passo 1.1: Criar arquivo `.env` para produção

**No seu computador local**, crie um arquivo `.env` na raiz do projeto:

```bash
# URL da API do backend (produção)
VITE_API_URL=https://api.veredictajus.com.br

# Supabase
VITE_SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg

# Firebase
VITE_FB_API_KEY=AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM
VITE_FB_PROJECT_ID=veredicta-85b8c
VITE_FB_APP_ID=1:123456789:web:xxxxxxxxxxxxxxxx
VITE_FB_AUTH_DOMAIN=veredicta-85b8c.firebaseapp.com

# Stripe (Frontend - Chave Pública)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51Ro45gLnE1r0oPJF03eTA26ztlbri5kwKETZYeMci6kETMGKDi1151vcrlPl0wsguTN1UDeutaHXiTcBX6r72Vnv00s4xPxkSd
```

> 💡 **Dica**: Você pode copiar do arquivo `env.production.example`

### Passo 1.2: Fazer build do projeto

No terminal, execute:

```bash
npm run build
# ou
pnpm build
```

Isso vai criar uma pasta `dist` com os arquivos otimizados.

### Passo 1.3: Fazer upload para Hostinger

**Via FTP/SFTP (FileZilla ou WinSCP):**
1. Conecte no FTP da Hostinger
2. Navegue até a pasta `public_html` ou `www`
3. **Faça backup** dos arquivos atuais (opcional, mas recomendado)
4. Faça upload de **todo o conteúdo** da pasta `dist`
   - ⚠️ **Importante**: Upload do **conteúdo** da pasta `dist`, não a pasta `dist` em si

**Via cPanel File Manager:**
1. Acesse o cPanel da Hostinger
2. Abra o "Gerenciador de Arquivos"
3. Navegue até `public_html`
4. Faça upload do conteúdo da pasta `dist`

### Passo 1.4: Configurar `.htaccess` (importante!)

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

## ⚙️ 2. DEPLOY DO BACKEND (Node.js)

### Passo 2.1: Acessar servidor via SSH

```bash
ssh seu_usuario@seu_servidor_hostinger
```

### Passo 2.2: Verificar Node.js instalado

```bash
node -v  # Deve mostrar v20.x ou superior
npm -v
```

Se não tiver Node.js, instale:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Passo 2.3: Criar pasta para o backend

```bash
mkdir -p /var/www/api
cd /var/www/api
```

### Passo 2.4: Fazer upload dos arquivos

**Arquivos necessários:**
- `stripe-server-standalone.js` (já atualizado com as correções)
- `package.json` (ou criar um novo)

**Via SCP (do seu computador):**
```bash
scp stripe-server-standalone.js seu_usuario@servidor:/var/www/api/
scp package.json seu_usuario@servidor:/var/www/api/
```

**Ou criar `package.json` no servidor:**
```bash
cd /var/www/api
nano package.json
```

Cole:
```json
{
  "name": "veredicta-api",
  "version": "1.0.0",
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

### Passo 2.5: Criar arquivo `.env` no servidor

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

### Passo 2.6: Instalar dependências

```bash
npm install
```

### Passo 2.7: Instalar PM2 (para manter o servidor rodando)

```bash
sudo npm install -g pm2
pm2 start stripe-server-standalone.js --name "veredicta-api"
pm2 save
pm2 startup  # Seguir as instruções que aparecerem
```

### Passo 2.8: Configurar subdomínio e proxy reverso

**No painel da Hostinger:**
1. Vá em "Domínios" → "Subdomínios"
2. Crie: `api.veredictajus.com.br`
3. Aponte para a mesma pasta do servidor

**Configure Nginx como proxy reverso:**

Crie o arquivo `/etc/nginx/sites-available/api.veredictajus.com.br`:

```bash
sudo nano /etc/nginx/sites-available/api.veredictajus.com.br
```

Cole:

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative e reinicie:

```bash
sudo ln -s /etc/nginx/sites-available/api.veredictajus.com.br /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl restart nginx
```

### Passo 2.9: Instalar certificado SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.veredictajus.com.br
```

---

## 🧪 3. TESTAR EM PRODUÇÃO

### Teste 1: Verificar backend está rodando

```bash
curl https://api.veredictajus.com.br/health
```

Deve retornar: `{"status":"ok","timestamp":"..."}`

### Teste 2: Verificar frontend está acessível

Acesse: `https://www.veredictajus.com.br`

### Teste 3: Testar pagamento

1. Acesse: `https://www.veredictajus.com.br/client/plans`
2. Clique em "Assinar Agora com Cartão" em qualquer plano
3. Verifique se redireciona para o Stripe
4. Complete o pagamento de teste
5. Verifique se retorna para a plataforma corretamente

---

## 🔍 4. VERIFICAÇÕES FINAIS

- [ ] Frontend acessível em `https://www.veredictajus.com.br`
- [ ] Backend respondendo em `https://api.veredictajus.com.br/health`
- [ ] CORS configurado corretamente
- [ ] SSL funcionando (HTTPS)
- [ ] PM2 mantendo o backend rodando
- [ ] Logs do backend funcionando (`pm2 logs veredicta-api`)
- [ ] Teste de pagamento funcionando

---

## 🐛 5. TROUBLESHOOTING

### Backend não responde

```bash
# Verificar se está rodando
pm2 status

# Ver logs
pm2 logs veredicta-api

# Reiniciar
pm2 restart veredicta-api
```

### Erro 404 no frontend

- Verificar se o arquivo `.htaccess` está na pasta `public_html`
- Verificar se os arquivos foram enviados corretamente

### Erro CORS

- Verificar se `ALLOWED_ORIGINS` no `.env` do backend inclui o domínio do frontend
- Verificar se o Nginx está configurado corretamente

### Erro 400 ao criar sessão de pagamento

- Verificar logs do backend: `pm2 logs veredicta-api`
- Verificar se `STRIPE_SECRET_KEY` está correto no `.env`
- Verificar se o frontend está enviando `plan`, `user_id` e `include_free_bonus`

---

## 📝 NOTAS IMPORTANTES

1. **Chaves Stripe**: Certifique-se de usar as chaves **LIVE** em produção (não as de teste)
2. **Variáveis de ambiente**: Nunca commite o arquivo `.env` no Git
3. **Backup**: Sempre faça backup antes de fazer deploy
4. **Logs**: Monitore os logs regularmente: `pm2 logs veredicta-api`
5. **SSL**: Certifique-se de que o certificado SSL está válido e renovado automaticamente

---

## ✅ DEPLOY CONCLUÍDO!

Após seguir todos os passos, seu sistema estará rodando em produção! 🎉


















