# 🔧 Solução para Erro CORS

## ❌ PROBLEMAS IDENTIFICADOS

1. **URL errada**: Está usando `verodicta.onrender.com` (com "o") 
   - Correto: `veredicta.onrender.com` (com "e")

2. **CORS bloqueado**: Backend não permite requisições de `www.veredictajus.com.br`

---

## 🔧 SOLUÇÃO

### Passo 1: Corrigir URL no Vercel

A URL deve ser: `https://veredicta.onrender.com` (com "e", não "o")

### Passo 2: Atualizar CORS no Render

No Render, você precisa atualizar a variável `ALLOWED_ORIGINS` para incluir `www.veredictajus.com.br`:

**No Render Dashboard:**
1. Vá em "Environment"
2. Encontre `ALLOWED_ORIGINS`
3. Atualize para:
   ```
   https://veredicta-certo-flq2kmnfu-natalias-projects-649eefbe.vercel.app,https://www.veredictajus.com.br,https://veredictajus.com.br
   ```
4. Salve (vai fazer redeploy automaticamente)

---

## 📋 CHECKLIST

- [ ] Verificar se `VITE_API_URL` no Vercel está como `https://veredicta.onrender.com` (com "e")
- [ ] Atualizar `ALLOWED_ORIGINS` no Render para incluir `www.veredictajus.com.br`
- [ ] Aguardar redeploy no Render
- [ ] Testar novamente

---

## ⚠️ IMPORTANTE

O erro mostra que está tentando acessar `verodicta.onrender.com` (com "o"). Isso pode ser:
- URL configurada errada no Vercel
- Ou cache do navegador

**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Ou faça hard refresh (Ctrl+F5)
3. Verifique a URL configurada no Vercel

---

## ✅ DEPOIS DE CORRIGIR

Aguarde alguns segundos para o redeploy e teste novamente! 🚀



















