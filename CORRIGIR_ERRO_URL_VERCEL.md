# 🔧 Corrigir Erro "Failed to construct 'URL': Invalid URL"

## ❌ Erro

```
❌ Uncaught TypeError: Failed to construct 'URL': Invalid URL
```

## 🔍 Causa

A variável `VITE_APP_URL` no Vercel está:
- Vazia (undefined)
- Com valor inválido
- Não configurada corretamente

---

## ✅ SOLUÇÃO

### **PASSO 1: Verificar Variável no Vercel**

1. No Vercel, vá em **Settings** → **Environment Variables**
2. Procure por `VITE_APP_URL`
3. Se **NÃO existir** ou estiver **vazia**, continue com o passo 2

### **PASSO 2: Adicionar/Corrigir Variável**

1. Se não existir, clique em **"Add New"**
2. Se existir, clique para **editar**
3. Configure assim:
   - **Name**: `VITE_APP_URL`
   - **Value**: `https://veredictajus.vercel.app` (ou seu domínio)
   - **Environment**: Marque ✅ **Production**, ✅ **Preview**, ✅ **Development**
4. Clique em **"Save"**

### **PASSO 3: Fazer Redeploy**

Depois de corrigir a variável:

1. **Opção 1 - Redeploy automático**:
   - Vá em **Deployments**
   - Encontre o último deployment
   - Clique nos **3 pontinhos (...)** → **"Redeploy"**

2. **Opção 2 - Push no GitHub**:
   - Faça qualquer mudança no código
   - Commit e push para GitHub
   - O Vercel vai fazer deploy automaticamente

---

## ✅ Correção no Código

Já corrigi o código para validar a URL antes de usar. Depois que você fizer o commit e push, a correção vai estar lá.

---

## 📋 Checklist

- [ ] Verificar `VITE_APP_URL` no Vercel (Settings → Environment Variables)
- [ ] Adicionar/Corrigir a variável: `https://veredictajus.vercel.app`
- [ ] Marcar para Production, Preview e Development
- [ ] Fazer redeploy
- [ ] Testar o site novamente

---

**Corrija a variável no Vercel e faça redeploy!** 😊



