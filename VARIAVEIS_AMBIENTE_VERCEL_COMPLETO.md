# 📋 Variáveis de Ambiente para Vercel - Guia Completo

## 🔐 Como Adicionar no Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione cada variável abaixo (uma por uma)
5. Marque **Production**, **Preview** e **Development**
6. Clique em **Save**
7. Faça um novo deploy para aplicar as mudanças

---

## ✅ Lista Completa de Variáveis

### 🌐 1. URL da API Backend (IMPORTANTE - usar URL correta)

**Nome da Variável:** `VITE_API_URL`
**Valor:**
```
https://api.veredictajus.com.br
```

⚠️ **IMPORTANTE:** Não use URLs antigas do Render como `veredicta.onrender.com` - o código agora filtra automaticamente essas URLs, mas é melhor configurar corretamente.

---

### 🔷 2. Supabase - URL

**Nome da Variável:** `VITE_SUPABASE_URL`
**Valor:**
```
https://dmsodonmkffyvbuxtxec.supabase.co
```

---

### 🔷 3. Supabase - Chave Anônima (Anon Key)

**Nome da Variável:** `VITE_SUPABASE_ANON_KEY`
**Valor:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg
```

---

### 🔥 4. Firebase - API Key

**Nome da Variável:** `VITE_FB_API_KEY`
**Valor:**
```
AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM
```

---

### 🔥 5. Firebase - Project ID

**Nome da Variável:** `VITE_FB_PROJECT_ID`
**Valor:**
```
veredicta-85b8c
```

---

### 🔥 6. Firebase - App ID

**Nome da Variável:** `VITE_FB_APP_ID`
**Valor:**
```
1:123456789:web:xxxxxxxxxxxxxxxx
```

⚠️ **ATENÇÃO:** Você precisa substituir `xxxxxxxxxxxxxxxx` pelo App ID real do Firebase. Encontre esse valor no Firebase Console → Project Settings → General → Your apps.

---

### 🔥 7. Firebase - Auth Domain

**Nome da Variável:** `VITE_FB_AUTH_DOMAIN`
**Valor:**
```
veredicta-85b8c.firebaseapp.com
```

---

### 💳 8. Stripe - Publishable Key (Chave Pública)

**Nome da Variável:** `VITE_STRIPE_PUBLISHABLE_KEY`
**Valor:**
```
pk_live_51Ro45gLnE1r0oPJF03eTA26ztlbri5kwKETZYeMci6kETMGKDi1151vcrlPl0wsguTN1UDeutaHXiTcBX6r72Vnv00s4xPxkSd
```

---

## 📝 Checklist de Configuração

Marque cada item após configurar:

- [ ] `VITE_API_URL` = `https://api.veredictajus.com.br`
- [ ] `VITE_SUPABASE_URL` = `https://dmsodonmkffyvbuxtxec.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = (valor completo acima)
- [ ] `VITE_FB_API_KEY` = `AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM`
- [ ] `VITE_FB_PROJECT_ID` = `veredicta-85b8c`
- [ ] `VITE_FB_APP_ID` = (valor real do Firebase Console)
- [ ] `VITE_FB_AUTH_DOMAIN` = `veredicta-85b8c.firebaseapp.com`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` = (valor completo acima)

---

## 🚨 Variáveis Críticas

### ⚠️ **Mais Importantes (podem causar erros se faltarem):**

1. **VITE_API_URL** - Deve ser `https://api.veredictajus.com.br` (não use URLs do Render)
2. **VITE_SUPABASE_URL** - Necessário para o banco de dados
3. **VITE_SUPABASE_ANON_KEY** - Necessário para autenticação
4. **VITE_FB_API_KEY** - Necessário para login
5. **VITE_FB_PROJECT_ID** - Necessário para Firebase

---

## 🔄 Após Configurar

1. **Salve todas as variáveis**
2. **Vá em Deployments**
3. **Clique em "Redeploy"** no último deploy (ou aguarde deploy automático)
4. **Aguarde o build completar** (pode levar 1-3 minutos)
5. **Teste a aplicação** em produção

---

## ✅ Como Verificar se Está Funcionando

1. Acesse seu site em produção
2. Abra o Console do Navegador (F12)
3. Verifique se não há erros de variáveis de ambiente
4. Teste o login/reset de senha

---

## 📞 Precisa de Ajuda?

Se alguma variável não estiver funcionando:
1. Verifique se copiou o valor completo (sem espaços)
2. Verifique se marcou todas as opções (Production, Preview, Development)
3. Faça um novo deploy após adicionar as variáveis
4. Verifique os logs do deploy no Vercel

---

**Última atualização:** 2025-01-27
**Para:** Veredicta - Legal Petition Hub




