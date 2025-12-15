# 🚀 Deploy na Hostinger - Veredicta

Guia específico para fazer deploy da plataforma Veredicta no domínio **www.veredictajus.com.br** na Hostinger.

---

## 📋 Pré-requisitos

- ✅ Conta na Hostinger ativa
- ✅ Domínio www.veredictajus.com.br configurado
- ✅ Acesso ao painel hPanel da Hostinger
- ✅ Acesso FTP ou File Manager

---

## 🔧 Passo 1: Preparar o Projeto Localmente

### 1.1 Criar arquivo `.env.production`

Crie um arquivo `.env.production` na raiz do projeto `workspace/veredicta/`:

```env
VITE_SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ0OTU0NiwiZXhwIjoyMDY5MDI1NTQ2fQ.rAZtnLj7DQ3avaS_awiyptwBiTW_7vcAJVLqVuzrstU
VITE_RESEND_API_KEY=sua_chave_resend_aqui
VITE_APP_URL=https://www.veredictajus.com.br
VITE_STRIPE_PUBLISHABLE_KEY=sua_chave_stripe_publica
```

**⚠️ IMPORTANTE:** 
- Substitua `sua_chave_resend_aqui` pela sua chave real do Resend
- Substitua `sua_chave_stripe_publica` pela sua chave pública do Stripe (começa com `pk_live_`)
- O arquivo `env.production.example` já existe como referência

### 1.2 Fazer Build do Projeto

No terminal, dentro da pasta `workspace/veredicta`, execute:

```bash
# Certifique-se de estar na pasta correta
cd workspace/veredicta

# Instalar dependências (se necessário)
npm install

# Fazer build para produção
npm run build
```

Isso vai criar uma pasta `dist/` com todos os arquivos otimizados para produção.

**✅ Verificação:** Após o build, verifique se a pasta `dist/` foi criada e contém:
- `index.html`
- Pasta `assets/` com arquivos .js, .css, .png

---

## 📤 Passo 2: Enviar Arquivos para Hostinger

### Opção A: Via File Manager (Mais Fácil)

1. Acesse o **hPanel** da Hostinger
2. Vá em **File Manager**
3. Navegue até a pasta `public_html` (ou a pasta do seu domínio `www.veredictajus.com.br`)
4. **IMPORTANTE:** 
   - Faça backup do conteúdo atual antes de limpar!
   - Delete todos os arquivos e pastas antigas (exceto `.htaccess` se já existir)
5. Faça upload de **TODOS os arquivos** da pasta `dist/`:
   - Selecione todos os arquivos dentro de `dist/` (incluindo `index.html` e a pasta `assets/`)
   - Faça upload para `public_html`
6. **IMPORTANTE:** Também faça upload do arquivo `.htaccess` que está na raiz do projeto

### Opção B: Via FTP

1. Use um cliente FTP (FileZilla, WinSCP, etc.)
2. Conecte usando as credenciais FTP da Hostinger
3. Navegue até `public_html`
4. Faça upload de todos os arquivos da pasta `dist/`

**Estrutura esperada no servidor:**
```
public_html/
  ├── index.html
  ├── assets/
  │   ├── *.js
  │   ├── *.css
  │   └── *.png
  └── ...
```

---

## ⚙️ Passo 3: Configurar .htaccess (Importante!)

Como você usa **HashRouter**, precisa do arquivo `.htaccess` na raiz do `public_html`.

**✅ Já criado!** O arquivo `.htaccess` já foi criado na raiz do projeto. Basta fazer upload dele junto com os arquivos da pasta `dist/`.

Se precisar criar manualmente no servidor, use este conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Forçar HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Forçar www
RewriteCond %{HTTP_HOST} !^www\. [NC]
RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Cache de assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Compressão GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

---

## 🔒 Passo 4: Configurar SSL (HTTPS)

1. No **hPanel**, vá em **SSL**
2. Ative o **SSL Gratuito** (Let's Encrypt)
3. Selecione o domínio `www.veredictajus.com.br`
4. Aguarde a ativação (pode levar alguns minutos)

---

## 🌐 Passo 5: Configurar Domínio

### 5.1 Verificar DNS

No painel da Hostinger, verifique se o domínio está apontando corretamente:
- **Tipo A:** Aponta para o IP do servidor
- **CNAME www:** Aponta para o domínio principal

### 5.2 Configurar no hPanel

1. Vá em **Domains**
2. Certifique-se de que `www.veredictajus.com.br` está configurado
3. Verifique se está apontando para a pasta correta (`public_html`)

---

## 🔐 Passo 6: Configurar Variáveis de Ambiente

Como a Hostinger não suporta variáveis de ambiente diretamente para aplicações Vite, você tem duas opções:

### Opção A: Usar arquivo de configuração (Recomendado)

Crie um arquivo `config.js` na pasta `public` que será carregado dinamicamente.

### Opção B: Injetar no build (Atual)

As variáveis são injetadas durante o build, então certifique-se de que o `.env.production` está correto antes de fazer o build.

---

## ✅ Passo 7: Verificações

Após o deploy, verifique:

1. ✅ Acesse `https://www.veredictajus.com.br`
2. ✅ Teste o login/registro
3. ✅ Teste navegação entre páginas
4. ✅ Verifique se o SSL está ativo (cadeado verde)
5. ✅ Teste em diferentes navegadores
6. ✅ Teste responsividade mobile

---

## 🔧 Configurações Adicionais Necessárias

### 1. Supabase - URLs Permitidas

No painel do Supabase:
1. Vá em **Settings > Authentication**
2. Em **Site URL**, adicione: `https://www.veredictajus.com.br`
3. Em **Redirect URLs**, adicione:
   - `https://www.veredictajus.com.br/#/auth/login`
   - `https://www.veredictajus.com.br/#/auth/register`
   - `https://www.veredictajus.com.br/#/`

### 2. Stripe - Webhooks

No painel do Stripe:
1. Vá em **Developers > Webhooks**
2. Adicione endpoint: `https://www.veredictajus.com.br/api/stripe/webhook`
3. Configure os eventos necessários

### 3. Resend - Domínio

No painel do Resend:
1. Configure o domínio `veredictajus.com.br`
2. Adicione os registros DNS conforme instruções

---

## 🐛 Solução de Problemas

### Erro 404 em rotas
**Solução:** Verifique se o arquivo `.htaccess` está na raiz do `public_html`

### Assets não carregam
**Solução:** Verifique se todos os arquivos da pasta `dist/assets/` foram enviados

### Erro de CORS
**Solução:** Configure no Supabase as URLs permitidas

### SSL não funciona
**Solução:** Aguarde alguns minutos após ativar. Se persistir, contate suporte Hostinger

### Variáveis de ambiente não funcionam
**Solução:** Certifique-se de fazer o build com o `.env.production` correto

---

## 📝 Checklist Final

- [ ] Build feito com sucesso (`npm run build`)
- [ ] Arquivos enviados para `public_html`
- [ ] Arquivo `.htaccess` criado
- [ ] SSL ativado e funcionando
- [ ] Domínio configurado corretamente
- [ ] Supabase configurado com novas URLs
- [ ] Stripe webhooks configurados
- [ ] Resend domínio configurado
- [ ] Testes realizados e funcionando

---

## 🚀 Próximos Passos

Depois que tudo estiver funcionando:

1. Configure monitoramento (Google Analytics, etc.)
2. Configure backup automático
3. Configure CDN (se necessário)
4. Otimize performance

---

**Precisa de ajuda em algum passo específico? Me avise!**

