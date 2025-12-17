# 🚀 Deploy via GitHub + Vercel (RECOMENDADO!)

## ✅ Por que usar GitHub + Vercel?

- ✅ **Build automático** a cada push
- ✅ **Variáveis de ambiente** configuradas facilmente no painel
- ✅ **Deploy automático** quando você faz commit
- ✅ **Mais confiável** que deploy direto via CLI
- ✅ **Histórico de versões** no Git
- ✅ **Rollback fácil** se algo der errado

---

## 📋 Passo a Passo Completo

### **PASSO 1: Criar Repositório no GitHub**

1. Acesse: https://github.com/new
2. **Repository name**: `veredicta` (ou outro nome que você preferir)
3. Deixe **público** ou **privado** (sua escolha)
4. **NÃO** marque "Initialize this repository with a README"
5. Clique em **"Create repository"**

### **PASSO 2: Fazer Commit e Push do Código**

No terminal, na pasta do projeto:

```powershell
# 1. Inicializar Git (se ainda não foi feito)
cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace\veredicta"
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer commit
git commit -m "Initial commit - Veredicta plataforma"

# 4. Adicionar remote do GitHub (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/veredicta.git

# 5. Fazer push
git branch -M main
git push -u origin main
```

> 💡 **Importante**: Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub

### **PASSO 3: Conectar no Vercel**

1. Acesse: https://vercel.com
2. Clique em **"Add New Project"** ou **"Import Project"**
3. Clique em **"Import Git Repository"**
4. Se não tiver conectado GitHub ainda:
   - Clique em **"Configure Git Provider"**
   - Escolha **"GitHub"**
   - Autorize o Vercel a acessar seus repositórios
5. Selecione o repositório `veredicta` (ou o nome que você deu)
6. Clique em **"Import"**

### **PASSO 4: Configurar Build Settings**

O Vercel vai detectar automaticamente que é um projeto Vite. Verifique:

- **Framework Preset**: Vite
- **Build Command**: `pnpm run build` (ou deixe o padrão)
- **Output Directory**: `dist`
- **Install Command**: `pnpm install --no-frozen-lockfile`

### **PASSO 5: Configurar Variáveis de Ambiente**

**ANTES de clicar em "Deploy"**, configure as variáveis:

1. Clique em **"Environment Variables"**
2. Adicione estas 3 variáveis:

#### Variável 1: VITE_SUPABASE_URL
```
Key: VITE_SUPABASE_URL
Value: https://dmsodonmkffyvbuxtxec.supabase.co
Ambientes: ✅ Production ✅ Preview ✅ Development
```

#### Variável 2: VITE_SUPABASE_ANON_KEY
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg
Ambientes: ✅ Production ✅ Preview ✅ Development
```

#### Variável 3: VITE_APP_URL
```
Key: VITE_APP_URL
Value: https://veredicta-xxxxx.vercel.app (você receberá após o deploy)
Ambientes: ✅ Production ✅ Preview ✅ Development
```

3. Clique em **"Save"** para cada variável

### **PASSO 6: Fazer Deploy**

1. Após configurar as variáveis, clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Pronto! 🎉

---

## 🎯 Vantagens Dessa Abordagem

### ✅ **Build Automático**
- Cada vez que você fizer `git push`, o Vercel faz deploy automaticamente
- Não precisa fazer deploy manual

### ✅ **Variáveis Configuradas Uma Vez**
- Configure as variáveis uma vez no painel
- Funcionam para todos os deploys futuros

### ✅ **Histórico de Versões**
- Cada deploy fica registrado
- Pode fazer rollback facilmente se algo der errado

### ✅ **Preview Deploys**
- Cada Pull Request gera uma URL de preview
- Pode testar mudanças antes de fazer merge

---

## 🔧 Após o Primeiro Deploy

### Atualizar VITE_APP_URL

1. Após o deploy concluir, você receberá uma URL tipo: `https://veredicta-xxxxx.vercel.app`
2. Vá em **Settings > Environment Variables**
3. Edite a variável `VITE_APP_URL` e atualize com a URL real
4. Faça um novo deploy (ou o Vercel pode fazer automaticamente)

---

## 📝 Comandos Úteis

### Fazer Mudanças e Deploy

```powershell
# 1. Fazer alterações no código

# 2. Adicionar ao Git
git add .

# 3. Fazer commit
git commit -m "Descrição da mudança"

# 4. Fazer push (deploy automático!)
git push
```

---

## 🆘 Troubleshooting

### Erro: "Build failed"
- Verifique os logs do build no Vercel
- Verifique se todas as variáveis estão configuradas

### Erro: "supabaseKey is required"
- Certifique-se de que as variáveis estão configuradas
- Certifique-se de que estão marcadas para Production

### Deploy não atualiza
- Verifique se fez `git push`
- Verifique os logs no Vercel

---

## 🎉 Pronto!

Com essa abordagem, seu deploy vai funcionar muito melhor!

**Vantagens:**
- ✅ Mais fácil de configurar
- ✅ Mais confiável
- ✅ Deploy automático
- ✅ Histórico de versões

**Me diga se você já tem uma conta no GitHub e vamos começar!** 😊



























