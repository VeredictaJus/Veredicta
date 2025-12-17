# 🚀 INSTRUÇÕES PARA RESTAURAR O GIT AGORA

## ⚡ EXECUTE ESTES COMANDOS NO POWERSHELL:

Copie e cole **TODOS** os comandos abaixo no PowerShell, **um por vez**:

```powershell
# 1. Navegar para o workspace
cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace"

# 2. Inicializar Git
git init

# 3. Configurar branch
git branch -M main

# 4. Configurar remote
git remote remove origin
git remote add origin https://github.com/VeredictaJus/Veredicta.git

# 5. Adicionar arquivos
git add .

# 6. Fazer commit
git commit -m "Restore repository"

# 7. Fazer push (com token)
$token = "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"
git push "https://${token}@github.com/VeredictaJus/Veredicta.git" main --force
```

## ✅ OU USE O SCRIPT AUTOMÁTICO:

1. Abra o PowerShell
2. Navegue até a pasta workspace:
   ```powershell
   cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace"
   ```
3. Execute o script:
   ```powershell
   .\EXECUTAR_AGORA.ps1
   ```

## 🎯 RESULTADO ESPERADO:

Após executar, você deve ver:
- ✅ Git inicializado
- ✅ Branch configurada
- ✅ Remote configurado
- ✅ Arquivos adicionados
- ✅ Commit realizado
- ✅ Push realizado com sucesso!

Depois, verifique em: https://github.com/VeredictaJus/Veredicta



