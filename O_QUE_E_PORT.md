# 🔌 O que é PORT (Porta)?

## 📖 Explicação Simples

**PORT** (porta) é como um **"número de porta"** que o servidor usa para receber conexões.

É tipo um **número de apartamento** - cada serviço tem sua porta!

---

## 🏠 Analogia

Imagine um prédio (servidor):
- **Porta 80** = Site HTTP
- **Porta 443** = Site HTTPS
- **Porta 3000** = Aplicação React (desenvolvimento)
- **Porta 3001** = Backend Node.js (desenvolvimento)
- **Porta 10000** = Backend no Render (produção)

---

## 🎯 POR QUE PORT=10000 NO RENDER?

O **Render.com** usa a porta **10000** por padrão para serviços gratuitos.

### No seu código:

O arquivo `stripe-server-standalone.js` tem esta linha:

```javascript
const PORT = process.env.PORT || 3001;
```

Isso significa:
- Se a variável `PORT` estiver definida, usa ela
- Se não estiver, usa `3001` (padrão)

### No Render:

- O Render **define automaticamente** a porta via variável de ambiente
- Geralmente é **10000** no plano gratuito
- Você **precisa** definir `PORT=10000` para garantir que funcione

---

## ⚙️ COMO FUNCIONA

### Desenvolvimento Local:
```javascript
PORT não definido → usa 3001 (padrão)
Servidor roda em: http://localhost:3001
```

### Render (Produção):
```javascript
PORT=10000 → usa 10000
Servidor roda em: https://veredicta-api.onrender.com (porta 10000 internamente)
```

---

## 🔍 OUTRAS PORTAS COMUNS

| Porta | Uso |
|-------|-----|
| **80** | HTTP (navegação web) |
| **443** | HTTPS (navegação web segura) |
| **3000** | React dev server |
| **3001** | Backend local |
| **10000** | Render.com (gratuito) |
| **5000** | Outros serviços |

---

## ✅ RESUMO

**PORT=10000** significa:
- O servidor vai "escutar" na porta 10000
- O Render usa essa porta internamente
- Você **não precisa** se preocupar com isso - o Render gerencia automaticamente
- É só uma configuração necessária para o Render funcionar

---

## 💡 IMPORTANTE

Você **não precisa** digitar a porta na URL!

❌ **ERRADO**: `https://veredicta-api.onrender.com:10000`
✅ **CORRETO**: `https://veredicta-api.onrender.com`

O Render gerencia isso automaticamente! 😊


















