# 📤 Como Fazer Deploy no Vercel - Guia Completo

## ✅ **DEPLOY CONCLUÍDO!**

Seu site está no ar! 🎉

### 🌐 URLs do Site:

- **🌍 Produção (Site Público)**: https://client-q3zgxuzhn-natalias-projects-649eefbe.vercel.app
- **📊 Painel/Dashboard**: https://vercel.com/natalias-projects-649eefbe/client/9WJ1eLurrdzyKk9Cnm1BJPiSXWGG
- **⚙️ Configurações**: https://vercel.com/natalias-projects-649eefbe/client/settings

### 🔗 Próximo Passo: Configurar Domínio Personalizado

Para usar `www.veredictajus.com.br`:

1. Acesse as **Configurações**: https://vercel.com/natalias-projects-649eefbe/client/settings
2. Vá em **Domains**
3. Clique em **Add Domain**
4. Digite: `www.veredictajus.com.br`
5. Siga as instruções para configurar o DNS no Hostinger

---

## 🎯 Métodos de Deploy

### **Método 1: Deploy via Git (Recomendado - Automático)**

Este é o método mais recomendado, pois permite deploy automático a cada push.

#### Passo 1: Preparar o Repositório Git

1. Certifique-se de que seu projeto está em um repositório Git (GitHub, GitLab ou Bitbucket)
2. Faça commit de todas as alterações:
   ```bash
   git add .
   git commit -m "Preparar para deploy no Vercel"
   git push
   ```

#### Passo 2: Conectar no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Importe seu repositório Git
4. O Vercel detectará automaticamente que é um projeto Vite/React

#### Passo 3: Configurar Variáveis de Ambiente

No Vercel, vá em **Settings > Environment Variables** e adicione:

```
VITE_SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
VITE_RESEND_API_KEY=sua_chave_resend_aqui
VITE_APP_URL=https://seu-dominio.vercel.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51Ro45gLnE1r0oPJF03eTA26ztlbri5kwKETZYeMci6kETMGKDi1151vcrlPl0wsguTN1UDeutaHXiTcBX6r72Vnv00s4xPxkSd
```

> 💡 **Importante**: Marque todas como **Production**, **Preview** e **Development**

#### Passo 4: Configurar Build Settings

O arquivo `vercel.json` já está configurado! O Vercel usará:
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

#### Passo 5: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (geralmente 2-5 minutos)
3. Pronto! Seu site estará no ar! 🎉

---

### **Método 2: Deploy via CLI (Rápido e Direto)**

#### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Passo 2: Fazer Login

```bash
vercel login
```

Isso abrirá o navegador para você fazer login.

#### Passo 3: Navegar até a Pasta do Projeto

```bash
cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace\veredicta"
```

#### Passo 4: Configurar Variáveis de Ambiente (Opcional)

Crie um arquivo `.env.production` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg
VITE_APP_URL=https://seu-dominio.vercel.app
```

#### Passo 5: Fazer Deploy

```bash
vercel --prod
```

Siga as instruções:
- Confirme o projeto
- Confirme as configurações
- Pronto! 🚀

---

### **Método 3: Deploy Manual (Upload de Arquivos)**

#### Passo 1: Fazer Build Local

```bash
cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace\veredicta"
pnpm run build
```

Isso criará a pasta `dist` com os arquivos otimizados.

#### Passo 2: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Passo 3: Fazer Deploy da Pasta dist

```bash
cd dist
vercel --prod
```

---

## ⚙️ Configurações Importantes

### Arquivo `vercel.json`

O arquivo `vercel.json` já está criado na raiz do projeto com as configurações corretas:
- ✅ Build command configurado
- ✅ Output directory configurado
- ✅ Rewrites para React Router (SPA)
- ✅ Cache headers para assets

### Variáveis de Ambiente

**IMPORTANTE**: Todas as variáveis que começam com `VITE_` precisam ser configuradas no Vercel:

1. Acesse seu projeto no Vercel
2. Vá em **Settings > Environment Variables**
3. Adicione todas as variáveis necessárias
4. Marque para **Production**, **Preview** e **Development**

### Domínio Customizado

Para usar seu próprio domínio (ex: `veredictajus.com.br`):

1. No Vercel, vá em **Settings > Domains**
2. Adicione seu domínio
3. Siga as instruções de DNS
4. Aguarde a propagação (pode levar até 24h)

---

## 🔧 Troubleshooting

### Erro: "Build failed"

- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique se o `package.json` tem o script `build` correto
- Verifique os logs de build no Vercel

### Erro: "404 Not Found" em rotas

- O arquivo `vercel.json` já tem os rewrites configurados
- Se ainda assim não funcionar, verifique se o `vercel.json` está na raiz do projeto

### Erro: "Module not found"

- Certifique-se de que todas as dependências estão no `package.json`
- O Vercel instala automaticamente via `pnpm install`

---

## 📝 Checklist Final

Antes de fazer deploy, certifique-se de:

- [ ] Arquivo `vercel.json` está na raiz do projeto
- [ ] Todas as variáveis de ambiente estão configuradas no Vercel
- [ ] O projeto faz build localmente (`pnpm run build`)
- [ ] O arquivo `.env.production` tem as variáveis corretas (se usar CLI)
- [ ] O domínio está configurado (se aplicável)

---

## 🚀 Próximos Passos

Após o deploy:

1. Teste todas as funcionalidades no ambiente de produção
2. Configure o domínio customizado (se necessário)
3. Configure monitoramento e analytics
4. Configure backups automáticos (se necessário)

---

## 💡 Dicas

- O Vercel faz deploy automático a cada push no Git (se usar Método 1)
- Cada deploy gera uma URL única para preview
- O Vercel oferece SSL gratuito
- O Vercel tem CDN global para performance máxima


