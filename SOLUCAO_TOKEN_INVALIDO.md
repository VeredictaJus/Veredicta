# 🔑 Solução: Token do GitHub Inválido

## ❌ Problema

O token do GitHub que estava no script expirou ou está inválido. A mensagem de erro foi:

```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed
```

## ✅ Boa Notícia!

O **hook automático foi configurado com sucesso!** Agora só precisamos atualizar o token.

## 🚀 Solução Rápida

### Passo 1: Criar Novo Token no GitHub

1. **Acesse**: https://github.com/settings/tokens
2. **Clique** em **"Generate new token (classic)"**
3. **Dê um nome**: `Veredicta Local` (ou qualquer nome)
4. **Selecione permissões**:
   - ✅ Marque **"repo"** (todas as permissões de repositório)
5. **Clique** em **"Generate token"**
6. **COPIE O TOKEN** (começa com `ghp_` - você só verá uma vez!)

### Passo 2: Executar Script de Atualização

Execute o script que atualiza o token:

```powershell
cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace"
.\atualizar_token_e_push.ps1
```

O script vai:
1. Pedir o novo token
2. Atualizar o remote do Git
3. Atualizar o hook automático
4. Fazer o push para o GitHub

### Passo 3: Ou Fazer Manualmente

Se preferir fazer manualmente:

```powershell
# 1. Configurar remote com novo token
$token = "SEU_NOVO_TOKEN_AQUI"
git remote set-url origin "https://${token}@github.com/VeredictaJus/Veredicta.git"

# 2. Fazer push
git push -u origin main

# 3. Atualizar hook (opcional, para manter automático)
# Edite: .git/hooks/post-commit
# Substitua o token antigo pelo novo
```

## ✅ Depois de Atualizar

Após atualizar o token, tudo voltará a funcionar:

- ✅ Push manual funcionará
- ✅ Push automático após commit funcionará
- ✅ Você terá o mesmo comportamento de antes!

## 🔒 Segurança

**IMPORTANTE**: 
- ❌ **NUNCA** compartilhe seu token
- ❌ **NUNCA** commite o token no Git
- ✅ O token fica apenas no seu computador local
- ✅ Se o token vazar, revogue imediatamente no GitHub

## 🆘 Se Ainda Não Funcionar

1. Verifique se o token tem permissão `repo`
2. Verifique se você tem acesso ao repositório `VeredictaJus/Veredicta`
3. Tente criar um novo token novamente
4. Me diga qual erro apareceu!

