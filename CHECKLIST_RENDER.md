# ✅ Checklist: Configurar Backend no Render para Reset de Senha

## 🔍 Verificações no Render Dashboard

### 1. Serviço Configurado Corretamente?

- [ ] **Root Directory**: `bridge` (ou vazio se package.json estiver na raiz)
- [ ] **Build Command**: `cd bridge && npm install` (ou `npm install` se root for `bridge`)
- [ ] **Start Command**: `cd bridge && npm start` (ou `npm start` se root for `bridge`)
- [ ] **Environment**: `Node`

### 2. Variáveis de Ambiente Configuradas?

Vá em **Environment** → **Add Environment Variable** e verifique se TODAS estas estão configuradas:

#### ✅ Obrigatórias:
- [ ] `PORT` = `10000` (ou deixe Render definir automaticamente)
- [ ] `SUPABASE_JWT_SECRET` = (seu secret do Supabase)
- [ ] `FIREBASE_PROJECT_ID` = `veredicta-85b8c`
- [ ] `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@veredicta-85b8c.iam.gserviceaccount.com`
- [ ] `FIREBASE_PRIVATE_KEY` = (cole TODO o conteúdo do arquivo `FIREBASE_PRIVATE_KEY_VALUE.txt`)
- [ ] `FRONTEND_URL` = `https://www.veredictajus.com.br`
- [ ] `APP_PUBLIC_URL` = `https://www.veredictajus.com.br`
- [ ] `ALLOWED_ORIGINS` = `https://www.veredictajus.com.br,https://veredictajus.com.br`
- [ ] `RESEND_API_KEY` = `re_83qumqum_4SsXPVhdwmWJXLe3BLnJuD2j`
- [ ] `STRIPE_SECRET_KEY` = (sua chave do Stripe)

### 3. URL do Backend

- [ ] Anotou a URL do Render? (ex: `https://veredicta-api-xxxx.onrender.com`)
- [ ] Configurou essa URL no frontend como `VITE_API_URL`?

### 4. Testar Backend

- [ ] Acessou `https://sua-url.onrender.com/health`?
- [ ] Retornou `{"ok":true}`?

### 5. Verificar Logs

No Render Dashboard → **Logs**, verifique se aparece:
- [ ] `✅ Bridge rodando em http://localhost:PORT`
- [ ] `✅ Firebase Admin inicializado com sucesso`
- [ ] Sem erros de inicialização

---

## 🎯 Após Configurar Tudo

1. **Teste o reset de senha** no site
2. **Deve funcionar** e enviar apenas o email bonito customizado
3. **Sem email padrão do Firebase!** ✅

---

## ❌ Se Ainda Não Funcionar

1. **Verifique os logs do Render** - veja se há erros
2. **Teste o endpoint manualmente**:
   ```bash
   curl -X POST https://sua-url.onrender.com/api/auth/password-reset-link \
     -H "Content-Type: application/json" \
     -d '{"email":"seu-email@exemplo.com"}'
   ```
3. **Verifique se todas as variáveis estão configuradas** (especialmente `FIREBASE_PRIVATE_KEY`)

---

## 📋 Valor da FIREBASE_PRIVATE_KEY

Copie TODO o conteúdo do arquivo `FIREBASE_PRIVATE_KEY_VALUE.txt` e cole no Render.

**Importante**: Cole exatamente como está, com os `\n` preservados.

