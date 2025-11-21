# Forçar Atualização das Cores dos Artigos

## ✅ Correções Aplicadas:

1. Todos os textos mudados de `text-gray-700` para `text-gray-900` com `font-medium`
2. Todos os Cards com `!bg-white` adicionado
3. Background principal com `style={{ backgroundColor: '#f9fafb' }}`
4. Subtítulos padronizados com `text-gray-800` e `font-medium`

## 🔄 Se as cores ainda não aparecem, execute:

### 1. Parar o servidor completamente:
```powershell
# No terminal onde o servidor está rodando, pressione:
Ctrl + C
```

### 2. Limpar TODOS os caches:
```powershell
cd workspace\veredicta

# Limpar cache do Vite
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# Limpar cache do build
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Limpar cache do TypeScript
Remove-Item -Force .tsbuildinfo -ErrorAction SilentlyContinue
```

### 3. Limpar cache do navegador COMPLETAMENTE:
- **Chrome/Edge:**
  1. `Ctrl + Shift + Delete`
  2. Selecione "Todo o período"
  3. Marque TUDO (Cache, Cookies, etc.)
  4. Clique em "Limpar dados"

- **Ou use modo anônimo:**
  - `Ctrl + Shift + N` (Chrome) ou `Ctrl + Shift + P` (Edge)
  - Acesse os artigos no modo anônimo

### 4. Reiniciar o servidor:
```powershell
npm run dev
```

### 5. Acessar os artigos:
- Abra em modo anônimo ou após limpar cache
- Use `Ctrl + F5` para hard refresh em cada página

## 🎯 Verificação:

Os artigos devem ter:
- ✅ Fundo cinza claro (`#f9fafb`)
- ✅ Cards com fundo branco
- ✅ Textos em cinza escuro (`text-gray-900`)
- ✅ Subtítulos em `text-gray-800` com `font-medium`

## ⚠️ Se ainda não funcionar:

Pode ser um problema de CSS global. Nesse caso, podemos adicionar estilos inline mais fortes com `!important` diretamente no código.


