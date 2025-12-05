# 🔧 Corrigir ALLOWED_ORIGINS

## ⚠️ PROBLEMA IDENTIFICADO

O `ALLOWED_ORIGINS` está assim:
```
https://veredicta-certo-bteoy7uoe-natalias-projects-649eefbe.vercel.app,https://www.veredictajus.com.br,https://www.veredictajus.com.br
```

**Problemas:**
- ❌ `www.veredictajus.com.br` está duplicado
- ❌ Falta `veredictajus.com.br` (sem www)

---

## ✅ VALOR CORRETO

Substitua por este valor:

```
https://veredicta-certo-bteoy7uoe-natalias-projects-649eefbe.vercel.app,https://www.veredictajus.com.br,https://veredictajus.com.br
```

---

## 📋 COMO CORRIGIR

1. Clique no campo `ALLOWED_ORIGINS`
2. Apague o valor atual
3. Cole este valor (sem duplicação):
   ```
   https://veredicta-certo-bteoy7uoe-natalias-projects-649eefbe.vercel.app,https://www.veredictajus.com.br,https://veredictajus.com.br
   ```
4. Clique em **"Save, rebuild, and deploy"**
5. Aguarde o redeploy

---

## ✅ CHECKLIST FINAL

- [x] PORT = `10000` ✅
- [x] FRONTEND_URL = `https://www.veredictajus.com.br` ✅
- [ ] ALLOWED_ORIGINS = (corrigir - remover duplicação e adicionar sem www)
- [x] STRIPE_SECRET_KEY = (parece correto) ✅

---

## 🎯 DEPOIS DE CORRIGIR

Após salvar, o Render vai fazer redeploy automaticamente. Aguarde alguns segundos e teste novamente o pagamento! 🚀


















