# 📝 O QUE VOCÊ PRECISA FAZER - PASSO A PASSO SIMPLES

## ✅ O QUE EU JÁ FIZ (você não precisa fazer nada disso)

- ✅ Atualizei o código do frontend para funcionar em produção
- ✅ Atualizei o código do backend para funcionar em produção
- ✅ Corrigi os erros de pagamento
- ✅ Adicionei validações e logs

**O código está pronto! Agora você só precisa colocar ele no servidor.**

---

## 🎯 O QUE VOCÊ PRECISA FAZER (2 coisas simples)

### PARTE 1: COLOCAR O FRONTEND NO SERVIDOR (5 minutos)

**Passo 1:** No seu computador, crie um arquivo chamado `.env` na pasta do projeto (mesma pasta onde está o `package.json`)

**Passo 2:** Cole isso dentro do arquivo `.env`:
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

**Passo 3:** No terminal, execute:
```bash
npm run build
```
Isso vai criar uma pasta chamada `dist` com os arquivos prontos.

**Passo 4:** 
- Abra o FileZilla (ou programa de FTP)
- Conecte no servidor da Hostinger
- Vá até a pasta `public_html`
- Faça upload de **TODOS os arquivos** que estão dentro da pasta `dist`
- ⚠️ **Importante:** Faça upload dos arquivos DENTRO da pasta `dist`, não a pasta `dist` em si

**Passo 5:** Crie um arquivo chamado `.htaccess` dentro de `public_html` e cole isso:
```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

✅ **Pronto! Frontend está no ar!**

---

### PARTE 2: COLOCAR O BACKEND NO SERVIDOR (10 minutos)

**Você precisa ter acesso SSH ao servidor da Hostinger.**

**Passo 1:** Conecte no servidor via SSH:
```bash
ssh seu_usuario@seu_servidor_hostinger
```

**Passo 2:** Crie uma pasta para o backend:
```bash
mkdir -p /var/www/api
cd /var/www/api
```

**Passo 3:** Faça upload do arquivo `stripe-server-standalone.js` para essa pasta (via SCP ou SFTP)

**Passo 4:** Crie um arquivo `package.json` nessa pasta:
```bash
nano package.json
```
Cole isso e salve (Ctrl+O, Enter, Ctrl+X):
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

**Passo 5:** Crie um arquivo `.env` nessa pasta:
```bash
nano .env
```
Cole isso e salve:
```
PORT=3001
FRONTEND_URL=https://www.veredictajus.com.br
ALLOWED_ORIGINS=https://www.veredictajus.com.br,https://veredictajus.com.br
STRIPE_SECRET_KEY=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
```

**Passo 6:** Instale as dependências:
```bash
npm install
```

**Passo 7:** Instale o PM2 (para manter o servidor rodando):
```bash
sudo npm install -g pm2
pm2 start stripe-server-standalone.js --name "veredicta-api"
pm2 save
pm2 startup
```

**Passo 8:** Configure o Nginx para que `api.veredictajus.com.br` aponte para o backend (isso precisa ser feito no painel da Hostinger ou via SSH, dependendo da sua configuração)

**Passo 9:** Instale o certificado SSL:
```bash
sudo certbot --nginx -d api.veredictajus.com.br
```

✅ **Pronto! Backend está no ar!**

---

## 🧪 TESTAR SE FUNCIONOU

1. Acesse: `https://www.veredictajus.com.br` (deve abrir o site)
2. Teste: `https://api.veredictajus.com.br/health` (deve retornar `{"status":"ok"}`)
3. Teste o pagamento: Vá em Planos e clique em "Assinar Agora com Cartão"

---

## ❓ DÚVIDAS?

- **Não tenho acesso SSH:** Você precisa pedir acesso SSH na Hostinger ou usar outro serviço (como Render.com) para o backend
- **Não sei configurar Nginx:** Veja o arquivo `CHECKLIST_DEPLOY_PRODUCAO.md` que tem instruções detalhadas
- **Erro ao fazer build:** Certifique-se de que o arquivo `.env` está na raiz do projeto

---

## 📞 RESUMO ULTRA SIMPLES

1. **Frontend:** Criar `.env` → `npm run build` → Upload da pasta `dist` → Criar `.htaccess`
2. **Backend:** Upload do arquivo → Criar `package.json` e `.env` → `npm install` → `pm2 start` → Configurar Nginx

**É só isso!** 🎉



















