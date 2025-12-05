# 🔧 Corrigir Erro CORS

## ❌ PROBLEMA IDENTIFICADO

1. **URL errada**: Está usando `verodicta.onrender.com` (com "o") em vez de `veredicta.onrender.com` (com "e")
2. **CORS bloqueado**: Backend não está permitindo requisições de `www.veredictajus.com.br`

---

## 🔧 SOLUÇÃO

### 1. Verificar URL no Vercel

A URL configurada deve ser: `https://veredicta.onrender.com` (com "e", não "o")

### 2. Atualizar CORS no Render

No Render, você precisa adicionar `https://www.veredictajus.com.br` no `ALLOWED_ORIGINS`

**Variável de ambiente no Render:**
```
ALLOWED_ORIGINS=https://veredicta-certo-flq2kmnfu-natalias-projects-649eefbe.vercel.app,https://www.veredictajus.com.br,https://veredictajus.com.br
```

---

## 📋 PASSOS PARA CORRIGIR

### Passo 1: Verificar URL no Vercel

1. Acesse: https://vercel.com
2. Vá em Settings → Environment Variables
3. Verifique se `VITE_API_URL` está como: `https://veredicta.onrender.com` (com "e")
4. Se estiver errado, atualize

### Passo 2: Atualizar CORS no Render

1. Acesse: https://dashboard.render.com
2. Vá no serviço "Veredicta"
3. Vá em "Environment"
4. Encontre `ALLOWED_ORIGINS`
5. Atualize para incluir `www.veredictajus.com.br`:
   ```
   https://veredicta-certo-flq2kmnfu-natalias-projects-649eefbe.vercel.app,https://www.veredictajus.com.br,https://veredictajus.com.br
   ```
6. Salve e aguarde o redeploy

---

## ✅ DEPOIS DE CORRIGIR

1. Aguarde o redeploy no Render (alguns segundos)
2. Teste novamente o pagamento
3. Deve funcionar! 🎉


















