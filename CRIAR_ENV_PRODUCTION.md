# 🔧 Como Criar o Arquivo .env.production

## ⚠️ Problema com Arquivos Bloqueados

Se você está tendo problemas com arquivos `.env` bloqueados (geralmente pelo OneDrive ou Windows), siga estes passos:

---

## 📝 Método 1: Criar Manualmente (Recomendado)

### Passo 1: Abrir o VS Code ou Editor de Texto

### Passo 2: Criar Novo Arquivo
1. No VS Code, clique em **File > New File**
2. Ou clique com botão direito na pasta `workspace/veredicta` > **New File**

### Passo 3: Nomear o Arquivo
Nomeie exatamente como: **`.env.production`** (com o ponto no início)

### Passo 4: Copiar o Conteúdo
Copie o conteúdo do arquivo `env.production.template` que está na raiz do projeto e cole no `.env.production`

### Passo 5: Substituir as Chaves
Substitua os valores:
- `re_SUA_CHAVE_RESEND_AQUI` → Sua chave real do Resend
- `pk_live_SUA_CHAVE_STRIPE_PUBLICA_AQUI` → Sua chave pública do Stripe

### Passo 6: Salvar
Salve o arquivo (Ctrl + S)

---

## 📝 Método 2: Via Terminal (PowerShell)

```powershell
# Navegar até a pasta do projeto
cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace\veredicta"

# Copiar o template
Copy-Item "env.production.template" ".env.production"

# Desbloquear o arquivo
Unblock-File -Path ".env.production"

# Abrir no editor para editar
code .env.production
```

---

## 📝 Método 3: Desbloquear Arquivos Existentes

Se você já tem arquivos `.env` bloqueados:

```powershell
# Desbloquear todos os arquivos .env
Get-ChildItem -Path . -Filter ".env*" -Force | ForEach-Object {
    Unblock-File -Path $_.FullName
    Write-Host "Desbloqueado: $($_.Name)"
}

# Remover atributo somente leitura
Get-ChildItem -Path . -Filter ".env*" -Force | ForEach-Object {
    $_.IsReadOnly = $false
    Write-Host "Somente leitura removido de: $($_.Name)"
}
```

---

## 🔒 Desabilitar Bloqueio do OneDrive

Se o OneDrive está bloqueando arquivos automaticamente:

### Opção 1: Desabilitar Proteção do OneDrive
1. Clique com botão direito no ícone do OneDrive na bandeja do sistema
2. Vá em **Settings > Files On-Demand**
3. Desmarque opções de sincronização automática

### Opção 2: Excluir Pasta do OneDrive (Mais Seguro)
Mova o projeto para uma pasta fora do OneDrive:
- Exemplo: `C:\Projetos\veredicta\`

### Opção 3: Configurar .gitignore para Ignorar
Os arquivos `.env*` já estão no `.gitignore`, então não serão sincronizados pelo Git.

---

## ✅ Verificação

Após criar o arquivo, verifique:

```powershell
# Ver se o arquivo existe
Test-Path ".env.production"

# Ver propriedades do arquivo
Get-ItemProperty ".env.production" | Select-Object Name, IsReadOnly, Attributes
```

---

## 🚀 Após Criar o .env.production

1. Edite o arquivo e preencha suas chaves reais
2. Salve o arquivo
3. Execute o build:
   ```bash
   npm run build
   ```
4. O Vite vai usar automaticamente as variáveis do `.env.production` durante o build

---

## 🆘 Ainda com Problemas?

Se ainda tiver problemas:

1. **Crie o arquivo fora do OneDrive** e depois mova
2. **Use o Notepad** para criar (mais simples que VS Code às vezes)
3. **Verifique permissões** da pasta
4. **Desabilite temporariamente o antivírus** durante a criação

Me avise se conseguir ou se precisa de mais ajuda!




























