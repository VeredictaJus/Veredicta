# 🖼️ Hospedar Logo para Emails - Guia Rápido

## ✅ Logo Adicionado aos Templates!

O logo agora aparece em **todos os emails**:
- 🎉 Header dos emails (branco, invertido)
- 📄 Footer dos emails (branco, semi-transparente)

---

## 🏠 Desenvolvimento (Atual)

**URL atual:** `http://localhost:5176/veredicta-logo.png`

✅ **Funciona localmente**  
❌ **NÃO funciona em produção** (URL localhost não é acessível pela internet)

---

## 🌐 Produção: Hospedar no Supabase Storage

Para que o logo apareça nos emails em produção, você precisa hospedar em uma URL pública.

### **Passo 1: Criar Bucket Público**

1. Acesse: https://dmsodonmkffyvbuxtxec.supabase.co
2. Vá em **Storage** no menu lateral
3. Clique em **"New bucket"** ou **"Create bucket"**
4. Configure:
   - **Name:** `email-assets`
   - **Public bucket:** ✅ **SIM** (muito importante!)
   - **File size limit:** 50MB
5. Clique em **"Create bucket"**

### **Passo 2: Upload do Logo**

1. Abra o bucket `email-assets` que você criou
2. Clique em **"Upload file"** ou arraste o logo
3. Selecione o arquivo: `workspace/veredicta/public/veredicta-logo.png`
4. Aguarde o upload

### **Passo 3: Copiar URL Pública**

1. Após o upload, clique no arquivo `veredicta-logo.png`
2. Procure por **"Public URL"** ou **"Get public URL"**
3. Copie a URL completa, algo como:
   ```
   https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/email-assets/veredicta-logo.png
   ```

### **Passo 4: Atualizar o Código**

Edite `src/services/emailTemplates.ts` na linha 13:

```typescript
// De (desenvolvimento):
const LOGO_URL = 'http://localhost:5176/veredicta-logo.png';

// Para (produção):
const LOGO_URL = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/email-assets/veredicta-logo.png';
```

### **Passo 5: Testar**

1. Reinicie o servidor
2. Envie um email de teste
3. Verifique se o logo aparece!

---

## 🎨 Ajustar Tamanho do Logo

Se o logo ficar muito grande ou pequeno, ajuste no CSS em `emailTemplates.ts`:

```css
.logo {
  max-width: 180px;      /* Ajuste aqui! */
  height: auto;
  margin-bottom: 20px;
}

.footer-logo {
  max-width: 120px;      /* Logo menor no footer */
  height: auto;
  margin-bottom: 15px;
  opacity: 0.8;
}
```

---

## 🔄 Alternativa: Múltiplos Ambientes

Use diferentes logos para dev e produção:

```typescript
const LOGO_URL = import.meta.env.PROD 
  ? 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/email-assets/veredicta-logo.png'  // Produção
  : 'http://localhost:5176/veredicta-logo.png';  // Desenvolvimento
```

---

## 🎨 Opções de Estilo do Logo

### **Logo Branco (Para Headers Escuros):**
```html
<img src="${LOGO_URL}" alt="Veredicta" class="logo" 
     style="filter: brightness(0) invert(1);" />
```

### **Logo Original (Para Fundos Claros):**
```html
<img src="${LOGO_URL}" alt="Veredicta" class="logo" />
```

### **Logo com Sombra:**
```html
<img src="${LOGO_URL}" alt="Veredicta" class="logo" 
     style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" />
```

---

## 📊 Estrutura de Pastas Recomendada no Supabase

```
Storage
└── email-assets (bucket público)
    ├── veredicta-logo.png          ← Logo principal
    ├── veredicta-logo-white.png    ← Versão branca (opcional)
    ├── banner-welcome.jpg          ← Banners customizados
    ├── icon-success.png            ← Ícones
    └── social-icons/
        ├── instagram.png
        ├── linkedin.png
        └── facebook.png
```

---

## 🧪 Testar Agora (Desenvolvimento)

Mesmo sem hospedar no Supabase, você pode testar **agora**:

1. Acesse: `http://localhost:5176/#/test-email`
2. Envie um email de teste
3. O logo vai aparecer **em desenvolvimento**!

---

## ⚡ Resumo Rápido

| Ambiente | URL do Logo | Status |
|----------|-------------|--------|
| **Desenvolvimento** | `http://localhost:5176/veredicta-logo.png` | ✅ Funciona |
| **Produção** | `https://supabase.co/storage/.../logo.png` | ⏳ Hospedar |

---

## 🎯 Checklist

- [x] Logo adicionado nos templates
- [x] CSS configurado (tamanho, filtros)
- [x] URL de desenvolvimento funcionando
- [ ] Upload no Supabase Storage
- [ ] URL pública copiada
- [ ] Código atualizado com URL de produção
- [ ] Testado em produção

**Logo já está funcionando em desenvolvimento! 🎉**







