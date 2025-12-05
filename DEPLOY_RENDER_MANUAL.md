# 🚀 Deploy Manual no Render (Sem GitHub)

Se os repositórios listados não estão corretos, você pode fazer **upload manual** do arquivo!

---

## 📋 OPÇÃO 1: UPLOAD MANUAL (Mais Rápido)

### Passo 1: No Render, escolha "Public Git Repository"

1. No Render, clique na aba **"Public Git Repository"**
2. Cole a URL do seu repositório GitHub (se tiver)
3. OU continue com upload manual

### Passo 2: Ou use "Existing Image"

1. Clique na aba **"Existing Image"**
2. Isso permite fazer upload direto

---

## 📋 OPÇÃO 2: CRIAR REPOSITÓRIO NOVO (Recomendado)

### Passo 1: Criar repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `veredicta-backend` (ou qualquer nome)
3. Marque como **"Private"** ou **"Public"**
4. **NÃO** marque "Add README" (vamos fazer upload manual)
5. Clique em **"Create repository"**

### Passo 2: Fazer upload do arquivo

No seu computador, você precisa fazer upload do arquivo `stripe-server-standalone.js` para esse novo repositório.

**Via GitHub Web:**
1. No repositório novo, clique em **"uploading an existing file"**
2. Arraste o arquivo `stripe-server-standalone.js`
3. Crie também um arquivo `package.json` (veja abaixo)
4. Commit

**Ou via Git:**
```bash
# Criar pasta nova
mkdir veredicta-backend
cd veredicta-backend

# Copiar arquivo
copy ..\stripe-server-standalone.js .

# Criar package.json (veja conteúdo abaixo)
# Fazer commit e push
```

---

## 📋 OPÇÃO 3: USAR REPOSITÓRIO EXISTENTE (Mais Simples)

Se você tem um repositório GitHub que já tem o código:

1. No Render, procure pelo nome correto do repositório
2. Se não aparecer, clique em **"Connect GitHub"** ou **"Refresh"**
3. Ou use a opção **"Public Git Repository"** e cole a URL manualmente

---

## 📝 CRIAR package.json

Você precisa criar um arquivo `package.json` junto com o `stripe-server-standalone.js`:

```json
{
  "name": "veredicta-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node stripe-server-standalone.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "stripe": "^14.0.0",
    "dotenv": "^16.3.1"
  }
}
```

---

## 🎯 RECOMENDAÇÃO

**A forma mais rápida:**

1. No Render, clique em **"Public Git Repository"**
2. Se você tem o código em algum lugar, cole a URL
3. OU crie um repositório novo no GitHub só com os arquivos do backend
4. Conecte no Render

**Ou me diga qual repositório GitHub você quer usar e eu te ajudo a configurar!** 😊


















