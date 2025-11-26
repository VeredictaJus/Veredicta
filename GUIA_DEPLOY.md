# 🚀 Guia de Deploy - Veredicta

Este guia vai te ajudar a colocar sua plataforma Veredicta no ar com seu domínio.

## 📋 Pré-requisitos

1. ✅ Domínio registrado (ex: veredicta.com.br)
2. ✅ Conta no Supabase (já configurada)
3. ✅ Chaves de API (Stripe, Resend, etc.)

---

## 🎯 Opções de Hospedagem

### Opção 1: Vercel (Recomendado - Mais Fácil)
- ✅ Deploy automático via GitHub
- ✅ SSL gratuito
- ✅ CDN global
- ✅ Variáveis de ambiente fáceis de configurar
- ✅ Suporte a HashRouter

### Opção 2: Netlify
- ✅ Similar ao Vercel
- ✅ Deploy automático
- ✅ SSL gratuito

### Opção 3: Hostinger/VPS
- ✅ Mais controle
- ⚠️ Requer mais configuração manual

---

## 📝 Passo a Passo - Vercel (Recomendado)

### 1. Preparar o Projeto

#### 1.1 Criar arquivo `.env.production`
Crie um arquivo `.env.production` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ0OTU0NiwiZXhwIjoyMDY5MDI1NTQ2fQ.rAZtnLj7DQ3avaS_awiyptwBiTW_7vcAJVLqVuzrstU
VITE_RESEND_API_KEY=sua_chave_resend_aqui
VITE_APP_URL=https://seu-dominio.com.br
VITE_STRIPE_PUBLISHABLE_KEY=sua_chave_stripe_publica
```

#### 1.2 Ajustar vite.config.ts para Produção
O arquivo `vite.config.ts` precisa usar variáveis de ambiente em produção:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import apiRoutes from 'vite-plugin-api-routes';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    apiRoutes(),
  ],
  server: {
    port: 5176,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Em produção, as variáveis vêm do .env.production
  // Em desenvolvimento, usa as definidas no define abaixo
  define: process.env.NODE_ENV === 'production' ? {} : {
    'import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://dmsodonmkffyvbuxtxec.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
    'import.meta.env.VITE_RESEND_API_KEY': JSON.stringify(process.env.VITE_RESEND_API_KEY || ''),
    'import.meta.env.VITE_APP_URL': JSON.stringify(process.env.VITE_APP_URL || 'http://localhost:5176'),
  },
});
```

### 2. Fazer Build Local (Teste)

```bash
npm run build
```

Isso vai gerar uma pasta `dist/` com os arquivos otimizados.

### 3. Deploy na Vercel

#### 3.1 Criar Conta e Conectar GitHub
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "Add New Project"
4. Selecione o repositório da Veredicta

#### 3.2 Configurar o Projeto
- **Framework Preset:** Vite
- **Root Directory:** `workspace/veredicta` (se o projeto estiver em subpasta)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

#### 3.3 Adicionar Variáveis de Ambiente
Na seção "Environment Variables", adicione:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_SERVICE_ROLE_KEY
VITE_RESEND_API_KEY
VITE_APP_URL
VITE_STRIPE_PUBLISHABLE_KEY
```

#### 3.4 Deploy
Clique em "Deploy" e aguarde o processo.

### 4. Configurar Domínio

1. Na Vercel, vá em **Settings > Domains**
2. Adicione seu domínio (ex: veredicta.com.br)
3. Siga as instruções para configurar DNS:
   - Adicione um registro CNAME apontando para `cname.vercel-dns.com`
   - Ou adicione registros A conforme instruções da Vercel

### 5. Configurar DNS no Registrador

No painel do seu registrador de domínio (ex: Registro.br, GoDaddy):

**Opção A - CNAME (Recomendado):**
```
Tipo: CNAME
Nome: @ ou www
Valor: cname.vercel-dns.com
```

**Opção B - Registros A:**
Use os IPs fornecidos pela Vercel.

---

## 📝 Passo a Passo - Netlify

### 1. Criar Conta
1. Acesse [netlify.com](https://netlify.com)
2. Faça login com GitHub

### 2. Deploy
1. Clique em "Add new site" > "Import an existing project"
2. Conecte o repositório GitHub
3. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### 3. Variáveis de Ambiente
Vá em **Site settings > Environment variables** e adicione todas as variáveis.

### 4. Domínio
1. Vá em **Domain settings**
2. Adicione seu domínio
3. Configure DNS conforme instruções

---

## 📝 Passo a Passo - Hostinger/VPS

### 1. Fazer Build
```bash
npm run build
```

### 2. Enviar Arquivos
Use FTP/SFTP para enviar a pasta `dist/` para o servidor.

### 3. Configurar Nginx/Apache
Configure o servidor web para servir os arquivos estáticos.

### 4. Configurar SSL
Use Let's Encrypt para SSL gratuito.

---

## ⚙️ Configurações Importantes

### 1. Atualizar VITE_APP_URL
Certifique-se de que `VITE_APP_URL` no ambiente de produção aponte para seu domínio real:
```
VITE_APP_URL=https://veredicta.com.br
```

### 2. Configurar Supabase
No painel do Supabase, adicione seu domínio nas URLs permitidas:
- Settings > Authentication > Site URL
- Adicione: `https://veredicta.com.br`

### 3. Configurar Stripe
No painel do Stripe, adicione seu domínio nas configurações de webhook.

### 4. Configurar Resend
No painel do Resend, configure o domínio de envio de emails.

---

## 🔍 Verificações Pós-Deploy

1. ✅ Testar login/registro
2. ✅ Testar criação de petição
3. ✅ Testar chat
4. ✅ Testar pagamentos (modo teste primeiro)
5. ✅ Verificar emails sendo enviados
6. ✅ Testar em diferentes navegadores
7. ✅ Verificar responsividade mobile

---

## 🐛 Problemas Comuns

### Erro 404 em rotas
**Solução:** Como você usa HashRouter, isso não deve acontecer. Se usar BrowserRouter, configure redirects.

### Variáveis de ambiente não carregam
**Solução:** Certifique-se de que todas começam com `VITE_` e estão configuradas no painel da hospedagem.

### CORS errors
**Solução:** Configure CORS no Supabase para permitir seu domínio.

### Build falha
**Solução:** Verifique os logs de build e corrija erros de TypeScript/ESLint.

---

## 📞 Próximos Passos

1. Me informe qual domínio você tem
2. Qual serviço de hospedagem prefere
3. Vou te ajudar a configurar tudo passo a passo!

---

## 🔐 Segurança

⚠️ **IMPORTANTE:**
- NUNCA commite arquivos `.env` no Git
- Use variáveis de ambiente do painel da hospedagem
- Mantenha as chaves secretas seguras
- Use HTTPS sempre (SSL)









