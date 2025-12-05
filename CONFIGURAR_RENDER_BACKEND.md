# 🚀 Configurar Backend no Render para Reset de Senha

## ✅ Checklist de Configuração no Render

### 1. Verificar Configuração do Serviço

No Render Dashboard, verifique se o serviço está configurado assim:

- **Root Directory**: `bridge` (ou deixe vazio se o `package.json` estiver na raiz)
- **Build Command**: `cd bridge && npm install` (ou apenas `npm install` se root directory for `bridge`)
- **Start Command**: `cd bridge && npm start` (ou apenas `npm start` se root directory for `bridge`)

### 2. Variáveis de Ambiente Obrigatórias

No Render Dashboard → Environment → Add Environment Variable, adicione:

#### Variáveis Essenciais:
```
PORT=10000
```
*(Render define automaticamente, mas você pode definir manualmente)*

#### Variáveis do Supabase:
```
SUPABASE_JWT_SECRET=<seu_secret_do_supabase>
```

#### Variáveis do Firebase (CRÍTICAS para reset de senha):
```
FIREBASE_PROJECT_ID=veredicta-85b8c
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@veredicta-85b8c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=<cole_a_chave_completa_do_FIREBASE_PRIVATE_KEY_VALUE.txt>
```

#### Variáveis do Frontend:
```
FRONTEND_URL=https://www.veredictajus.com.br
APP_PUBLIC_URL=https://www.veredictajus.com.br
ALLOWED_ORIGINS=https://www.veredictajus.com.br,https://veredictajus.com.br
```

#### Variáveis de Serviços:
```
RESEND_API_KEY=re_83qumqum_4SsXPVhdwmWJXLe3BLnJuD2j
STRIPE_SECRET_KEY=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
```

### 3. Obter URL do Backend

Após o deploy, Render vai gerar uma URL tipo:
- `https://veredicta-api.onrender.com` ou
- `https://veredicta-api-xxxx.onrender.com`

**Copie essa URL!**

### 4. Configurar Frontend

No frontend (Hostinger ou onde estiver hospedado), configure:

**Opção A: Variável de ambiente no build**
No arquivo `.env` antes de fazer o build:
```
VITE_API_URL=https://sua-url-do-render.onrender.com
```

**Opção B: Configurar no Supabase (se usar variáveis de ambiente do Supabase)**
Ou configure diretamente no código se necessário.

### 5. Testar o Backend

Acesse no navegador:
```
https://sua-url-do-render.onrender.com/health
```

Deve retornar: `{"ok":true}`

### 6. Verificar Logs

No Render Dashboard → Logs, verifique se:
- ✅ Servidor iniciou: `✅ Bridge rodando em http://localhost:PORT`
- ✅ Firebase Admin inicializado: `✅ Firebase Admin inicializado com sucesso`
- ✅ Sem erros de CORS ou outras configurações

### 7. Testar Reset de Senha

Agora quando testar "Esqueci minha senha":
1. Frontend vai chamar o backend no Render
2. Backend vai gerar o link via Firebase Admin SDK
3. Frontend vai enviar apenas o email bonito customizado
4. **Resultado: Apenas 1 email bonito, sem email padrão do Firebase!** 🎉

---

## ⚠️ Problemas Comuns

### Backend não responde
- Verifique se o serviço está "Live" no Render
- Verifique os logs para erros
- Verifique se a porta está correta (Render usa `PORT` automaticamente)

### Erro de CORS
- Adicione a URL do frontend em `ALLOWED_ORIGINS`
- Verifique se `FRONTEND_URL` está configurada

### Firebase Admin não inicializa
- Verifique se `FIREBASE_PRIVATE_KEY` está completa (com `\n`)
- Verifique se `FIREBASE_CLIENT_EMAIL` está correto
- Verifique os logs do Render

### Link de reset não funciona
- Verifique se `APP_PUBLIC_URL` ou `FRONTEND_URL` está configurada corretamente
- O link deve apontar para `https://www.veredictajus.com.br/#/auth/reset-password`

---

## 📝 Notas Importantes

- Render pode "dormir" serviços gratuitos após inatividade. Considere upgrade para plano pago se necessário
- A URL do Render pode mudar se você recriar o serviço. Mantenha `VITE_API_URL` atualizada
- Todas as variáveis de ambiente são sensíveis. Não compartilhe publicamente

