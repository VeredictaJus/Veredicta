# 🔧 Restaurar Repositório Git - Guia Completo

## ❌ O que aconteceu?

Você mencionou que **antes conseguia fazer commit e push**, mas agora não consegue mais. Isso significa que:

1. **O repositório Git foi perdido ou deletado** (provavelmente a pasta `.git` foi removida)
2. **Pode ter sido causado por**:
   - Sincronização do OneDrive
   - Limpeza acidental de arquivos
   - Movimentação de pastas
   - Problema de permissões

## ✅ Solução: Restaurar o Repositório

### Opção 1: Usar o Script Automático (Mais Fácil)

1. **Abra o PowerShell** (como Administrador, se possível)
2. **Navegue até a pasta workspace**:
   ```powershell
   cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace"
   ```
3. **Execute o script de restauração**:
   ```powershell
   .\restaurar_git.ps1
   ```
4. **Siga as instruções** que aparecerem na tela

### Opção 2: Comandos Manuais (Passo a Passo)

Execute estes comandos **um por vez** no PowerShell:

```powershell
# 1. Navegar até a pasta workspace
cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace"

# 2. Inicializar repositório Git (se não existir)
git init

# 3. Configurar branch principal
git branch -M main

# 4. Adicionar remote do GitHub
git remote add origin https://github.com/VeredictaJus/Veredicta.git

# 5. Verificar se o remote foi adicionado
git remote -v

# 6. Adicionar todos os arquivos
git add .

# 7. Fazer commit inicial
git commit -m "Restore repository"

# 8. Fazer push (pode pedir autenticação)
git push -u origin main
```

### Opção 3: Usar Token do GitHub (Se pedir autenticação)

Se o passo 8 pedir autenticação, use o token que estava no script:

```powershell
# Definir token
$token = "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"

# Fazer push com token
git push https://${token}@github.com/VeredictaJus/Veredicta.git main
```

**⚠️ IMPORTANTE**: Se esse token não funcionar mais, você precisa criar um novo:
1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Dê um nome (ex: "Veredicta Local")
4. Marque a opção `repo`
5. Clique em "Generate token"
6. **COPIE O TOKEN** (você só verá uma vez!)
7. Use no lugar do token antigo

## 🔍 Verificar se Funcionou

Após fazer push, verifique:

1. **Acesse o GitHub**: https://github.com/VeredictaJus/Veredicta
2. **Você deve ver** todos os arquivos do projeto lá
3. **O histórico anterior pode estar perdido**, mas você pode continuar trabalhando normalmente

## 📝 Próximos Commits

Depois de restaurar, para fazer commits e push normalmente:

```powershell
# 1. Adicionar arquivos modificados
git add .

# OU adicionar arquivo específico
git add veredicta/src/pages/client/ClientDashboard.tsx

# 2. Fazer commit
git commit -m "Sua mensagem de commit aqui"

# 3. Fazer push
git push origin main
```

## 🆘 Problemas Comuns

### Erro: "fatal: not a git repository"
**Solução**: Você não está na pasta correta. Certifique-se de estar em `workspace` (não em `workspace/veredicta`)

### Erro: "remote origin already exists"
**Solução**: Execute:
```powershell
git remote remove origin
git remote add origin https://github.com/VeredictaJus/Veredicta.git
```

### Erro: "authentication failed"
**Solução**: Use o token do GitHub (veja Opção 3 acima)

### Erro: "failed to push some refs"
**Solução**: Pode ser que o repositório no GitHub tenha commits que você não tem localmente. Execute:
```powershell
git pull origin main --allow-unrelated-histories
git push origin main
```

## ✅ Checklist

- [ ] Naveguei até a pasta `workspace`
- [ ] Executei `git init`
- [ ] Configurei o remote `origin`
- [ ] Fiz `git add .`
- [ ] Fiz o primeiro commit
- [ ] Fiz push para o GitHub
- [ ] Verifiquei no GitHub que os arquivos estão lá

## 💡 Dica

Para evitar perder o repositório Git novamente:

1. **Não mova a pasta `.git`** manualmente
2. **Tenha cuidado com limpezas automáticas** do OneDrive
3. **Faça backup regular** do repositório
4. **Use GitHub Desktop** para facilitar o gerenciamento

---

**Se ainda tiver problemas, me diga qual erro apareceu e eu ajudo a resolver!** 😊

