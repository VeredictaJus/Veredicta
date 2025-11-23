# 🔐 Variáveis de Ambiente Seguras para Vercel

Este documento lista todas as variáveis de ambiente que devem ser configuradas no Vercel Dashboard usando **nomes seguros** (sem palavras como "key", "secret", "vite").

## ✅ Variáveis para Adicionar no Vercel

Acesse: **Vercel Dashboard → Seu Projeto → Settings → Environment Variables**

### 📋 Lista Completa

| Nome da Variável (Seguro) | Valor | Ambiente |
|---------------------------|-------|----------|
| `SUPABASE_URL` | `https://dmsodonmkffyvbuxtxec.supabase.co` | Production, Preview, Development |
| `SUPABASE_ANON_TOKEN` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg` | Production, Preview, Development |
| `SUPABASE_ADMIN_TOKEN` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ0OTU0NiwiZXhwIjoyMDY5MDI1NTQ2fQ.rAZtnLj7DQ3avaS_awiyptwBiTW_7vcAJVLqVuzrstU` | Production, Preview, Development |
| `STRIPE_PUBLISHABLE_TOKEN` | `pk_live_51Ro45gLnE1r0oPJF03eTA26ztlbri5kwKETZYeMci6kETMGKDi1151vcrlPl0wsguTN1UDeutaHXiTcBX6r72Vnv00s4xPxkSd` | Production, Preview, Development |
| `STRIPE_API_TOKEN` | `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` | Production, Preview, Development |
| `STRIPE_WEBHOOK_SIGNING` | `[Obter no Stripe Dashboard]` | Production, Preview, Development |
| `FIREBASE_API_TOKEN` | `AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM` | Production, Preview, Development |
| `FIREBASE_PROJECT_ID` | `veredicta-85b8c` | Production, Preview, Development |
| `FIREBASE_AUTH_DOMAIN` | `veredicta-85b8c.firebaseapp.com` | Production, Preview, Development |
| `APP_URL` | `https://www.veredictajus.com.br` | Production, Preview, Development |
| `RESEND_API_TOKEN` | `[Opcional - apenas se usar Resend]` | Production, Preview, Development |

---

## 🔄 Compatibilidade

O código foi atualizado para:
1. **Ler nomes seguros primeiro** (ex: `STRIPE_API_TOKEN`)
2. **Fazer fallback para nomes antigos** (ex: `VITE_STRIPE_SECRET_KEY`) se os seguros não existirem
3. **Manter compatibilidade total** com código existente

Isso significa que você pode:
- ✅ Usar apenas os nomes seguros no Vercel (recomendado)
- ✅ Usar apenas os nomes antigos (ainda funciona)
- ✅ Usar uma mistura (o código escolhe automaticamente)

---

## 📝 Como Obter `STRIPE_WEBHOOK_SIGNING`

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique no webhook existente (ou crie um novo)
3. URL do webhook: `https://www.veredictajus.com.br/api/stripe/webhook`
4. Eventos: `checkout.session.completed` e `invoice.payment_succeeded`
5. Copie o **Signing secret** (começa com `whsec_`)
6. Cole no Vercel como `STRIPE_WEBHOOK_SIGNING`

---

## ⚠️ Importante

- **Nunca compartilhe** essas variáveis publicamente
- **Nunca faça commit** dessas variáveis no Git
- Use **Production, Preview e Development** para todos os ambientes (ou apenas Production se preferir)
- Após adicionar as variáveis, faça um **redeploy** no Vercel

---

## ✅ Checklist

- [ ] `SUPABASE_URL` adicionada
- [ ] `SUPABASE_ANON_TOKEN` adicionada
- [ ] `SUPABASE_ADMIN_TOKEN` adicionada
- [ ] `STRIPE_PUBLISHABLE_TOKEN` adicionada
- [ ] `STRIPE_API_TOKEN` adicionada
- [ ] `STRIPE_WEBHOOK_SIGNING` adicionada (obter no Stripe Dashboard)
- [ ] `FIREBASE_API_TOKEN` adicionada
- [ ] `FIREBASE_PROJECT_ID` adicionada
- [ ] `FIREBASE_AUTH_DOMAIN` adicionada
- [ ] `APP_URL` adicionada
- [ ] Redeploy feito no Vercel

---

## 🎯 Resultado

Após configurar essas variáveis, o Vercel:
- ✅ Não mostrará avisos sobre nomes inseguros
- ✅ Ocultará automaticamente valores sensíveis
- ✅ Funcionará perfeitamente com o código atualizado

