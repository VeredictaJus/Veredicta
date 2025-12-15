# Como Zerar o Cache

## 🔧 Limpar Cache do Vite

### Opção 1: Forçar rebuild (limpa cache automaticamente)
```powershell
cd workspace/veredicta
Remove-Item -Recurse -Force node_modules/.vite
pnpm dev
```

### Opção 2: Limpar cache manualmente
```powershell
cd workspace/veredicta
Remove-Item -Recurse -Force node_modules/.vite
Remove-Item -Recurse -Force dist
```

### Opção 3: Limpar tudo e reinstalar
```powershell
cd workspace/veredicta
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force node_modules/.vite
Remove-Item -Recurse -Force dist
pnpm install
```

## 🌐 Limpar Cache do Navegador

### Chrome/Edge:
- `Ctrl + Shift + Delete` → Marque "Imagens e arquivos em cache" → Limpar dados

### Ou pelo DevTools:
- `F12` → Abra a aba "Network" → Clique com botão direito → "Clear browser cache"
- Ou `Ctrl + F5` para hard refresh (limpa cache da página atual)

### Firefox:
- `Ctrl + Shift + Delete` → Marque "Cache" → Limpar agora

## 📦 Limpar Cache do pnpm
```powershell
pnpm store prune
```

## 🗑️ Limpar tudo de uma vez (Comando Completo)
```powershell
cd workspace/veredicta
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
pnpm dev
```

## ⚠️ Problema: Caminhos Longos no Windows

Se você encontrar erros ao tentar remover `node_modules` (erros de "caminho muito longo"), use uma destas soluções:

### Solução 1: Usar robocopy (Recomendado)
```powershell
cd workspace/veredicta
# Criar pasta vazia temporária
New-Item -ItemType Directory -Force -Path empty_temp
# Usar robocopy para "limpar" a pasta (mais rápido e confiável)
robocopy empty_temp node_modules /MIR
Remove-Item -Recurse -Force empty_temp
Remove-Item -Recurse -Force node_modules
```

### Solução 2: Usar rimraf (via npm/pnpm)
```powershell
cd workspace/veredicta
pnpm add -D rimraf
pnpm exec rimraf node_modules
```

### Solução 3: Habilitar caminhos longos no Windows (Permanente)
1. Abra o Editor de Registro (`regedit`)
2. Navegue até: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem`
3. Crie/modifique: `LongPathsEnabled` = `1` (DWORD)
4. Reinicie o computador

### ⚡ Solução Rápida: Apenas limpar cache (SEM remover node_modules)
```powershell
cd workspace/veredicta
# Limpar apenas cache do Vite (suficiente na maioria dos casos)
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
pnpm dev
```

