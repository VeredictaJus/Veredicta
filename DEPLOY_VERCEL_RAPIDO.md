# 🚀 Deploy no Vercel - Passo a Passo Rápido

## ⚡ Método Mais Fácil: Arrastar e Soltar

### 📍 Localização dos Arquivos

No seu computador, abra esta pasta:
```
C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace\veredicta\dist\client\
```

---

## 🎯 Passo a Passo

### 1️⃣ Criar Conta no Vercel

1. Acesse: **https://vercel.com**
2. Clique em **"Sign Up"** (canto superior direito)
3. Escolha uma forma de criar conta:
   - **GitHub** (recomendado - mais rápido)
   - **Google**
   - **Email**
4. Complete o cadastro

### 2️⃣ Fazer Deploy

1. Depois de fazer login, você verá o **Dashboard** do Vercel
2. Clique no botão grande **"Add New..."** → **"Project"**
   - OU clique em **"Import Project"**
3. Você verá uma página com opções. Procure por:
   - **"Deploy"** ou
   - **"Upload"** ou
   - Uma área grande para arrastar arquivos
4. **Arraste a pasta `dist/client/` inteira** para essa área
   - Ou clique em "Browse" e selecione a pasta `dist/client/`
5. O Vercel vai:
   - Fazer upload dos arquivos
   - Detectar que é um site React
   - Configurar tudo automaticamente
   - Fazer o deploy
6. Aguarde 1-2 minutos
7. **Pronto!** Você receberá uma URL tipo:
   - `https://veredicta-xxxxx.vercel.app`

### 3️⃣ Testar o Site

1. Clique na URL que o Vercel forneceu
2. O site deve carregar com **HTTPS automático** ✅
3. Teste a navegação e funcionalidades

---

## 🌐 Configurar Domínio Personalizado (Opcional)

Se você quiser usar `www.veredictajus.com.br`:

1. No projeto no Vercel, vá em **"Settings"** (ícone de engrenagem)
2. Clique em **"Domains"** no menu lateral
3. Clique em **"Add"** ou **"Add Domain"**
4. Digite: `www.veredictajus.com.br`
5. O Vercel vai mostrar instruções de DNS:
   - Tipo: **CNAME**
   - Nome: `www`
   - Valor: `cname.vercel-dns.com`
6. Configure isso no painel da Hostinger (em "Domínios" → "DNS")
7. Aguarde alguns minutos
8. Pronto! SSL automático será configurado

---

## ✅ O que o Vercel faz automaticamente

- ✅ SSL/HTTPS automático
- ✅ Roteamento React Router (sem precisar de `.htaccess`)
- ✅ Cache de assets
- ✅ Compressão GZIP
- ✅ CDN global (site rápido no mundo todo)

---

## 🆘 Se tiver problemas

### Problema: Não encontro onde arrastar arquivos

**Solução:**
- Procure por **"Deploy"** ou **"Upload"** no dashboard
- Ou use a opção de conectar GitHub (mais avançado)

### Problema: Site não carrega

**Solução:**
- Verifique se arrastou a pasta `dist/client/` completa
- Aguarde alguns minutos para o deploy terminar
- Verifique os logs no Vercel

### Problema: Erro no deploy

**Solução:**
- Certifique-se de que arrastou a pasta `dist/client/` (não `dist`)
- Verifique se o arquivo `index.html` está dentro da pasta

---

## 📋 Checklist Rápido

- [ ] Criar conta no Vercel
- [ ] Arrastar pasta `dist/client/` para o Vercel
- [ ] Aguardar deploy (1-2 minutos)
- [ ] Testar o site na URL fornecida
- [ ] Configurar domínio personalizado (opcional)

---

## 🎉 Pronto!

Depois do deploy, seu site estará:
- ✅ No ar com HTTPS automático
- ✅ Rápido (CDN global)
- ✅ Funcionando perfeitamente

**Muito mais fácil que a Hostinger!** 🚀









