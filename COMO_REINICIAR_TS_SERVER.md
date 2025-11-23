# Como Reiniciar o Servidor TypeScript no VS Code

## ⚠️ IMPORTANTE: Não execute no terminal!

O comando `TypeScript: Restart TS Server` **NÃO** é um comando de terminal/PowerShell.
Ele é um comando do **VS Code** que deve ser executado através da **Paleta de Comandos**.

## ✅ Forma Correta:

### Opção 1: Paleta de Comandos (Recomendado)
1. **Pressione:** `Ctrl + Shift + P` (ou `F1`)
2. **Digite:** `TypeScript: Restart TS Server`
3. **Pressione:** `Enter`

### Opção 2: Recarregar a Janela
1. **Pressione:** `Ctrl + Shift + P`
2. **Digite:** `Developer: Reload Window`
3. **Pressione:** `Enter`

### Opção 3: Atalho de Teclado
- Pressione `Ctrl + Shift + P` e depois digite apenas `ts` para filtrar os comandos TypeScript

## 🔍 Verificar se Funcionou:

Após reiniciar o TS Server, você deve ver:
- Os erros de TypeScript desaparecendo gradualmente
- O IntelliSense funcionando novamente
- As importações sendo reconhecidas

## 📝 Se Ainda Houver Problemas:

Execute estes comandos no terminal (PowerShell):

```powershell
# Limpar cache do TypeScript
cd workspace\veredicta
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .tsbuildinfo -ErrorAction SilentlyContinue

# Depois, no VS Code:
# 1. Feche todos os arquivos TypeScript
# 2. Pressione Ctrl+Shift+P
# 3. Execute "TypeScript: Restart TS Server"
```





