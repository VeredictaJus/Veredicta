# 📝 Como Usar os Arquivos de Ambiente

## 🏠 Para Desenvolvimento Local (Agora)

1. **Não precisa fazer nada!** O código já está configurado para usar `localhost:3001` por padrão.

2. Se quiser criar um arquivo `.env` (opcional), copie o conteúdo de:
   ```
   env.development.example
   ```

## 🚀 Para Produção (Quando Publicar)

### Frontend (React)

Antes de fazer o build, crie um arquivo `.env` na raiz do projeto com:

```bash
VITE_API_URL=https://api.veredictajus.com.br
```

E todas as outras variáveis que estão em `env.production.example`.

Então faça o build:
```bash
npm run build
```

### Backend (Node.js)

No servidor (Hostinger), crie um arquivo `.env` com:

```bash
PORT=3001
FRONTEND_URL=https://www.veredictajus.com.br
ALLOWED_ORIGINS=https://www.veredictajus.com.br,https://veredictajus.com.br
STRIPE_SECRET_KEY=sk_live_51Ro45gLnE1r0oPJF...
```

Use o arquivo `env.production.example` como referência.

---

## 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `env.development.example` | Configurações para desenvolvimento local |
| `env.production.example` | Configurações para produção (veredictajus.com.br) |
| `GUIA_DE_DEPLOY.md` | Guia completo de como fazer deploy |
| `stripe-server-standalone.js` | Servidor backend com Stripe integrado |

---

## ✅ O que Foi Alterado no Código

### 1. `Checkout.tsx` (linha 122)

**Antes:**
```typescript
const response = await fetch('http://localhost:3001/api/stripe/create-checkout-session', {
```

**Depois:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
```

### 2. `stripe-server-standalone.js`

**Antes:**
```javascript
const PORT = 3001;
success_url: `http://localhost:5175/client?...`,
```

**Depois:**
```javascript
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5175';
success_url: `${FRONTEND_URL}/client?...`,
```

---

## 🎯 Resumo

✅ **Agora (Desenvolvimento)**: Continue trabalhando normalmente, tudo funciona com localhost!

✅ **Depois (Produção)**: Crie arquivo `.env` baseado em `env.production.example` e faça deploy!

---

## 🤔 Dúvidas?

Leia o arquivo `GUIA_DE_DEPLOY.md` para instruções detalhadas de como publicar.














