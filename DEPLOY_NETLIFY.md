# 🚀 Deploy no Netlify - Guia Rápido

## ✅ Por que Netlify?

- **SSL automático e gratuito** ✅
- **Deploy super fácil** (arrastar e soltar) ✅
- **Gratuito para começar** ✅
- **Perfeito para React/Vite** ✅
- **Sem configuração complicada** ✅

---

## 📝 Passo a Passo

### Passo 1: Criar Conta no Netlify

1. Acesse: **https://www.netlify.com**
2. Clique em **"Sign up"** ou **"Log in"**
3. Crie uma conta (pode usar GitHub, Google, Email, etc.)

### Passo 2: Fazer Deploy

#### Opção A: Arrastar e Soltar (Mais Fácil)

1. No dashboard do Netlify, você verá uma área grande dizendo:
   **"Want to deploy a new site without connecting to Git? Drag and drop your site output folder here"**
2. **Arraste a pasta `dist/client/`** inteira para essa área
3. Aguarde alguns segundos - o Netlify vai fazer o deploy automaticamente
4. Pronto! Você receberá uma URL tipo: `https://seu-projeto.netlify.app`

#### Opção B: Conectar GitHub (Automático)

1. No Netlify, clique em **"Add new site"** → **"Import an existing project"**
2. Escolha **"Deploy with GitHub"**
3. Autorize o Netlify a acessar seu repositório
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/client`
5. Clique em **"Deploy site"**
6. Toda vez que você fizer `git push`, o site será atualizado automaticamente!

### Passo 3: Configurar Domínio Personalizado (Opcional)

Se você quiser usar `www.veredictajus.com.br`:

1. No site no Netlify, vá em **"Site settings"** → **"Domain management"**
2. Clique em **"Add custom domain"**
3. Digite seu domínio: `www.veredictajus.com.br`
4. O Netlify vai mostrar instruções de DNS
5. Configure os registros DNS no seu provedor de domínio (Hostinger)
6. Pronto! SSL automático será configurado

### Passo 4: Configurar Redirecionamento (Importante)

Como você usa React Router (HashRouter), crie um arquivo `_redirects` na pasta `dist/client/`:

```
/*    /index.html   200
```

Ou no Netlify, vá em **"Site settings"** → **"Build & deploy"** → **"Snippets"** e adicione:

```apache
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🎯 Vantagens do Netlify

✅ **SSL automático** - Sem configuração manual
✅ **CDN global** - Site rápido no mundo todo
✅ **Deploy instantâneo** - Atualizações em segundos
✅ **Gratuito** - Plano gratuito é generoso
✅ **Fácil de usar** - Interface simples

---

## 📋 Checklist

- [ ] Criar conta no Netlify
- [ ] Fazer upload da pasta `dist/client/`
- [ ] Verificar se o site está funcionando
- [ ] Configurar domínio personalizado (se quiser)
- [ ] Configurar redirecionamento para React Router

---

## 💡 Dica

O Netlify detecta automaticamente que é um site React e configura tudo corretamente, incluindo:
- Roteamento client-side (React Router)
- SSL/HTTPS automático
- Cache de assets
- Compressão

**Tudo isso sem você precisar configurar nada (ou quase nada)!** 🎉

---

## 🔗 Links Úteis

- **Netlify**: https://www.netlify.com
- **Documentação**: https://docs.netlify.com
- **Suporte**: https://www.netlify.com/support






