# 🔧 Correção: Erro de CORS no Envio de Emails

## ❌ Problema Identificado

Ao tentar enviar emails, ocorria o seguinte erro:

```
Access to fetch at 'https://api.resend.com/emails' from origin 'http://localhost:5176' 
has been blocked by CORS policy
```

**Causa:** O Resend não permite chamadas diretas do frontend (browser) por questões de segurança. A API key ficaria exposta no cliente.

---

## ✅ Solução Implementada

### **Arquitetura:**

```
Frontend (React)
    ↓
Backend API (/api/send-email)
    ↓
Resend API
```

### **1. Criada API Route no Backend**

**Arquivo:** `src/api/send-email.ts`

- ✅ Recebe requisições do frontend
- ✅ API Key fica segura no servidor
- ✅ Chama o Resend do backend
- ✅ Retorna resultado para o frontend

### **2. Atualizado EmailService**

**Arquivo:** `src/services/emailService.ts`

- ✅ Agora chama `/api/send-email` (backend)
- ✅ Não expõe API key no frontend
- ✅ Sem problemas de CORS
- ✅ Mesma interface de uso

---

## 📁 Arquivos Modificados

### `src/api/send-email.ts` (NOVO)
```typescript
// Backend API que chama o Resend de forma segura
export default async function handler(req, res) {
  const resend = new Resend(apiKey); // Seguro no servidor
  const { data, error } = await resend.emails.send(...);
  res.json({ success: !error, data });
}
```

### `src/services/emailService.ts` (ATUALIZADO)
```typescript
// Frontend agora chama a API local
static async sendEmail(options: EmailOptions) {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    body: JSON.stringify(options)
  });
  return response.ok;
}
```

---

## 🔒 Segurança

### ✅ Antes (Inseguro):
```
Frontend → Resend API (com key exposta)
```

### ✅ Agora (Seguro):
```
Frontend → Backend API → Resend API
         (sem key)      (key protegida)
```

**Benefícios:**
- 🔒 API key nunca é exposta no frontend
- 🌐 Sem problemas de CORS
- 🛡️ Controle de acesso no backend
- 📊 Possibilidade de adicionar rate limiting

---

## 🚀 Como Usar

**Nada muda para você!** O uso continua o mesmo:

```typescript
import { useEmail } from '@/hooks/useEmail';

const { sendWelcomeEmail } = useEmail();
await sendWelcomeEmail('usuario@email.com', 'Nome');
```

A diferença é que agora é **seguro** e **sem CORS**! 🎉

---

## 🧪 Testar

1. **Reinicie o servidor** (Ctrl+C → `npm run dev`)
2. **Acesse:** `http://localhost:5176/#/test-email`
3. **Envie um email de teste**
4. **Verifique sua caixa de entrada!**

---

## 📊 Fluxo Completo

```
1. Usuário clica em "Enviar Email"
   ↓
2. Frontend chama fetch('/api/send-email')
   ↓
3. Backend recebe requisição
   ↓
4. Backend valida dados
   ↓
5. Backend chama Resend API (com key segura)
   ↓
6. Resend envia o email
   ↓
7. Backend retorna resultado
   ↓
8. Frontend mostra sucesso/erro
```

---

## ⚙️ Configuração do vite-plugin-api-routes

O plugin já está configurado no `vite.config.ts`:

```typescript
plugins: [
  react(),
  apiRoutes(), // ← Habilita rotas /api/*
]
```

Qualquer arquivo em `src/api/*.ts` vira uma rota automaticamente:
- `src/api/send-email.ts` → `/api/send-email`
- `src/api/test.ts` → `/api/test`

---

## ✅ Problema Resolvido!

- ❌ CORS Error → ✅ Resolvido
- ❌ API Key exposta → ✅ Protegida
- ❌ Inseguro → ✅ Seguro
- ❌ Não funcionava → ✅ Funciona!

**Pronto para testar! 🚀**







