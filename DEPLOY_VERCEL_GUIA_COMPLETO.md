# 🚀 Deploy no Vercel - Guia Completo

## ✅ Você já tem:
- ✅ Código no GitHub: https://github.com/VeredictaJus/Veredicta
- ✅ Repositório configurado e pronto

---

## 📋 PASSO A PASSO PARA DEPLOY

### **PASSO 1: Acessar Vercel**

1. **Abra seu navegador**
2. **Acesse**: https://vercel.com/new
3. Se não tiver conta:
   - Clique em **"Sign Up"** (criar conta)
   - **Use sua conta do GitHub** para fazer login (é mais fácil!)
   - Autorize o Vercel

---

### **PASSO 2: Importar Repositório**

1. Na página do Vercel, você vai ver:
   - **"Import Git Repository"** (importar repositório Git)
2. Se não viu seus repositórios:
   - Clique em **"Configure Git Provider"** ou **"Add New..."**
   - Escolha **"GitHub"**
   - **Autorize o Vercel** a acessar seus repositórios
   - Marque ✅ **"All repositories"** ou apenas ✅ **"Veredicta"**
   - Clique em **"Install"**
3. **Procure** na lista: `Veredicta` ou `VeredictaJus/Veredicta`
4. **Clique** no repositório `Veredicta`
5. Clique em **"Import"**

---

### **PASSO 3: Configurar Projeto**

O Vercel vai detectar automaticamente que é um projeto Vite/React:

1. **Project Name**: `veredicta` (ou deixe como está)
2. **Framework Preset**: `Vite` (já deve estar selecionado)
3. **Root Directory**: Deixe como está (`./`)
4. **Build Command**: `pnpm run build` (ou `npm run build`)
5. **Output Directory**: `dist`
6. **Install Command**: `pnpm install` (ou `npm install`)

**⚠️ NÃO CLIQUE EM "DEPLOY" AINDA!**

---

### **PASSO 4: Configurar Variáveis de Ambiente**

**⚠️ IMPORTANTE**: Configure as variáveis ANTES de fazer deploy!

1. Na mesma página, **role para baixo** até ver:
   - **"Environment Variables"** (variáveis de ambiente)
2. **Clique em "Add"** ou **"New"** para cada variável
3. **Adicione cada uma destas variáveis**:

#### **Variável 1: Supabase URL**
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://dmsodonmkffyvbuxtxec.supabase.co`
- **Environment**: Marque ✅ **Production**, ✅ **Preview**, ✅ **Development**

#### **Variável 2: Supabase Anon Key**
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg`
- **Environment**: Marque ✅ **Production**, ✅ **Preview**, ✅ **Development**

#### **Variável 3: Supabase Service Role Key**
- **Name**: `VITE_SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ0OTU0NiwiZXhwIjoyMDY5MDI1NTQ2fQ.rAZtnLj7DQ3avaS_awiyptwBiTW_7vcAJVLqVuzrstU`
- **Environment**: Marque ✅ **Production**, ✅ **Preview**, ✅ **Development**

#### **Variável 4: App URL**
- **Name**: `VITE_APP_URL`
- **Value**: `https://veredictajus.com.br` (ou o domínio que você vai usar)
- **Environment**: Marque ✅ **Production**, ✅ **Preview**, ✅ **Development**

#### **Variável 5: Stripe Publishable Key**
- **Name**: `VITE_STRIPE_PUBLISHABLE_KEY`
- **Value**: `pk_live_51Ro45gLnE1r0oPJF03eTA26ztlbri5kwKETZYeMci6kETMGKDi1151vcrlPl0wsguTN1UDeutaHXiTcBX6r72Vnv00s4xPxkSd`
- **Environment**: Marque ✅ **Production**, ✅ **Preview**, ✅ **Development**

#### **Variável 6: Stripe Secret Key**
- **Name**: `VITE_STRIPE_SECRET_KEY`
- **Value**: `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`
- **Environment**: Marque ✅ **Production**, ✅ **Preview**, ✅ **Development**

#### **Variável 7: Resend API Key** (se tiver)
- **Name**: `VITE_RESEND_API_KEY`
- **Value**: (sua chave do Resend - se não tiver, pode deixar vazio)
- **Environment**: Marque ✅ **Production**, ✅ **Preview**, ✅ **Development**

---

### **PASSO 5: Fazer Deploy**

1. **Verifique** se todas as variáveis foram adicionadas
2. **Clique em "Deploy"** (botão grande no final da página)
3. **Aguarde** alguns minutos (o build pode demorar 2-5 minutos)
4. **Pronto!** 🎉

---

### **PASSO 6: Verificar Deploy**

1. Após o deploy concluir, você vai ver:
   - ✅ **"Deployment successful"** ou **"Ready"**
   - Uma URL automática (ex: `veredicta.vercel.app`)
2. **Clique na URL** para abrir seu site!
3. **Teste** se está funcionando corretamente

---

## 🌐 Configurar Domínio Personalizado (Opcional)

Depois que o deploy funcionar, você pode configurar seu domínio:

1. No Vercel, vá em **Settings** → **Domains**
2. Clique em **"Add Domain"**
3. Digite: `www.veredictajus.com.br`
4. Siga as instruções para configurar DNS
5. Aguarde alguns minutos para propagar

---

## 🆘 Se Tiver Problemas

### **Build Falhou?**
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Verifique o log de build (clique no deployment que falhou)
3. Me diga qual erro apareceu

### **Site Não Carrega?**
1. Verifique se o build foi concluído com sucesso
2. Verifique as variáveis de ambiente
3. Verifique o console do navegador (F12)

---

## ✅ Checklist Final

Antes de fazer deploy, verifique:

- [ ] Repositório importado no Vercel
- [ ] Framework detectado (Vite)
- [ ] Build Command: `pnpm run build`
- [ ] Output Directory: `dist`
- [ ] Todas as 7 variáveis de ambiente adicionadas
- [ ] Todas as variáveis marcadas para Production, Preview e Development
- [ ] Pronto para clicar em "Deploy"!

---

**Vá fazer o deploy agora! Me diga se precisar de ajuda em algum passo!** 🚀

