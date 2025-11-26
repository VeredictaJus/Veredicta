# 🚀 COMEÇAR AGORA - GitHub + Vercel

## 📋 Checklist Inicial

Antes de começar, você precisa:

- [ ] Conta no GitHub (https://github.com/signup)
- [ ] Git instalado no seu computador (https://git-scm.com/download/win)
- [ ] Conta no Vercel (você já tem!)

---

## 🎯 Passo a Passo Rápido

### **PASSO 1: Criar Repositório no GitHub**

1. Acesse: https://github.com/new
2. **Repository name**: `veredicta` (ou outro nome)
3. Deixe **público** ou **privado**
4. **NÃO** marque "Initialize with README"
5. Clique em **"Create repository"**
6. **Anote a URL** que aparece (ex: `https://github.com/SEU_USUARIO/veredicta.git`)

### **PASSO 2: Preparar o Código para GitHub**

No terminal, na pasta do projeto, execute estes comandos:

```powershell
# 1. Navegar para a pasta do projeto
cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace\veredicta"

# 2. Inicializar Git (se não foi feito)
git init

# 3. Configurar Git (se não configurou antes)
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"

# 4. Adicionar todos os arquivos
git add .

# 5. Fazer commit
git commit -m "Initial commit - Veredicta plataforma"

# 6. Adicionar remote do GitHub (SUBSTITUA pela URL do seu repositório)
git remote add origin https://github.com/SEU_USUARIO/veredicta.git

# 7. Fazer push
git branch -M main
git push -u origin main
```

> ⚠️ **IMPORTANTE**: Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub!

### **PASSO 3: Conectar no Vercel**

1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Se não tiver GitHub conectado:
   - Clique em **"Configure Git Provider"**
   - Escolha **"GitHub"**
   - Autorize o Vercel
4. Selecione o repositório `veredicta`
5. Clique em **"Import"**

### **PASSO 4: Configurar ANTES de Deployar**

**IMPORTANTE**: Configure as variáveis ANTES de clicar em "Deploy"!

1. Na tela de configuração, role até **"Environment Variables"**
2. Adicione estas 3 variáveis:

**VITE_SUPABASE_URL**:
```
https://dmsodonmkffyvbuxtxec.supabase.co
```

**VITE_SUPABASE_ANON_KEY**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg
```

**VITE_APP_URL**:
```
Deixe vazio por enquanto, vamos atualizar depois
```

3. Marque todas para: **Production**, **Preview** e **Development**
4. Clique em **"Save"** para cada uma

### **PASSO 5: Fazer Deploy**

1. Após configurar as variáveis, clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Pronto! 🎉

---

## ✅ Depois do Deploy

1. Quando o deploy terminar, você receberá uma URL tipo: `https://veredicta-xxxxx.vercel.app`
2. Vá em **Settings > Environment Variables**
3. Edite `VITE_APP_URL` e coloque a URL real do seu site
4. Faça um novo push (ou redeploy) para atualizar

---

## 🎉 Pronto!

Agora, toda vez que você fizer `git push`, o Vercel faz deploy automaticamente!

**Me diga:**
1. Você já tem conta no GitHub?
2. Você tem Git instalado no computador?
3. Quer que eu ajude a fazer os comandos Git agora?

**Aguardo sua resposta para continuarmos!** 😊








