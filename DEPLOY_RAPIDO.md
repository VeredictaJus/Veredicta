# ⚡ Deploy Rápido - Veredicta na Hostinger

## 🎯 Resumo dos Passos

### 1️⃣ Preparar Build
```bash
cd workspace/veredicta
npm install
npm run build
```

### 2️⃣ Criar .env.production
Crie o arquivo `.env.production` na raiz com:
```env
VITE_SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ0OTU0NiwiZXhwIjoyMDY5MDI1NTQ2fQ.rAZtnLj7DQ3avaS_awiyptwBiTW_7vcAJVLqVuzrstU
VITE_RESEND_API_KEY=SUA_CHAVE_AQUI
VITE_APP_URL=https://www.veredictajus.com.br
VITE_STRIPE_PUBLISHABLE_KEY=SUA_CHAVE_AQUI
```

### 3️⃣ Upload para Hostinger
1. Acesse hPanel > File Manager
2. Vá em `public_html`
3. Delete tudo (faça backup!)
4. Faça upload de **TODOS** os arquivos da pasta `dist/`
5. Faça upload do arquivo `.htaccess` (já está na raiz do projeto)

### 4️⃣ Configurar SSL
- hPanel > SSL > Ativar SSL Gratuito para www.veredictajus.com.br

### 5️⃣ Configurar Supabase
- Settings > Authentication > Site URL: `https://www.veredictajus.com.br`
- Redirect URLs: adicione as rotas principais

### 6️⃣ Testar
- Acesse: https://www.veredictajus.com.br
- Teste login, registro, navegação

---

## 📁 Arquivos Importantes

- ✅ `.htaccess` - Já criado na raiz do projeto
- ✅ `vite.config.ts` - Já ajustado para produção
- ⚠️ `.env.production` - Você precisa criar com suas chaves

---

## 🆘 Precisa de Ajuda?

Consulte o guia completo: `DEPLOY_HOSTINGER.md`

























