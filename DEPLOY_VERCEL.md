# 🚀 Deploy no Vercel - Guia Rápido

## ✅ Por que Vercel?

- **SSL automático e gratuito** ✅
- **Deploy super fácil** (arrastar e soltar) ✅
- **Gratuito para começar** ✅
- **Perfeito para React/Vite** ✅
- **Sem configuração complicada** ✅

---

## 📝 Passo a Passo

### Passo 1: Criar Conta no Vercel

1. Acesse: **https://vercel.com**
2. Clique em **"Sign Up"** ou **"Sign In"**
3. Crie uma conta (pode usar GitHub, Google, etc.)

### Passo 2: Fazer Deploy

#### Opção A: Arrastar e Soltar (Mais Fácil)

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Escolha **"Import"** ou **"Deploy"**
3. Na página de deploy, você verá uma área para arrastar arquivos
4. **Arraste a pasta `dist/client/`** inteira para essa área
5. Aguarde alguns segundos - o Vercel vai fazer o deploy automaticamente
6. Pronto! Você receberá uma URL tipo: `https://seu-projeto.vercel.app`

#### Opção B: Conectar GitHub (Automático)

1. No Vercel, clique em **"Add New..."** → **"Project"**
2. Conecte seu repositório GitHub
3. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/client`
   - **Install Command**: `npm install`
4. Clique em **"Deploy"**
5. Toda vez que você fizer `git push`, o site será atualizado automaticamente!

### Passo 3: Configurar Domínio Personalizado (Opcional)

Se você quiser usar `www.veredictajus.com.br`:

1. No projeto no Vercel, vá em **"Settings"** → **"Domains"**
2. Adicione seu domínio: `www.veredictajus.com.br`
3. O Vercel vai mostrar instruções de DNS
4. Configure os registros DNS no seu provedor de domínio (Hostinger)
5. Pronto! SSL automático será configurado

---

## 🎯 Vantagens do Vercel

✅ **SSL automático** - Sem configuração manual
✅ **CDN global** - Site rápido no mundo todo
✅ **Deploy instantâneo** - Atualizações em segundos
✅ **Gratuito** - Plano gratuito é generoso
✅ **Fácil de usar** - Interface simples

---

## 📋 Checklist

- [ ] Criar conta no Vercel
- [ ] Fazer upload da pasta `dist/client/`
- [ ] Verificar se o site está funcionando
- [ ] Configurar domínio personalizado (se quiser)

---

## 💡 Dica

O Vercel detecta automaticamente que é um site React e configura tudo corretamente, incluindo:
- Roteamento client-side (React Router)
- SSL/HTTPS automático
- Cache de assets
- Compressão GZIP

**Tudo isso sem você precisar configurar nada!** 🎉

---

## 🔗 Links Úteis

- **Vercel**: https://vercel.com
- **Documentação**: https://vercel.com/docs
- **Suporte**: https://vercel.com/support









