# 🚀 Como Fazer Commit e Push para o Vercel - GUIA RÁPIDO

## ⚠️ IMPORTANTE: Onde está o repositório Git?

O repositório Git está na **raiz do projeto**: 
`C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)`

## 📋 Passo a Passo

### 1️⃣ Abrir o Terminal no Diretório Correto

**No VS Code (RECOMENDADO)**
1. Você já está no diretório correto! ✅
2. Abra o terminal integrado (Ctrl + `) ou Terminal → New Terminal
3. O terminal já estará na raiz do projeto

**No PowerShell (se preferir)**
1. Abra o PowerShell
2. Execute:
   ```powershell
   cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)"
   ```

### 2️⃣ Verificar se está no lugar certo

Execute:
```powershell
git status
```

Você deve ver algo como:
```
On branch main
Your branch is up to date with 'origin/main'.
```

### 3️⃣ Adicionar todas as alterações

```powershell
git add .
```

### 4️⃣ Fazer o commit

```powershell
git commit -m "Atualização: melhorias e correções diversas"
```

### 5️⃣ Fazer o push

```powershell
git push origin main
```

Se der erro, tente:
```powershell
git push origin master
```

## ✅ Pronto!

Depois do push, o Vercel vai detectar automaticamente as mudanças e fazer o deploy!

## 🆘 Se der erro

**Erro: "fatal: not a git repository"**
- Você não está na raiz do projeto
- Verifique se está em: `Veredicta_ Legal Petition Hub correto (5)`
- Se necessário, inicialize: `git init`

**Erro: "Permission denied" ou "Authentication failed"**
- Você precisa configurar suas credenciais do GitHub
- Ou usar um token de acesso pessoal

**Erro: "Updates were rejected"**
- Há mudanças no GitHub que você não tem localmente
- Execute primeiro: `git pull origin main` (ou `master`)

## 📝 Script Automatizado

Se preferir, você pode executar o script que criei diretamente no terminal do VS Code:

```powershell
.\workspace\veredicta\COMMIT_PUSH_VERCEL.ps1
```

O script vai:
- Verificar se há repositório git (ou criar um se necessário)
- Adicionar todas as alterações
- Fazer commit
- Fazer push para o GitHub (que vai acionar o deploy no Vercel)

