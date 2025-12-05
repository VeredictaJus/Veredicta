# 🔐 Como Criar Token de Acesso do GitHub

## ❌ Problema

O push está falhando porque precisa de autenticação. O GitHub não permite mais usar senha, precisa usar um **token de acesso pessoal**.

## ✅ Solução: Criar Token de Acesso

### Passo 1: Criar Token

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome: `veredicta-deploy` (ou outro nome)
4. Selecione as permissões:
   - ✅ **repo** (tudo dentro de "repo")
     - ✅ repo:status
     - ✅ repo_deployment
     - ✅ public_repo (se for público)
     - ✅ repo:invite
     - ✅ security_events
5. Clique em **"Generate token"** (no final da página)
6. **COPIE O TOKEN IMEDIATAMENTE** (você só vai ver uma vez!)

### Passo 2: Usar o Token no Push

Quando fizer o push, ele vai pedir:
- **Username**: Seu usuário do GitHub (ex: `nataliayamao`)
- **Password**: **Cole o token aqui** (não sua senha!)

---

## 🚀 Após Criar o Token

1. **Me diga quando criou o token**
2. **Vou fazer o push** com o token

---

## 💡 Alternativa: GitHub Desktop

Se preferir algo mais visual:

1. Baixe: https://desktop.github.com/
2. Instale e abra
3. Faça login no GitHub
4. Clique em **"File" → "Add Local Repository"**
5. Selecione a pasta: `C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace\veredicta`
6. O GitHub Desktop vai mostrar "Publish repository"
7. Clique em **"Publish repository"**

---

**Crie o token e me avise quando estiver pronto!** 😊
























